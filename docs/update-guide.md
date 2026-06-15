# How to Release a New Version

This is the complete release process for TBH Easy Market, from code change to users downloading the update. Follow it top to bottom and nothing will go wrong.

## Prerequisites

- Git configured with push access to `gezada/tbh-easymarket`
- Node.js 20+ installed
- npm dependencies installed (`npm install`)

## The Release Checklist

### Step 1 — Make Your Code Changes

Edit whatever you need. All UI lives in `public/index.html`. Backend logic is in `main.js` and `tbh-save.mjs`. Nothing fancy here, just do your thing.

### Step 2 — Bump the Version in `package.json`

Open `package.json` and change the `"version"` field. Follow semantic versioning:

- **Patch** (`1.0.X`): bug fixes, small tweaks
- **Minor** (`1.X.0`): new features, UI changes
- **Major** (`X.0.0`): breaking changes

Example: `"version": "1.0.12"` → `"version": "1.0.13"`

### Step 3 — Clean the `dist/` Folder

Delete old executables and blockmaps so you don't accidentally ship stale artifacts:

```powershell
Remove-Item dist\*.exe -Force -ErrorAction SilentlyContinue
Remove-Item dist\*.blockmap -Force -ErrorAction SilentlyContinue
```

### Step 4 — Build Locally

Run the build to generate fresh executables:

```bash
npm run dist
```

This produces:

- `dist/TBH-Easy-Market-Setup-X.X.X.exe` (installer)
- `dist/TBH-Easy-Market-Portable-X.X.X.exe` (portable)
- `dist/win-unpacked/` (unpacked app for testing)

You can test the portable `.exe` directly from `dist/` before committing. Highly recommended.

### Step 5 — Commit with a Descriptive Message

```bash
git add .
git commit -m "v1.0.13: brief description of what changed"
```

Good commit messages look like this:

- `v1.0.13: fix Marketable Only filter hiding unlisted gear`
- `v1.0.12: add fallback Steam URL for items without active listings`

### Step 6 — Create the Version Tag

The tag **must** match the version in `package.json`, prefixed with `v`:

```bash
git tag v1.0.13
```

### Step 7 — Push Everything

```bash
git push origin main v1.0.13
```

Or separately, if you prefer:

```bash
git push origin main
git push origin v1.0.13
```

### Step 8 — Wait for GitHub Actions

Go to the **Actions** tab on GitHub. The `Release` workflow triggers automatically when it detects the `v*` tag. Here's what it does:

1. Checks out the repo on a Windows runner
2. Installs dependencies (`npm ci`)
3. Creates a draft GitHub Release
4. Builds the app with electron-builder (`npm run dist -- --publish always`)
5. Uploads Setup and Portable executables to the release
6. Publishes the release (removes draft status)

This usually takes about 3–5 minutes.

### Step 9 — Verify the Release

Go to the **Releases** tab on GitHub and confirm:

- [ ] The release is published (not draft)
- [ ] `TBH-Easy-Market-Setup-X.X.X.exe` is attached
- [ ] `TBH-Easy-Market-Portable-X.X.X.exe` is attached
- [ ] The version number matches

### Step 10 — Verify the Landing Page

The landing page at `https://gezada.github.io/tbh-easymarket/` automatically detects the latest release via GitHub API. Open it and verify both download buttons point to the new version.

---

## What Happens on the User Side

- **Installer users:** The app checks for updates 3 seconds after launch. When a new version is found, a red banner appears at the top: *"A new version is available!"*. The user clicks to download and install with one click.
- **Portable users:** Same banner appears, but clicking it opens the GitHub Releases page where they download the new portable manually.
- **Landing page visitors:** The download buttons always point to the latest release. No action needed from you.

---

## Quick Reference (Copy-Paste Ready)

The entire release process in one block:

```bash
# 1. Edit package.json version
# 2. Clean and build
Remove-Item dist\*.exe -Force; Remove-Item dist\*.blockmap -Force
npm run dist
# 3. Commit, tag, push
git add .
git commit -m "v1.0.13: description of changes"
git tag v1.0.13
git push origin main v1.0.13
# 4. Wait for GitHub Actions → check Releases tab
```

---

## Notes

- You do **not** need to build locally for the release to work — GitHub Actions does its own build. But building locally lets you test the executable before pushing.
- If you want to commit without triggering a release, simply don't create a tag.
- If the GitHub Action fails, check the Actions tab for error logs. Common issues: `npm ci` failures, electron-builder signing errors.
- **Never** push a tag without first bumping the version in `package.json`. The tag and `package.json` version must always match.
