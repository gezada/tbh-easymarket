# TBH Easy Market - Desktop Roadmap

## Objective

Transform TBH Easy Market into a free Windows desktop application that:

- Requires no account, login, subscription, license, or activation.
- Runs in its own native window without opening a browser or exposing localhost.
- Reads the TBH save locally and in read-only mode.
- Is distributed as both an installable application and a portable executable.
- Supports simple, user-approved updates in the installable edition.
- Keeps donations and feedback completely optional.
- Preserves the existing interface and behavior unless a change is explicitly approved.

## Approved Direction

- Desktop framework: Electron.
- Packaging: Electron Builder.
- Windows installer: NSIS, installed for the current user without administrator privileges.
- Portable edition: single executable with assisted manual updates.
- Releases: GitHub Releases.
- Build automation: GitHub Actions.
- Application model: local-first, anonymous, and without authentication.
- Telemetry: disabled by default; no mandatory tracking.
- Updates: always communicated to and confirmed by the user.
- Recommended download: installable edition with integrated updating.
- Alternative download: portable edition without silent self-replacement.

## Guiding Principles

1. Never modify the user's TBH save.
2. Never require a TBH, Steam, GitHub, or TBH Easy Market account.
3. Never send inventory or save contents to an external server.
4. Show cached local data quickly while network data refreshes in the background.
5. External service failures must not freeze or prevent the application from opening.
6. Preserve user preferences and cached data across application updates.
7. Keep donation, feedback, and update actions transparent and optional.
8. Do not publish a release until installation, updating, rollback, and clean-machine tests pass.

## Phase 1 - Baseline And Documentation

- Create a stable reference version of the current web application.
- Record current functionality, routes, caches, timers, filters, sorting, currency behavior, and save discovery.
- Document the current Steam Market and exchange-rate data flows.
- Create a functional and visual regression checklist.
- Record the expected behavior for unavailable saves, network failures, and stale prices.

### Acceptance Criteria

- The existing web version remains functional and reproducible.
- Every user-visible feature has a corresponding regression check.
- Current data sources and refresh intervals are documented.

## Phase 2 - Desktop Architecture

- Introduce an Electron main process for native system access.
- Keep the current interface in the renderer process.
- Add a preload layer exposing a narrow, typed API to the renderer.
- Move filesystem, save parsing, Steam requests, exchange rates, cache, logs, and updates into trusted modules.
- Replace HTTP routes used by the interface with secure IPC calls.
- Load the packaged interface through an internal application protocol such as `app://`.
- Ensure no local HTTP server or localhost port is required in production.

### Acceptance Criteria

- The application opens in an Electron window.
- Production mode does not open a browser or listen on a localhost port.
- The renderer has no direct Node.js or unrestricted filesystem access.

## Phase 3 - Code Modularization

- Extract Steam Market logic from the current server into a reusable service.
- Extract exchange-rate collection and conversion into a reusable service.
- Extract cache handling into a reusable and versioned storage layer.
- Keep TBH save parsing independent from Electron and UI code.
- Separate domain models from transport and rendering concerns.
- Retain a development path that makes the UI easy to inspect and test.

### Acceptance Criteria

- Business rules can be tested without launching Electron.
- Desktop and existing development workflows return equivalent inventory and market results.
- No UI module directly performs privileged filesystem operations.

## Phase 4 - Native Window Experience

- Create a centered application window with sensible default and minimum dimensions.
- Add the TBH Easy Market title and `.ico` application icon.
- Restore the previous window size and position only when still visible on a connected display.
- Prevent the application from reopening off-screen after monitor changes.
- Show a lightweight startup state while local data loads.
- Display local cached content before waiting for internet requests.
- Enforce a single running instance per user and focus the existing window on a second launch.
- Decide whether closing the main window exits immediately or waits for critical writes to finish.

### Acceptance Criteria

- The first useful content appears quickly.
- Window restoration works across monitor and scaling changes.
- A second launch does not create conflicting refresh processes.

## Phase 5 - Local Data And Preferences

- Store installed-edition data under `%LOCALAPPDATA%\TBH Easy Market`.
- Persist currency, filters, sorting, collapsed sections, window state, and other approved preferences.
- Persist market and exchange-rate caches with timestamps.
- Add a schema version to all durable application data.
- Implement migrations before changing stored data formats.
- Use atomic writes to reduce the risk of corrupted settings.
- Keep a recoverable fallback when a settings migration fails.
- Decide and document whether the portable edition uses AppData or a data folder beside the executable.

### Acceptance Criteria

