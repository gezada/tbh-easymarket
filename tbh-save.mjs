// tbh-save.mjs — leitura READ-ONLY do baú do TBH: Task Bar Hero
// NÃO escreve no save, NÃO toca o processo do jogo, NÃO modifica nada.
// Só decifra uma cópia em memória do SaveFile_Live.es3 e cruza com a tabela de itens do jogo.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SAVE_DIR = path.join(os.homedir(), 'AppData/LocalLow/TesseractStudio/TaskbarHero');
export const SAVE_FILE = path.join(SAVE_DIR, 'SaveFile_Live.es3');
const SAVE_NAMES_DIR = path.join(ROOT, 'data');
// Senha de descriptografia do save (Easy Save 3). NÃO é segredo do usuário — é uma chave do JOGO,
// guardada em texto plano dentro dos assets do TBH. A gente extrai sozinho (à prova de updates).
// Pode forçar via env TBH_ES3_PASSWORD se a auto-extração falhar.
let _es3pw = null;
function getES3Password() {
  if (process.env.TBH_ES3_PASSWORD) return process.env.TBH_ES3_PASSWORD;
  if (_es3pw) return _es3pw;
  const dir = findGameDataDir();
  // a chave fica em resources.assets logo após "ES3Defaults ... SaveFile_Live.es3 <CHAVE>"
  for (const f of ['resources.assets', 'sharedassets0.assets', 'globalgamemanagers.assets']) {
    try {
      const t = fs.readFileSync(path.join(dir, f), 'latin1');
      const m = t.match(/ES3Defaults[\s\S]{0,80}?SaveFile_Live\.es3[^\x21-\x7e]+([\x21-\x7e]{8,40})/);
      if (m) { _es3pw = m[1]; return _es3pw; }
    } catch {}
  }
  // fallback: chave conhecida na versão atual do jogo (re-extrair se o jogo atualizar)
  return 'emuMqG3bLYJ938ZDCfieWJ';
}

// Descobre a pasta de instalação do TBH varrendo as bibliotecas Steam de qualquer drive.
// Funciona pra todo mundo (a Steam de cada um está num lugar) — não hardcoda o PC do dev.
function findGameDataDir() {
  if (process.env.TBH_GAME_DIR && fs.existsSync(process.env.TBH_GAME_DIR)) return process.env.TBH_GAME_DIR;
  const rel = 'steamapps/common/TaskbarHero/TaskBarHero_Data';
  const roots = [];
  // raízes comuns de instalação Steam por drive
  for (const drive of ['C', 'D', 'E', 'F', 'G', 'H']) {
    roots.push(`${drive}:/Steam`, `${drive}:/SteamLibrary`, `${drive}:/Program Files (x86)/Steam`, `${drive}:/Games/Steam`);
  }
  for (const r of roots) { const p = path.join(r, rel); if (fs.existsSync(p)) return p; }
  return null;
}
const ASSET_CANDIDATES = (() => { const d = findGameDataDir(); return d ? [path.join(d, 'sharedassets0.assets')] : []; })();

const GRADE_MAP = { DIVINE:'Divine', ARCANA:'Arcana', IMMORTAL:'Immortal', LEGENDARY:'Legendary', BEYOND:'Beyond', UNIQUE:'Unique', EPIC:'Epic', RARE:'Rare', UNCOMMON:'Uncommon', COMMON:'Common' };

function decryptES3(buf, password) {
  const iv = buf.subarray(0, 16);
  const data = buf.subarray(16);
  const key = crypto.pbkdf2Sync(password, iv, 100, 16, 'sha1');
  const dec = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let out = Buffer.concat([dec.update(data), dec.final()]);
  if (out[0] === 0x1f && out[1] === 0x8b) out = zlib.gunzipSync(out);
  return out;
}

// Tabela mestra de itens do jogo: ItemKey -> { GRADE, GEARTYPE, Level, IsCanExchangeMarketable, ... }
let _itemTable = null;
function loadItemTable() {
  if (_itemTable) return _itemTable;
  // 1) usa cache gerado por scripts/extract-tbh-tables.mjs se existir (rápido)
  const cacheP = path.join(SAVE_NAMES_DIR, 'tbh-itemtable.json');
  if (fs.existsSync(cacheP)) {
    try { const arr = JSON.parse(fs.readFileSync(cacheP, 'utf8')); _itemTable = {}; for (const r of arr) _itemTable[r.ItemKey] = r; return _itemTable; } catch {}
  }
  // 2) senão extrai direto dos assets do jogo (texto plano, sem Python)
  const assetPath = ASSET_CANDIDATES.find(p => fs.existsSync(p));
  if (!assetPath) throw new Error('assets do TBH não encontrados (jogo instalado em outra pasta? defina TBH_GAME_DIR)');
  const t = fs.readFileSync(assetPath, 'latin1');
  const hdr = 'ItemKey,ITEMTYPE,GRADE,PARTS,GEARTYPE,GearGroup,ItemSynthesisType,NameKey,DescriptionKey,GearKey,DropKey,DropCooldown,Level,IsSteamItem,IconPath,IsDeletedInServer,IsCanExchangeMarketable';
  const start = t.indexOf(hdr);
  if (start < 0) throw new Error('tabela de itens não encontrada nos assets');
  let e = start;
  while (e < t.length) { const c = t.charCodeAt(e); if ((c >= 0x20 && c <= 0x7e) || c === 10 || c === 13) e++; else break; }
  const lines = t.slice(start, e).split(/\r?\n/).filter(l => l.trim());
  const cols = lines[0].split(',');
  const map = {};
  for (const line of lines.slice(1)) {
    const p = line.split(',');
    if (!/^\d+$/.test(p[0])) continue;
    const o = {}; cols.forEach((c, i) => o[c] = p[i]);
    map[p[0]] = o;
  }
  _itemTable = map;
  return map;
}

