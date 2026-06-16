import { app, BrowserWindow, ipcMain, shell, protocol, net } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as tbhSave from './tbh-save.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = __dirname;
const DATA = app.getPath('userData');
const APPID = 3678970; // TBH: Task Bar Hero

// Cache settings
const LIST_TTL_MS = 5 * 60 * 1000;
const PRICE_TTL_MS = 5 * 60 * 1000;
const DETAIL_TTL_MS = 30 * 60 * 1000;
const FX_TTL_MS = 6 * 60 * 60 * 1000;
const STEAM_MIN_INTERVAL_MS = 1400;
const STEAM_MAX_RETRIES = 4;
const UA = 'tbh-easy-market-desktop/1.0 (uso pessoal read-only)';

fs.mkdirSync(DATA, { recursive: true });
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(path.join(DATA, 'app.log'), line + '\n'); } catch {}
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const CACHE_PATH = path.join(DATA, `items-${APPID}-v2.json`);
const CATALOG_PATH = path.join(DATA, `market-catalog-${APPID}-v2.json`);
const DETAIL_CACHE_PATH = path.join(DATA, `market-details-${APPID}.json`);
const FX_CACHE_PATH = path.join(DATA, 'exchange-rates.json');

const priceCache = new Map();
const detailCache = new Map();
let refreshing = null;
let fxRefreshing = null;
let steamQueue = Promise.resolve();
let steamLastRequestAt = 0;
let steamCooldownUntil = 0;
let detailWriteTimer = null;

function readJson(file, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJsonAtomic(file, value) {
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value));
  fs.renameSync(temp, file);
}

function hydrateDetailCache() {
  const saved = readJson(DETAIL_CACHE_PATH, {});
  for (const [name, entry] of Object.entries(saved.details || {})) {
    if (entry?.data) detailCache.set(name, entry);
  }
}

function persistDetailCacheSoon() {
  clearTimeout(detailWriteTimer);
  detailWriteTimer = setTimeout(() => {
    const details = Object.fromEntries(detailCache);
    try { writeJsonAtomic(DETAIL_CACHE_PATH, { version: 1, updatedAt: Date.now(), details }); }
    catch (e) { log(`detail cache write failed: ${e.message}`); }
  }, 250);
}

hydrateDetailCache();

function queueSteamRequest(task) {
  const run = async () => {
    const wait = Math.max(0, steamCooldownUntil - Date.now(), STEAM_MIN_INTERVAL_MS - (Date.now() - steamLastRequestAt));
    if (wait) await sleep(wait);
    steamLastRequestAt = Date.now();
    return task();
  };
  const queued = steamQueue.then(run, run);
  steamQueue = queued.catch(() => {});
  return queued;
}

async function steamFetch(url, accept, parser) {
  let lastError;
  for (let attempt = 0; attempt <= STEAM_MAX_RETRIES; attempt++) {
    try {
      return await queueSteamRequest(async () => {
        const res = await fetch(url, {
          headers: { 'User-Agent': UA, Accept: accept },
          signal: AbortSignal.timeout(15000),
        });
        if (res.status === 429) {
          const retrySeconds = Number(res.headers.get('retry-after')) || 0;
          const backoff = retrySeconds * 1000 || Math.min(120000, 4000 * (2 ** attempt));
          const jitter = Math.floor(Math.random() * 1200);
          steamCooldownUntil = Math.max(steamCooldownUntil, Date.now() + backoff + jitter);
          throw Object.assign(new Error('rate-limited'), { code: 429, retryMs: backoff + jitter });
        }
        if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { code: res.status });
        return parser(res);
      });
    } catch (e) {
      lastError = e;
      if (e.code !== 429 || attempt === STEAM_MAX_RETRIES) break;
      if (attempt === 0) log(`Steam rate limit; cooling down before retry`);
      await sleep(Math.max(0, steamCooldownUntil - Date.now()));
    }
  }
  throw lastError;
}