- Updating the application preserves preferences and usable cache.
- Damaged preferences can be recovered without damaging the TBH save.
- Data-location behavior is clearly documented for both editions.

## Phase 6 - Safe TBH Save Handling

- Detect the TBH save automatically using known locations.
- Offer manual file selection when automatic detection fails.
- Open the save in read-only mode and never write to it.
- Watch for file changes with debouncing to avoid excessive parsing.
- Keep the last valid inventory visible when a temporary read fails.
- Clearly distinguish missing, inaccessible, unsupported, and corrupted saves.
- Validate parser behavior against representative save samples without committing personal saves.

### Acceptance Criteria

- Inventory loads and refreshes without modifying the save.
- Save changes are reflected promptly and silently.
- Save errors have clear recovery actions.

## Phase 7 - External Data Reliability

- Retain the Steam Market cache and five-minute background refresh policy unless later changed.
- Retain the stash's fast local refresh policy unless later changed.
- Add request timeouts and cancellation for obsolete requests.
- Add bounded retries with backoff for temporary failures.
- Respect Steam rate limits and avoid unnecessary duplicate requests.
- Cache exchange rates and fall back to the last valid rate.
- Label stale, unavailable, and current data correctly.
- Allow partial operation when Steam or the exchange-rate source is unavailable.
- Prevent infinite loading states.

### Acceptance Criteria

- The application remains usable offline with previously cached data.
- A failed external request cannot lock the interface.
- Manual refresh provides clear progress and completion feedback.

## Phase 8 - Electron Security

- Enable `contextIsolation`.
- Enable the renderer sandbox wherever compatible.
- Disable Node.js integration in the renderer.
- Expose only an allowlisted preload API.
- Validate IPC arguments and returned data.
- Apply a restrictive Content Security Policy.
- Block unexpected navigation and popup creation.
- Open approved external links through the operating system's default browser.
- Restrict external URLs to approved protocols and destinations where practical.
- Do not bundle private keys, API secrets, authentication tokens, or update credentials.
- Audit production dependencies before each public release.

### Acceptance Criteria

- The renderer cannot execute arbitrary Node.js commands.
- Unexpected navigation and unapproved IPC calls are rejected.
- A documented security review checklist passes.

## Phase 9 - Community Features

### Donations

- Add a discreet support area that never blocks application functionality.
- Show the asset and network for every public crypto address.
- Provide QR codes and copy-address actions.
- Never request a seed phrase, private key, wallet connection, or transaction permission.
- Keep donation addresses in a controlled, reviewable configuration.
- Warn users to verify the network before sending funds.

### Feedback

- Add a `Send Feedback` action that does not require a TBH Easy Market account.
- Use an external form that permits anonymous responses, or a future dedicated endpoint.
- Do not embed a GitHub token in the application.
- Provide an optional diagnostic summary the user can review before copying or submitting.
- Exclude save contents, inventory details, personal paths, and other sensitive information by default.

### Acceptance Criteria

- Donations and feedback are optional and clearly labeled.
- No login is required by the application itself.
- Diagnostic content is visible to the user before it leaves the computer.

## Phase 10 - Privacy And Transparency

- Do not add mandatory telemetry.
- Store operational logs locally with rotation and size limits.
- Add controls to open and clear logs and cache.
- Create an `About` or `Privacy` view explaining local files and external connections.
- State that inventory and save contents are not uploaded.
- Add an unofficial-project disclaimer for TBH and Steam.
- Document exactly which URLs the application contacts and why.

### Acceptance Criteria

- The user can understand the application's data behavior without reading source code.
- Local logs do not contain save contents or secrets.
- Cache and logs can be removed without reinstalling.

## Phase 11 - Distribution Formats

### Installable Edition

- Artifact name: `TBH-Easy-Market-Setup.exe`.
- Install for the current user without administrator privileges.
- Create approved Start Menu and optional desktop shortcuts.
- Register normal Windows uninstallation.
- Support integrated updates and safe application restart.
- Preserve application data when updating.
- Decide explicitly whether uninstalling should retain or remove user data.

### Portable Edition

- Artifact name: `TBH-Easy-Market-Portable.exe`.
- Run without installation.
- Document where preferences and cache are stored.
- Detect available updates and direct the user to the official release download.
- Do not promise silent replacement of the currently running executable.
- Ensure the portable application does not require administrator privileges.

### Acceptance Criteria

- Both artifacts run on supported clean Windows systems.
- The distinction between integrated and assisted updates is clear.
- Neither edition requires an application account or activation.

## Phase 12 - Code Signing And Trust

