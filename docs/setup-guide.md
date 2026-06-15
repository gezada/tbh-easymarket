# Developer Setup Guide

> Everything you need to understand, build, and hack on TBH Easy Market.

---

## 1. Project Overview

**TBH Easy Market** is a free, open-source Electron desktop app for
[TBH: Task Bar Hero](https://store.steampowered.com/app/3678970/) (Steam AppID `3678970`).

It reads the player's local save file, decrypts the inventory, and cross-references it with
live Steam Community Market prices — giving you a real-time estimate of your stash value.

- Runs 100% locally on the user's machine.
- Strictly read-only: no accounts, no logins, no data leaves the computer.
- Ships as a portable `.exe` and an installer via electron-builder.

---

## 2. Golden Rules (READ THIS FIRST)

These are non-negotiable. Break any of them and you risk getting users banned or leaking their data.

1. **NEVER write to the save file.** Path: `%USERPROFILE%\AppData\LocalLow\TesseractStudio\TaskbarHero\SaveFile_Live.es3`.
   The app only calls `readFileSync` on a memory copy. Any write — even renaming, moving, or touching
   timestamps — could trigger anti-cheat and get the user banned. Don't do it.
2. **NEVER automate trading, inject into the game process, or access game memory.** This project is
   read-only. Keep it that way.
3. **NEVER upload user data.** The file `data/save-plain.json` (decrypted inventory) is in `.gitignore`.
   Never remove that line, never commit that file, never paste its contents anywhere public.
4. **NEVER ask users to disable antivirus, run as admin without reason, or paste tokens/passwords.**
5. **When in doubt between writing and reading — always read.**

---

## 3. Architecture

```
Electron Main Process (main.js)
├── tbh-save.mjs            → Save decryption + inventory parsing
├── Steam Market API         → Prices, listings, price history
├── ECB Exchange Rates API   → USD↔BRL (and 30+ currencies) via XML feed
├── Disk Cache (userData/)   → items, catalog, details, exchange rates
│     items-3678970-v2.json
│     market-catalog-3678970-v2.json
│     market-details-3678970.json
│     exchange-rates.json
└── IPC Bridge (preload.js)
    └── Renderer (public/index.html) → All UI logic lives in a single HTML file
```

Communication between main and renderer goes through Electron's `contextBridge` + `ipcRenderer.invoke`.
The renderer never touches Node APIs directly — everything goes through the `window.api` object.

### IPC Channels

| Channel | Direction | What it does |
|---|---|---|
| `api:items` | Renderer → Main | Fetches the full market item list (paginated from Steam, cached locally) |
| `api:price` | Renderer → Main | Gets the BRL price for a specific item via `priceoverview` |
| `api:market-details` | Renderer → Main | Scrapes buy orders + price history from Steam listing pages |
| `api:exchange-rates` | Renderer → Main | Returns ECB exchange rates (base USD, cached 6h) |
| `api:stash` | Renderer → Main | Reads save, cross-references with market catalog, returns inventory |
| `updater:update-available` | Main → Renderer | Notifies UI that a new version exists |
| `updater:download-progress` | Main → Renderer | Streams download percentage to UI |
| `updater:update-downloaded` | Main → Renderer | Signals that the update is ready to install |
| `updater:start-download` | Renderer → Main | User triggered: begin downloading the update |
| `updater:install-update` | Renderer → Main | User triggered: quit and install |

---

## 4. How the Save Works

- **File:** `SaveFile_Live.es3` in `%USERPROFILE%\AppData\LocalLow\TesseractStudio\TaskbarHero\`
- **Encryption:** Easy Save 3 format → AES-128-CBC with a key derived via PBKDF2-SHA1.
- **Password:** Stored in plaintext inside the game's `sharedassets0.assets`. The app auto-extracts it
  at runtime — it's not a user secret, it's a game asset.
- **Master item table:** A CSV embedded in the same assets file. Maps `ItemKey → GRADE, GEARTYPE, Level, IsCanExchangeMarketable`.
- **Equipment matching:** `(geartype|grade|level)` → Steam Market item name (e.g., Sword + Immortal + Lv80).
- **Material matching:** The localized display name (e.g., "Void Iron") maps directly to the market listing name.
  Material names require Python + UnityPy extraction — this step is optional.

---

## 5. Requirements

| Requirement | Required? | Notes |
|---|---|---|
| Node.js 20+ | **Yes** | Run `node --version` to check |
| TBH installed + opened once | **Yes** | The save file must exist |
| Python 3.x + UnityPy | Optional | Only needed for material name extraction |

---

## 6. Dev Setup

```bash
git clone https://github.com/gezada/tbh-easymarket.git
cd tbh-easymarket
npm install
npm start          # launches Electron in dev mode
```

That's it. The app will open, find the save file automatically, and start pulling prices from Steam.

If you want material names (optional):

```bash
pip install UnityPy
npm run extract-tables
```

---

## 7. Project File Map

| File | Purpose |
|---|---|
| `main.js` | Electron main process — IPC handlers, Steam API client, disk cache, rate-limit queue, auto-updater |
| `preload.js` | Secure context bridge between main and renderer (exposes `window.api`) |
| `public/index.html` | Entire UI — HTML + CSS + JS in one file |
| `tbh-save.mjs` | Save decryption, asset extraction, item table parsing, inventory aggregation |
| `scripts/extract-tbh-tables.mjs` | Optional: Python-based material name extraction via UnityPy |
| `package.json` | Version, dependencies, npm scripts, electron-builder config |
| `.github/workflows/release.yml` | CI/CD — builds and publishes releases on tag push |
| `docs/` | Landing page (GitHub Pages) + this guide |

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `'node' is not recognized` | Node.js not installed or not in PATH | Install [Node LTS](https://nodejs.org), restart your PC |
| `save not found` | TBH save file doesn't exist yet | Open the game at least once, then restart the app |
| `assets not found` | Steam installed in a non-standard location | Set `TBH_GAME_DIR=C:\path\to\TaskBarHero_Data` |
| Port 5260 occupied | Another instance still running (legacy web mode) | Close the old instance, or set `GSM_PORT` to a different port |
| Materials show no name | Localization table not extracted | `pip install UnityPy` then `npm run extract-tables` |
| Prices seem wrong / wrong currency | Steam returned prices in your region's currency | Delete `items-3678970-v2.json` from userData, restart the app |
| App won't start on Windows 7/8 | Electron requires Windows 10+ | Upgrade your OS |

---

## 9. Environment Variables

| Variable | Purpose |
|---|---|
| `GSM_PORT` | Override the default port (5260). Only relevant for legacy web mode. |
| `TBH_GAME_DIR` | Point directly to the `TaskBarHero_Data` folder if auto-detection fails. |
| `TBH_ES3_PASSWORD` | Manually set the save decryption password if auto-extraction breaks. |

---

## 10. When the Game Updates

Game patches can change the item table or (rarely) the save encryption password.

1. **Re-extract item tables:** `npm run extract-tables`
2. **If the save password changed:** Open `sharedassets0.assets` in a hex editor, search for
   `ES3Defaults` followed by `SaveFile_Live.es3` — the password is in plaintext nearby.
   Then set it manually: `set TBH_ES3_PASSWORD=<the-new-password>`

---

## 11. Important Limitations

- **Does NOT buy or sell anything.** It only reads and displays prices. All trading happens through Steam.
- **Materials without Steam listings** are excluded from the total value — there's simply no price data for them.
- **Values are estimates** based on current market listings. Prices fluctuate constantly; what you see is a snapshot.

---

Made by **Ge Alves** · [x.com/omwgeorge](https://x.com/omwgeorge) · [instagram.com/omwgeorge](https://instagram.com/omwgeorge)