async function steamGet(url) {
  return steamFetch(url, 'application/json', res => res.json());
}

async function steamGetText(url) {
  return steamFetch(url, 'text/html', res => res.text());
}

function readListCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch { return null; }
}

function readLegacyListCache() {
  const legacyPath = path.join(DATA, `items-${APPID}.json`);
  try { return JSON.parse(fs.readFileSync(legacyPath, 'utf8')); } catch { return null; }
}

function readCatalog() {
  return readJson(CATALOG_PATH, { version: 1, updatedAt: 0, items: [] });
}

function updateCatalog(activeItems) {
  const previous = readCatalog();
  const byHash = new Map((previous.items || []).map(item => [item.hash, {
    ...item,
    active: false,
    priceCents: null,
    priceText: null,
    listings: 0,
  }]));
  for (const item of activeItems) {
    const old = byHash.get(item.hash) || {};
    byHash.set(item.hash, {
      ...old,
      ...item,
      active: true,
      firstSeenAt: old.firstSeenAt || Date.now(),
      lastSeenAt: Date.now(),
      lastSeenPriceCents: item.priceCents,
    });
  }
  const catalog = { version: 1, updatedAt: Date.now(), items: [...byHash.values()] };
  writeJsonAtomic(CATALOG_PATH, catalog);
  return catalog;
}

function catalogItemsForStash() {
  const catalog = readCatalog();
  if (catalog.items?.length) return catalog.items;
  const current = readListCache() || readLegacyListCache();
  if (current?.items?.length) return updateCatalog(current.items).items;
  return [];
}

async function fetchAllItems() {
  const items = [];
  let start = 0, total = Infinity;
  while (start < total) {
    const url = `https://steamcommunity.com/market/search/render/?appid=${APPID}&norender=1&count=100&start=${start}&sort_column=price&sort_dir=desc&country=US&currency=1`;
    let j;
    try {
      j = await steamGet(url);
    } catch (e) {
      if (e.code === 429 && items.length) { log(`429 na pagina start=${start} — entregando parcial (${items.length})`); break; }
      throw e;
    }
    if (!j?.success) throw new Error('steam respondeu success=false');
    total = j.total_count ?? 0;
    for (const r of j.results || []) {
      const d = r.asset_description || {};
      if (!(r.sell_price > 0)) continue;
      items.push({
        name: r.name,
        hash: r.hash_name,
        priceCents: r.sell_price,
        priceText: r.sell_price_text,
        listings: r.sell_listings,
        type: d.type || '',
        color: d.name_color || '',
        icon: d.icon_url ? `https://community.fastly.steamstatic.com/economy/image/${d.icon_url}/96fx96f` : '',
        url: `https://steamcommunity.com/market/listings/${APPID}/${encodeURIComponent(r.hash_name)}`,
      });
    }
    const got = (j.results || []).length;
    if (!got) break;
    start += got;
    if (items.length % 100 < got) log(`mercado TBH: ${items.length}/${total} itens`);
  }
  items.sort((a, b) => b.priceCents - a.priceCents);
  const payload = { appid: APPID, fetchedAt: Date.now(), total: items.length, items };
  writeJsonAtomic(CACHE_PATH, payload);
  updateCatalog(items);
  return payload;
}

function refreshDedup() {
  if (!refreshing) refreshing = fetchAllItems().finally(() => { refreshing = null; });
  return refreshing;
}