- Obtain a Windows code-signing certificate before broad public distribution when feasible.
- Sign the installer, portable executable, application binaries, and update packages.
- Add trusted timestamping so signatures remain valid after certificate expiration.
- Keep signing secrets only in protected CI secret storage.
- Preserve signing identity across releases.
- Publish SHA-256 checksums for downloadable artifacts.
- Document the expected Windows publisher name.

### Acceptance Criteria

- Signed builds validate correctly on Windows.
- Release checksums match downloaded artifacts.
- Unsigned beta builds are clearly identified if used before certificate acquisition.

## Phase 13 - Application Updates

- Use GitHub Releases as the update source.
- Follow semantic versioning: patch, minor, and major releases.
- Check for updates quietly after startup without delaying local content.
- Show version, release notes, download size, and update action.
- Let the user choose when to download or restart.
- Never require a GitHub account.
- Do not update while critical local operations are incomplete.
- Verify package integrity and publisher signature before applying an update.
- Keep the current version functional when downloading or installing an update fails.
- Support an explicit rollback procedure for broken releases.
- Keep the portable edition on notification plus manual download.

### Acceptance Criteria

- An older installed build can update to the newest compatible build with a few clicks.
- Interrupted or failed updates do not leave the application unusable.
- Portable users receive a clear, official update path.

## Phase 14 - GitHub Actions Release Pipeline

- Build on a pinned Windows runner and supported Node.js version.
- Install dependencies from a committed lockfile.
- Run static checks and automated tests before packaging.
- Build the installer, portable executable, and updater metadata.
- Sign artifacts when signing credentials are configured.
- Generate SHA-256 checksums.
- Publish releases only from an explicitly approved version tag.
- Attach release notes and all required updater metadata.
- Retain prior releases for recovery.
- Prevent pull requests from accessing production signing credentials.

### Acceptance Criteria

- A valid release tag produces a complete and reproducible release.
- Failed tests stop publication.
- Release artifacts and updater metadata remain consistent.

## Phase 15 - Release Channels

- Create a `beta` channel for community testing.
- Create a `stable` channel for general users.
- Prevent beta releases from automatically replacing stable installations.
- Allow an intentional return from beta to stable.
- Document channel behavior and version numbering.
- Consider gradual rollout only after the basic updater is proven reliable.

### Acceptance Criteria

- Beta and stable users receive only their intended updates.
- Changing channels cannot silently downgrade or corrupt local data.

## Phase 16 - Automated Testing

- Unit-test save parsing and unsupported-save handling.
- Test inventory filtering, sorting, quantity, and total calculations.
- Test sell, buy, and latest-value calculations.
- Test currency conversion and unavailable-rate fallback.
- Test cache expiration, stale data, and invalid cached content.
- Test Steam responses with missing, zero, malformed, and unavailable listings.
- Test settings migrations and recovery.
- Test updater version comparison and channel selection.
- Test the preload API and rejection of invalid IPC calls.
- Add regression tests for every corrected production bug.

### Acceptance Criteria

- Core business logic runs in CI without launching a visible window.
- Critical calculations and migrations have deterministic tests.
- New releases cannot be published when required tests fail.

## Phase 17 - Manual And Visual Testing

- Test supported Windows 10 and Windows 11 versions.
- Test display scaling at 100%, 125%, 150%, and 200%.
- Test small, Full HD, high-resolution, and ultrawide displays.
- Test multi-monitor changes and disconnected monitors.
- Test clean installation, update, repair behavior, and uninstallation.
- Test portable execution from normal folders, removable drives, and read-only locations where relevant.
- Test online, offline, slow, and unstable connections.
- Test missing, inaccessible, corrupted, changing, and large saves.
- Verify there is no unintended horizontal scrollbar.
- Compare desktop visuals against the approved web baseline.

### Acceptance Criteria

- All supported display configurations remain usable.
- Installer and portable smoke tests pass on clean machines.
- The approved visual regression checklist passes.

## Phase 18 - Performance

- Measure time to window creation and first useful inventory render.
- Load local preferences and cache before starting remote refreshes.
- Keep network and heavy parsing work away from the renderer thread.
- Cancel superseded requests and debounce repeated save events.
- Update only affected UI sections instead of rebuilding the full page.
- Monitor memory and CPU during long sessions.
- Ensure background refresh timers do not multiply after reloads or wake events.
- Test startup and refresh behavior with large inventories and caches.

### Acceptance Criteria

- Startup and local inventory display meet an agreed performance target.
- Long-running sessions do not show unbounded memory, CPU, or request growth.
- Refreshing does not freeze window interaction.

## Phase 19 - Diagnostics And Recovery