// Índice do mercado por (GEARTYPE|GRADE|Level) -> item (equipamentos).
function buildMarketIndex(marketItems) {
  const idx = {};
  for (const m of marketItems) {
    const tm = m.type && m.type.match(/^(\w+)\s*-\s*Lv\.?\s*(\d+)/);
    const gm = (m.name.match(/\((\w+)\)/) || [])[1];
    if (tm && gm) idx[`${tm[1]}|${gm}|${tm[2]}`.toUpperCase()] = m;
  }
  return idx;
}

// Índice do mercado por nome lowercase (materiais têm nome próprio: "Void Iron", "Phoenix Ash"...).
function buildMarketByName(marketItems) {
  const idx = {};
  for (const m of marketItems) {
    idx[m.name.toLowerCase()] = m;
    // hash_name is always English regardless of API locale — crucial for legacy cache fallback
    if (m.hash) idx[m.hash.toLowerCase()] = m;
  }
  return idx;
}

// ItemKey -> nome localizado (materiais). Gerado por scripts/extract-tbh-tables.mjs.
let _itemNames = null;
function loadItemNames() {
  if (_itemNames) return _itemNames;
  const p = path.join(SAVE_NAMES_DIR, 'tbh-itemnames.json');
  try { _itemNames = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { _itemNames = {}; }
  return _itemNames;
}

const asArr = v => (typeof v === 'string' ? JSON.parse(v) : v);

function parsePlayerSaveData(value) {
  // Unity serializa IDs de 64 bits como numeros; JSON.parse os arredonda acima de 2^53,
  // podendo fazer itens distintos colidirem no indice por UniqueId.
  const exactIds = value.replace(/([:[,]\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"');
  return JSON.parse(exactIds);
}

export function saveExists() { return fs.existsSync(SAVE_FILE); }
export function saveMtime() { try { return fs.statSync(SAVE_FILE).mtimeMs; } catch { return 0; } }

// Lê o baú e devolve itens agregados por nome de mercado, com preço e total.
// marketItems = array do cache /api/items (pra cruzar preço).
export function readStash(marketItems) {
  if (!saveExists()) throw new Error('save do TBH não encontrado');
  const buf = fs.readFileSync(SAVE_FILE);
  const root = JSON.parse(decryptES3(buf, getES3Password()).toString('utf8'));
  const psd = parsePlayerSaveData(root.PlayerSaveData.value);

  const items = asArr(psd.itemSaveDatas);
  const byId = {}; for (const it of items) byId[it.UniqueId] = it;
  const slots = [
    ...asArr(psd.stashSaveDatas).map(s => ({ ...s, where: 'stash' })),
    ...asArr(psd.inventorySaveDatas).map(s => ({ ...s, where: 'inventory', ItemUniqueId: s.ItemUniqueId })),
  ].filter(s => s.ItemUniqueId && String(s.ItemUniqueId) !== '0');
  const slotIds = new Set(slots.map(slot => String(slot.ItemUniqueId)));
  const heroNames = { 101: 'Knight', 201: 'Ranger', 301: 'Sorcerer', 401: 'Priest', 501: 'Slayer', 601: 'Hunter' };
  const equippedSlots = asArr(psd.heroSaveDatas).flatMap(hero =>
    asArr(hero.equippedItemIds || []).map(ItemUniqueId => ({
      ItemUniqueId,
      where: 'equipped',
      hero: heroNames[hero.heroKey] || `Hero ${hero.heroKey}`,
    }))
  ).filter(slot => {
    const id = String(slot.ItemUniqueId);
    return id !== '0' && !slotIds.has(id);
  });

  const table = loadItemTable();
  const names = loadItemNames();
  const mkidx = buildMarketIndex(marketItems);
  const mkByName = buildMarketByName(marketItems);

  function aggregate(sourceSlots, equipped = false) {
    const agg = {}; // marketHash -> { name, priceCents, qty, kind }
    const unlistedAgg = {}; // ItemKey -> item conhecido no save, mas ausente do mercado
    let totalCents = 0, gearCents = 0, matCents = 0, priced = 0, unpriced = 0;
    const unknown = {};

    for (const slot of sourceSlots) {
      const it = byId[slot.ItemUniqueId];
      if (!it) continue;
      const r = table[it.ItemKey];
      let m = null, kind = null;
      // 1) equipamento: casa por (geartype|grade|level)
      if (r && r.GEARTYPE && r.Level) { m = mkidx[`${r.GEARTYPE}|${r.GRADE}|${r.Level}`.toUpperCase()]; kind = 'gear'; }
      // 2) material: casa por nome localizado
      if (!m) { const nm = names[it.ItemKey]; if (nm) { m = mkByName[nm.toLowerCase()]; if (m) kind = 'material'; } }
      if (m && m.active !== false && m.priceCents > 0) {
        const k = m.hash;
        if (!agg[k]) agg[k] = { name: m.name, hash: m.hash, priceCents: m.priceCents, priceText: m.priceText, type: m.type, icon: m.icon, color: m.color, url: m.url, qty: 0, kind, marketListed: true, marketable: true };
        agg[k].qty++;
        totalCents += m.priceCents; priced++;
        if (kind === 'material') matCents += m.priceCents; else gearCents += m.priceCents;
        if (equipped) {
          agg[k].equipped = true;
          agg[k].equippedQty = (agg[k].equippedQty || 0) + 1;
          agg[k].heroes = [...new Set([...(agg[k].heroes || []), slot.hero])];
        }
      } else {
        unpriced++;
        const nm = names[it.ItemKey];
        const label = nm || (r ? `${r.GEARTYPE || r.ITEMTYPE} ${r.GRADE} Lv${r.Level}`.trim() : `ItemKey ${it.ItemKey}`);
        unknown[label] = (unknown[label] || 0) + 1;
        const kind = r?.GEARTYPE && r?.Level ? 'gear' : 'material';
        const grade = r?.GRADE ? (GRADE_MAP[r.GRADE] || r.GRADE) : '';
        const gearType = r?.GEARTYPE
          ? `${r.GEARTYPE.charAt(0)}${r.GEARTYPE.slice(1).toLowerCase()}`
          : 'Equipment';
        const type = kind === 'gear'
          ? gearType
          : (r?.ITEMTYPE === 'MATERIAL' ? 'Material' : (r?.ITEMTYPE || 'Item'));
        const name = m?.name || nm || (kind === 'gear'
          ? `${gearType}${grade ? ` (${grade})` : ''}${r?.Level ? ` - Lv. ${r.Level}` : ''}`
          : label);
        const k = String(it.ItemKey);
        if (!unlistedAgg[k]) unlistedAgg[k] = {
          name, hash: m?.hash || name, priceCents: null, priceText: null, type: m?.type || type,
          icon: m?.icon || '', color: m?.color || '', url: m?.url || '', qty: 0, kind, grade, level: Number(r?.Level || 0),
          itemKey: k, marketListed: false, marketable: r?.IsCanExchangeMarketable === 'True', catalogKnown: Boolean(m?.hash),
          lastSeenPriceCents: m?.lastSeenPriceCents || 0, lastSeenAt: m?.lastSeenAt || 0,
        };
        unlistedAgg[k].qty++;
        if (equipped) {
          unlistedAgg[k].equipped = true;
          unlistedAgg[k].equippedQty = (unlistedAgg[k].equippedQty || 0) + 1;
          unlistedAgg[k].heroes = [...new Set([...(unlistedAgg[k].heroes || []), slot.hero])];
        }
      }
    }

    return {
      list: Object.values(agg).sort((a, b) => b.priceCents * b.qty - a.priceCents * a.qty),
      unlistedItems: Object.values(unlistedAgg).sort((a, b) => a.name.localeCompare(b.name)),
      totalCents, gearCents, matCents, priced, unpriced, unknown,
    };
  }

  const base = aggregate(slots);
  const equipped = aggregate(equippedSlots, true);
  const equippedItems = [...equipped.list, ...equipped.unlistedItems];
  return {
    fetchedAt: Date.now(),
    saveMtime: saveMtime(),
    totalCents: base.totalCents,
    gearCents: base.gearCents,
    matCents: base.matCents,
    totalItems: slots.length,
    pricedItems: base.priced,
    unpricedItems: base.unpriced,
    types: base.list.length,
    items: base.list,
    unlistedItems: base.unlistedItems,
    equippedItems,
    equippedCount: equippedSlots.length,
    equippedCents: equipped.totalCents,
    equippedGearCents: equipped.gearCents,
    equippedUnpricedItems: equipped.unpriced,
    unknownSummary: Object.entries(base.unknown).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, n]) => ({ label: k, qty: n })),
  };
}