async function apiItems(query = {}) {
  const force = query.refresh;
  const cached = readListCache();
  const fresh = cached && (Date.now() - cached.fetchedAt) < LIST_TTL_MS;
  if (force && cached) {
    refreshDedup().catch(e => log(`refresh bg falhou: ${e.message}`));
    return { ...cached, items: cached.items.filter(item => item.priceCents > 0), stale: true, refreshing: true };
  }
  if (cached && fresh && !force) return { ...cached, items: cached.items.filter(item => item.priceCents > 0), stale: false };
  if (cached && !force) {
    refreshDedup().catch(e => log(`refresh bg falhou: ${e.message}`));
    return { ...cached, items: cached.items.filter(item => item.priceCents > 0), stale: true, refreshing: true };
  }
  try {
    const result = await refreshDedup();
    return { ...result, items: result.items.filter(item => item.priceCents > 0), stale: false };
  } catch (e) {
    const legacy = readLegacyListCache();
    if (legacy) return { ...legacy, items: legacy.items.filter(item => item.priceCents > 0), stale: true, fallback: true };
    throw e;
  }
}

async function apiPrice(query = {}) {
  const name = query.name || '';
  if (!name) throw new Error('name obrigatorio');
  const hit = priceCache.get(name);
  if (hit && (Date.now() - hit.at) < PRICE_TTL_MS) return hit.data;
  const url = `https://steamcommunity.com/market/priceoverview/?appid=${APPID}&currency=7&market_hash_name=${encodeURIComponent(name)}`;
  const j = await steamGet(url);
  const data = { name, brl: j.lowest_price || null, medianBrl: j.median_price || null, volume: j.volume || null };
  priceCache.set(name, { at: Date.now(), data });
  return data;
}

async function fetchMarketDetail(name) {
  const hit = detailCache.get(name);
  if (hit && (Date.now() - hit.at) < DETAIL_TTL_MS) return hit.data;
  const url = `https://steamcommunity.com/market/listings/${APPID}/${encodeURIComponent(name)}`;
  const html = await steamGetText(url);
  const buy = html.match(/amtMaxBuyOrder\D+(\d+)/);
  const history = [...html.matchAll(/time\D+(\d+)\D+price_median\D+([0-9.]+)\D+purchases\D+(\d+)/g)];
  const latest = history.at(-1);
  const data = {
    name,
    buyBrlCents: buy ? Number(buy[1]) : 0,
    latestBrlCents: latest ? Math.round(Number(latest[2]) * 100) : 0,
    latestAt: latest ? Number(latest[1]) * 1000 : 0,
    latestPurchases: latest ? Number(latest[3]) : 0,
  };
  detailCache.set(name, { at: Date.now(), data });
  persistDetailCacheSoon();
  return data;
}

async function apiMarketDetails(query = {}) {
  const names = [...new Set((query.names || []).filter(Boolean))].slice(0, 50);
  const details = [];
  for (const name of names) {
    const cached = detailCache.get(name);
    try {
      details.push(await fetchMarketDetail(name));
    } catch (e) {
      if (cached?.data) details.push({ ...cached.data, stale: true });
      else details.push({ name, error: true, rateLimited: e.code === 429 });
      if (e.code !== 429) log(`detail ${name}: ${e.message}`);
    }
  }
  return { details };
}

function readFxCache() {
  try { return JSON.parse(fs.readFileSync(FX_CACHE_PATH, 'utf8')); } catch { return null; }
}