- Add rotating, size-limited local logs.
- Add friendly error states with retry and recovery actions.
- Provide actions to clear cache, reopen logs, and choose the save location.
- Generate an optional diagnostic report containing application version, Windows version, service state, and sanitized errors.
- Never include save contents or inventory details without explicit consent.
- Document recovery from corrupted cache, settings, and failed updates.
- Provide a tested path to reinstall or return to a previous release without losing preferences.

### Acceptance Criteria

- Common failures can be diagnosed without asking for the user's save.
- Recovery tools cannot modify the TBH save.
- A failed update has a documented and tested recovery path.

## Phase 20 - Public Project Preparation

- Update the README for installation, portable use, updates, privacy, and troubleshooting.
- Make official download links point only to GitHub Releases or another controlled source.
- Explain signature and checksum verification.
- Add a FAQ for save detection, prices, buy/sell/latest values, currencies, and stale data.
- Add bug-report and vulnerability-reporting guidance.
- Choose and document the source-code license.
- Review authorization and attribution requirements for TBH icons, images, names, and other assets.
- Review Steam terms, rate limits, and permitted use of market data.
- State that price estimates are informational and not guarantees.

### Acceptance Criteria

- Public documentation matches actual application behavior.
- Asset and third-party service risks are reviewed before release.
- Users can identify the official builds and reporting channels.

## Phase 21 - Closed Beta

- Distribute the beta to a small, known group first.
- Collect feedback on SmartScreen warnings, save detection, performance, and UI scaling.
- Test at least one real update from an older beta to a newer beta.
- Test failed and interrupted update scenarios.
- Fix release-blocking issues before public launch.
- Avoid incompatible stored-data changes without a tested migration.

### Acceptance Criteria

- Beta update and recovery paths work on real user machines.
- No unresolved issue risks save safety, application startup, or update integrity.
- Release feedback has been triaged and documented.

## Phase 22 - Version 1.0.0 Release

- Publish the installable and portable editions.
- Publish checksums, release notes, supported Windows versions, and known limitations.
- Mark the installer as the recommended option.
- Clearly explain that portable updates require a manual download.
- Publish privacy, unofficial-project, and price-estimate notices.
- Monitor early feedback and prepare a rapid patch path.

### Acceptance Criteria

- Official release assets are signed when available and checksums are verified.
- Installation, first run, update detection, portable startup, and uninstall smoke tests pass.
- Download and feedback links are functioning.

## Phase 23 - Ongoing Maintenance

- Use patch versions for compatible fixes.
- Use minor versions for compatible features.
- Use major versions for breaking changes.
- Keep at least one known-good prior release available.
- Review dependencies and security advisories regularly.
- Test update, migration, and rollback for every release.
- Maintain release notes and known issues.
- Promote beta releases to stable only after validation.
- Revisit external APIs and Steam behavior when upstream changes occur.

## Release Gates

A public release must not proceed unless all applicable gates pass:

1. Core automated tests pass.
2. Save handling remains read-only.
3. No localhost server is used in packaged production builds.
4. Renderer security configuration passes review.
5. Installer and portable builds launch on clean supported Windows systems.
6. Update from the previous supported installer succeeds.
7. Failed update recovery is verified.
8. Preferences and cache migrations succeed.
9. Offline and external-service failure behavior is usable.
10. Visual regression and display-scaling checks pass.
11. Artifact checksums are published and verified.
12. Documentation reflects the released behavior.

## Decisions To Make During Implementation

These decisions should be made at the relevant phase, with the safest default documented:

- Exact minimum supported Windows version.
- Portable data location: beside the executable or in AppData.
- Whether uninstalling removes or preserves user data.
- Startup performance targets.
- Final anonymous feedback provider.
- Supported donation assets and networks.
- Stable and beta channel selection UI.
- Code-signing certificate timing and publisher identity.
- Exact application update prompts and restart behavior.
- Final source-code license and asset permissions.

## Definition Of Done

The desktop transformation is complete when:

- TBH Easy Market runs in its own Windows window without a browser or localhost.
- Users need no account, login, subscription, activation, or administrator access.
- The TBH save is discovered and read safely without modification.
- Cached inventory and price information appear quickly and refresh reliably.
- The installer supports user-approved integrated updates from official releases.
- The portable executable runs without installation and clearly supports assisted manual updates.
- Preferences survive updates and have tested migrations.
- Security, privacy, diagnostics, offline operation, and failure recovery meet this roadmap.
- Both formats pass clean-machine, display-scaling, and regression tests.
- Official release documentation, checksums, disclaimers, and support paths are published.

