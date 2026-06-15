# TBH Easy Market

**Know exactly what your stash is worth — before the market does.**

A free, open-source Windows app that reads your [Task Bar Hero](https://store.steampowered.com/app/3678970/TBH_Task_Bar_Hero/) save file and shows the real-time value of every item you own, pulled straight from the Steam Community Market. No guessing, no spreadsheets, no nonsense.

---

## Features

- **Total inventory value** — equipment and materials, all in one place
- **Live Steam Market prices** — buy orders, sell listings, and latest sold price
- **USD & BRL support** — with ECB exchange rates, updated automatically
- **Smart filters** — by class (Knight, Ranger, Sorcerer, Priest, Slayer, Hunter), equipment type, rarity grade
- **Show/hide equipped items** — focus on what you can actually sell
- **Marketable-only toggle** — cut the noise, see what matters
- **Auto-update detection** — the app tells you when a new version drops
- **100% local, 100% read-only, 100% ban-safe** — your save is never modified

---

## Download

Head over to [**GitHub Releases**](../../releases) and grab the latest version:

| Version | File | What it does |
|---------|------|-------------|
| **Installer** | `TBH-Easy-Market-Setup-X.X.X.exe` | Installs normally, auto-updates itself |
| **Portable** | `TBH-Easy-Market-Portable-X.X.X.exe` | No install needed — just run it |

Pick whichever you prefer. Both do the exact same thing.

---

## Is this safe? Will I get banned?

**No. You will not get banned.**

Here's what TBH Easy Market does:
- ✅ Reads your local save file (the same way Notepad would)
- ✅ Fetches public price data from Steam's own market endpoints

Here's what it does **NOT** do:
- ❌ Modify your save file — ever
- ❌ Inject code into the game
- ❌ Automate trading or any in-game action
- ❌ Send your data anywhere

It's literally the equivalent of opening your save in a text editor and checking what's inside. The game doesn't even know the app exists.

---

## Quick Start

1. **Make sure TBH has been opened at least once** — the app needs the save file to exist
2. **Download** the installer or portable version from [Releases](../../releases)
3. **Run it** — that's it. The app finds your save automatically

If you installed TBH in a non-default location, set the `TBH_GAME_DIR` environment variable to point to your `TaskBarHero_Data` folder.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `'node' is not recognized` | Install [Node.js LTS](https://nodejs.org), then restart your PC |
| `save do TBH não encontrado` | Open TBH at least once so it creates the save file |
| `assets do TBH não encontrados` | Game is installed in a custom path — set `TBH_GAME_DIR` env var |
| Material names are missing | Optional: install Python, run `pip install UnityPy`, then `npm run extract-tables` |
| App won't open | Check if another instance is already running (system tray, task manager) |

---

## For Developers

Want to poke around, contribute, or build from source? Welcome aboard.

### Stack

- **Electron + Node.js** — that's the whole runtime
- **electron-builder** for packaging, **electron-updater** for auto-updates
- No heavyweight frameworks, no bloated dependency trees

### How the sausage is made

- **Save decryption** — TBH uses Easy Save 3 (AES-128-CBC with PBKDF2-SHA1). The encryption key is extracted automatically from the game's own assets at runtime.
- **Price fetching** — hits Steam's public endpoints (`/market/search/render` and `/priceoverview`), with built-in request throttling and disk-based caching so you don't hammer Valve's servers.
- **Item mapping** — a master table extracted from game assets maps each `ItemKey` to its grade, type, and level. Material names are matched by their localized strings (extracting those requires Python + UnityPy — totally optional).

### Building

```bash
# Install dependencies
npm install

# Run in dev mode
npm start

# Build installer + portable .exe
npm run dist
```

### CI/CD

Push a version tag (`v*`) and GitHub Actions takes care of the rest — builds both variants and publishes a release automatically.

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `TBH_GAME_DIR` | auto-detected | Path to `TaskBarHero_Data` if auto-detection fails |
| `TBH_ES3_PASSWORD` | auto-extracted | Force a specific save decryption password |
| `GSM_PORT` | `5260` | Change the port (legacy web mode only) |

---

## License

MIT — do whatever you want with it. See [LICENSE](LICENSE) for the full text.

---

## Credits

Built by **Ge Alves**

- [x.com/omwgeorge](https://x.com/omwgeorge)
- [instagram.com/omwgeorge](https://instagram.com/omwgeorge)

If this helped you figure out what your stash is actually worth, consider dropping a star on the repo.