async function fetchExchangeRates() {
  const res = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
    headers: { 'User-Agent': UA, 'Accept': 'application/xml,text/xml' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`ECB HTTP ${res.status}`);
  const xml = await res.text();
  const eurRates = { EUR: 1 };
  for (const match of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([0-9.]+)['"]/g)) {
    eurRates[match[1]] = Number(match[2]);
  }
  if (!(eurRates.USD > 0)) throw new Error('ECB response missing USD rate');
  const rates = Object.fromEntries(Object.entries(eurRates).map(([code, rate]) => [code, rate / eurRates.USD]));
  rates.USD = 1;
  const date = xml.match(/time=['"]([^'"]+)['"]/)?.[1] || null;
  const data = { base: 'USD', date, fetchedAt: Date.now(), source: 'European Central Bank', rates };
  fs.writeFileSync(FX_CACHE_PATH, JSON.stringify(data));
  return data;
}

async function apiExchangeRates() {
  const cached = readFxCache();
  if (cached && (Date.now() - cached.fetchedAt) < FX_TTL_MS) return cached;
  try {
    if (!fxRefreshing) fxRefreshing = fetchExchangeRates().finally(() => { fxRefreshing = null; });
    return await fxRefreshing;
  } catch (e) {
    if (cached) return { ...cached, stale: true };
    throw e;
  }
}

// ---- ELECTRON INTEGRATION ----

let mainWindow;
const WINDOW_STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');

function saveWindowState() {
  if (!mainWindow) return;
  const state = {
    bounds: mainWindow.getBounds(),
    maximized: mainWindow.isMaximized(),
  };
  try { fs.writeFileSync(WINDOW_STATE_FILE, JSON.stringify(state)); } catch {}
}

function loadWindowState() {
  try { return JSON.parse(fs.readFileSync(WINDOW_STATE_FILE, 'utf8')); } catch { return null; }
}

function createWindow() {
  const state = loadWindowState() || { bounds: { width: 1320, height: 800 } };

  mainWindow = new BrowserWindow({
    width: state.bounds.width,
    height: state.bounds.height,
    x: state.bounds.x,
    y: state.bounds.y,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'icon', 'tbh-easymarket-icon-nobg.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  if (state.maximized) {
    mainWindow.maximize();
  }

  mainWindow.setMenuBarVisibility(false);

  // Security: prevent opening links inside the app, force default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL('app://-/public/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1.25);
  });

  let saveTimeout;
  mainWindow.on('resize', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveWindowState, 500);
  });
  mainWindow.on('move', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveWindowState, 500);
  });
  mainWindow.on('close', saveWindowState);
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    let urlPath = new URL(request.url).pathname;
    if (urlPath.startsWith('/')) urlPath = urlPath.slice(1);
    return net.fetch('file:///' + path.join(__dirname, urlPath).replace(/\\/g, '/'));
  });
  // IPC handlers setup
  ipcMain.handle('api:version', () => app.getVersion());
  ipcMain.handle('api:items', async (event, query) => {
    return await apiItems(query);
  });
  
  ipcMain.handle('api:price', async (event, query) => {
    return await apiPrice(query);
  });
  
  ipcMain.handle('api:market-details', async (event, query) => {
    return await apiMarketDetails(query);
  });
  
  ipcMain.handle('api:exchange-rates', async (event) => {
    return await apiExchangeRates();
  });
  
  ipcMain.handle('api:stash', async (event) => {
    if (!tbhSave.saveExists()) return { supported: true, found: false };
    const market = readListCache() || readLegacyListCache();
    if (!market) return { supported: true, found: true, needItems: true };
    return { supported: true, found: true, ...tbhSave.readStash(catalogItemsForStash()) };
  });

  ipcMain.handle('api:prices-status', () => {
    return {
      updatedAt: state.updatedAt,
      error: state.error,
      refreshing: state.refreshing,
    };
  });

  // Auto-Updater Setup
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater:update-available', {
        version: info.version,
        isPortable: process.env.PORTABLE_EXECUTABLE_DIR !== undefined
      });
    }
  });
  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) {
      mainWindow.webContents.send('updater:download-progress', progressObj.percent);
    }
  });
  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) {
      mainWindow.webContents.send('updater:update-downloaded');
    }
  });
  
  // Wait a bit before checking updates so the window can load completely
  setTimeout(() => {
    const checkUpdate = () => autoUpdater.checkForUpdates().catch(e => log(`Update check error: ${e.message}`));
    checkUpdate();
    // Re-check every 10 minutes
    setInterval(checkUpdate, 10 * 60 * 1000);
  }, 3000);

  ipcMain.handle('updater:start-download', () => {
    autoUpdater.downloadUpdate().catch(e => log(`Download error: ${e.message}`));
  });
  ipcMain.handle('updater:install-update', () => {
    autoUpdater.quitAndInstall(true, true);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
