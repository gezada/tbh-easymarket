# TBH Easy Market - Design System

## Purpose

This document is the visual and interaction reference for TBH Easy Market. New screens, buttons, banners, dialogs, tables, filters, donation cards, feedback elements, and desktop-specific UI must follow these rules unless a deliberate design-system revision is approved first.

The goal is consistency, not visual sameness. Components may vary in structure, but they must share the same colors, typography, spacing, geometry, hierarchy, states, and interaction language.

## Product Character

TBH Easy Market combines:

- A dark desktop utility interface.
- A restrained pixel-RPG atmosphere inspired by Taskbar Hero.
- Strong red structural headers.
- Gold actions, values, highlights, and selection states.
- Square, mechanical controls rather than soft consumer-app styling.
- Dense but readable market data.
- Clear separation between decoration and information.

The interface should feel crafted, useful, and game-adjacent. It must not become a generic SaaS dashboard, a glossy crypto product, or an overly decorated game screen.

## Design Principles

1. **Function first.** Decoration must never obstruct prices, item names, filters, or status information.
2. **One visual language.** Reuse established components and tokens before creating a new style.
3. **Gold means importance.** Reserve gold for selected controls, principal values, headings, and meaningful emphasis.
4. **Red provides structure.** Use red mainly for section headers, refresh/destructive emphasis, and branded framing.
5. **Color must have meaning.** Do not add colors only to make a component look more lively.
6. **Square geometry.** Controls and panels use square corners unless a specific semantic element requires otherwise.
7. **Dense, not cramped.** Keep data compact while preserving clear rows, alignment, and clickable targets.
8. **Responsive without horizontal overflow.** New components must work within the established desktop and mobile layouts.
9. **States must be visible.** Hover, focus, active, disabled, loading, empty, and error states are required parts of a component.
10. **Desktop-ready.** Components must remain usable with keyboard navigation and Windows display scaling.

## Source Of Truth

The current implemented visual source is `public/index.html`. This document formalizes that interface. During the desktop migration, visual tokens should be moved into dedicated CSS files or variables without changing their intended appearance.

When this document and implementation disagree:

1. Confirm whether the implementation changed intentionally.
2. Correct accidental drift.
3. Update this document when an approved design change becomes the new standard.

Do not silently create a third variation.

## Color System

### Core Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--bg` | `#111416` | Primary dark background and neutral surfaces |
| `--bg-deep` | `#0a0c0d` | Deepest background, scrollbar context, recessed areas |
| `--panel` | `#191d21` | Main cards and panels |
| `--panel2` | `#20252b` | Raised controls and hover surfaces |
| `--panel3` | `#272d33` | Higher neutral elevation when required |
| `--line` | `#3a4148` | Primary panel and section borders |
| `--line-soft` | `#292f34` | Row separators and subtle divisions |
| `--text` | `#e7e2d5` | Primary body text |
| `--muted` | `#8f969d` | Secondary information and metadata |
| `--gold` | `#e4a928` | Active controls and primary emphasis |
| `--gold-light` | `#ffd45d` | Principal values, titles, hover emphasis |
| `--red` | `#9d1d24` | Branded red structure |
| `--red-dark` | `#541116` | Deep red borders and gradients |
| `--red-bright` | `#c82d34` | Strong hover or alert accent |
| `--green` | `#64bc56` | Positive or available status only |
| `--blue` | `#54a1dc` | Buy-price information and linked service accent |
| `--orange` | `#d98527` | Filter labels and secondary warm accent |
| `--shadow` | `0 16px 44px rgba(0,0,0,.42)` | Main panel elevation |

### Extended Existing Colors

These colors already support specific component details and should be converted into named variables when CSS is modularized:

| Role | Value |
| --- | --- |
| Recessed control | `#101315` |
| Table header | `#121517` |
| Control surface | `#20252a` |
| Row surface | `#171b1e` |
| Row hover | `#20252a` or `#1e2327` |
| Control border | `#424a51` |
| Gold border | `#e3a429` |
| Warm hover border | `#8c5a22` |
| Sell value | `#efc558` |
| Buy value | `#72b9e8` |
| Latest value | `#b5a9d8` |
| Unavailable value | `#777f85` |

### Color Rules

- Never use pure white for large amounts of text. Use `--text` or a warm off-white.
- Never use pure black as a panel fill. Preserve visible depth between background and panels.
- Gold is not ordinary body text. Use it for selection, major prices, headings, or compact emphasis.
- Red is not the default button color. Reserve it for branded primary actions such as Refresh, structural bars, destructive warnings, or urgent states.
- Green is only for a confirmed positive or available state. Do not use it as generic decoration.
- Buy, sell, and latest values retain their semantic colors everywhere:
  - Sell: gold.
  - Buy: blue.
  - Latest: muted violet.
- Errors must combine color with text or iconography; never rely on color alone.
- New cryptocurrency or donation branding must not override the product palette. External logos may retain their own colors inside a controlled neutral container.

## Typography

### Font Families

| Family | Stack | Usage |
| --- | --- | --- |
| Interface | `"Segoe UI", Arial, sans-serif` | Body copy, descriptions, item names |
| Display | `Georgia, serif` | Brand name, section headings, principal prices |
| Technical | `Consolas, monospace` | Filters, labels, metadata, table headers, compact prices, statuses |

Do not introduce another font family without approval. Packaged desktop builds must use system-safe fonts or bundle fonts legally and intentionally.

### Type Scale

| Role | Size / Line Height | Weight | Family |
| --- | --- | --- | --- |
| Brand title | `18px / 1.05` | `800` | Display |
| Page/card title | `22px` | `800` | Display |
| Principal value | `24px / 1.15` | `800` | Display |
| Section bar | `13px` | `800` | Display |
| Body | `14px / 1.45` | `400-700` | Interface |
| Item name | `14px` | `700` | Interface |
| Supporting text | `11px` | `400` | Interface or Technical |
| Control text | `9-10px` | `700-800` | Technical |
| Table heading | `9-10px` | `800` | Technical |
| Micro metadata | `8-9px` | `700` | Technical |

### Typography Rules

- Use display type sparingly: headings and principal monetary totals only.
- Controls, small labels, and metadata are uppercase monospace with moderate letter spacing.
- Do not uppercase item names, descriptions, messages, or long button labels.
- Long item names use a single-line ellipsis in tables; expose the complete name through an accessible title or detail view when needed.
- Right-align numeric table values. Left-align item names and descriptive text.
- Use tabular alignment for quantities and compact numeric metadata where possible.
- Avoid text smaller than `8px` in the current zoomed web implementation. During Electron migration, reassess effective physical size before preserving numeric CSS values.

## Spacing System

Use a base unit of `4px`.

| Token | Value | Typical Usage |
| --- | --- | --- |
| `space-1` | `4px` | Tight icon/text separation |
| `space-2` | `8px` | Control gaps, compact padding |
| `space-3` | `12px` | Toolbar gaps, standard vertical padding |
| `space-4` | `16px` | Section grouping |
| `space-5` | `20px` | Spacious component padding |
| `space-6` | `24px` | Separation between major groups |
| `space-7` | `28px` | Footer and large section separation |
| `space-8` | `32px` | Large layout spacing when needed |

Existing values such as `7px`, `9px`, `10px`, `11px`, `13px`, and `18px` are accepted for compact component tuning. New components should begin with the base scale and diverge only to align with an existing component.

### Layout Spacing Rules

- Major cards should normally be separated by `22-24px`.
- Standard card content padding is `14-18px` on desktop and `8-12px` on narrow screens.
- Toolbars use `8-12px` gaps and may wrap.
- Table rows use approximately `9px 12px` padding.
- A control group must have stronger internal proximity than its distance from adjacent groups.
- Do not solve alignment with arbitrary negative margins unless matching an established framed header treatment.

## Shape And Borders

- Default border radius: `0`.
- Main panel border: `1px solid #41484e`.
- Standard control border: `1px solid #424a51`.
- Recessed control border: `1px solid #343b41`.
- Table row separator: `1px solid --line-soft`.
- Active gold border: `1px solid #e3a429`.
- Section bars use a dark red border and gold lower edge.
- Dashed borders are reserved for missing/unlisted asset placeholders.

Rounded pills, oversized curves, glassmorphism, and soft floating cards do not belong in this system. A circular form is acceptable only for intrinsically circular indicators such as a loading spinner, radio control, or external brand mark.

## Elevation And Texture

### Main Surfaces

- Application background: layered dark diagonal texture plus a subtle grid overlay.
- Header: dark warm gradient with a restrained bottom border and drop shadow.
- Main panels: dark solid surfaces with the standard panel shadow.
- Recessed controls: near-black fill with a visible border.
- Raised controls: slightly lighter neutral fill with a hard border.

### Shadow Rules

- Main cards use `--shadow`.
- Compact controls may use a hard `3px 3px 0 rgba(0,0,0,.35)` shadow.
- Brand framing may use inset borders and a hard offset shadow.
- Do not add blurred shadows to every button or row.
- Shadows must communicate hierarchy, not decoration.

## Layout

### Current Web Baseline

- Body width: `80%` with `zoom: 1.25`.
- Content maximum width: `1320px`.
- Header and footer full-bleed visual layers: `80vw`, compensating for body zoom.
- Main desktop padding: `22px 18px 42px`.
- Narrow-screen main padding: `14px 8px 28px`.

These values describe the current web implementation. The Electron migration should preserve the perceived scale and full-width appearance, but should replace browser zoom compensation with a native layout where practical.

### Full-Bleed Rule

Header background, header separator, and footer separator must visually extend from one viewport edge to the other without creating horizontal scrolling.

New full-bleed components must:

- Use a containing strategy that respects the actual viewport.
- Be tested at all supported window sizes and display scales.
- Never use a width that creates even a small horizontal scrollbar.
- Keep content centered within the standard maximum width.

### Alignment

- Item/descriptive columns align left.
- Prices, quantities, dates, and numeric metrics align right.
- Icon-only utility columns may align center.
- Primary toolbar controls follow reading order from left to right.
- Reset/Clear actions stay aligned to the far right when space permits.
- Totals align right on desktop and move to a full-width left-aligned block on narrow screens.

## Responsive Breakpoints

### Medium: `max-width: 1025px`

- Header may wrap.
- Search moves to a full-width second row.
- Brand typography and principal values reduce slightly.
- Head actions remain grouped.

### Narrow: `max-width: 775px`

- Reduce outer and component padding.
- Allow filter controls to wrap into balanced columns.
- Totals become full width.
- Dense stash rows collapse to item plus Sell, Buy, and Latest columns.
- Hide decorative/item-kind imagery and low-priority metadata where required.
- Market ranking and for-sale columns may hide when space is insufficient.
- Price subtext and dates may hide, preserving principal values.

### Responsive Rules

- Never reduce touch/click targets solely to keep a desktop layout on screen.
- Prefer reflow, wrapping, and progressive disclosure over horizontal scrolling.
- Tables may simplify on narrow screens but must preserve the user's primary task.
- A component is not complete until tested at desktop, medium, narrow, and high Windows scaling.

## Component Standards

## 1. Section Bar

Use for major card headers such as `MY STASH` and `STEAM MARKET`.

### Anatomy

- Centered uppercase display title.
- Dark-to-light red vertical gradient.
- Dark red outer border.
- Gold bottom border.
- Gold-light text with subtle dark red shadow.
- Optional single utility affordance aligned right.

### Rules

- Minimum height: approximately `42px`.
- Do not add symmetrical decorative blocks or dots.
- Limit the right side to one clear utility action or disclosure control.
- An entire bar may be clickable only when it expands/collapses content and exposes the correct `aria-expanded` state.

## 2. Primary Branded Button

Use for a strong global action such as Refresh.

### Appearance

- Red gradient from `#9d252b` to `#64151a`.
- Border `#6c2729`.
- Light top inset and hard compact shadow.
- Bold interface text.
- Square corners.

### States

- Hover: brighter red gradient and border.
- Focus: visible gold or light outline that is not removed by shadow.
- Active/pressed: reduce or shift the hard shadow and darken slightly.
- Disabled: `opacity: .5`, waiting/default cursor as semantically appropriate.
- Loading: retain button width; use text or spinner without causing layout shift.

Do not use this style for every action. One dominant red action per toolbar is generally enough.

## 3. Filter / Segmented Button

Use for category selection, display mode, estimate type, and similar mutually exclusive filters.

### Default

- Neutral raised background.
- Gray border and text.
- Uppercase monospace label.
- Square corners.

### Hover

- Warm gold border.
- Pale gold text.

### Active

- Gold gradient fill.
- Dark text.
- Gold border.
- Inset lower edge.

### Rules

- Buttons within one group have equal height and stable dimensions.
- Selection must not resize or move surrounding controls.
- Use `aria-pressed` or the correct selection semantics.
- Avoid more than five immediately visible options; use a dropdown when the set is larger.

## 4. Neutral Button

Use for Clear, Previous, Next, secondary confirmations, and non-primary actions.

- Background: neutral raised surface.
- Border: standard control border.
- Text: muted light gray, uppercase monospace for utility actions.
- Hover: warm border and light gold text.
- Disabled: lower opacity with no hover reaction.
- Destructive neutral actions require explicit red text/border treatment and confirmation when data loss is possible.

## 5. Icon Button

Use for Steam links, compact utilities, and future desktop actions.

- Standard compact size: `24px x 24px`.
- Icon size: approximately `14px`.
- Recessed dark background and visible border.
- Center icon optically, not only mathematically.
- Hover may use the linked service color when semantic, as with Steam blue.
- Supply an accessible label through `aria-label` and a tooltip/title where useful.
- Do not use a generic diagonal arrow for a branded external destination when its recognizable service icon is available.

## 6. Text Input / Search

- Height: approximately `42px` for the primary search field.
- Recessed near-black background.
- Standard border.
- Horizontal padding: approximately `14px`.
- Square corners.
- Muted placeholder.
- Focus border: gold with a restrained outer focus line.
- Search should expand to fill available header width and move to its own row at medium widths.

All new inputs need labels, even when the visible label is replaced by an accessible label in a compact toolbar.

## 7. Select / Dropdown Trigger

- Height: `28-31px` depending on toolbar density.
- Neutral raised or recessed background.
- Standard border.
- Uppercase monospace text for filters.
- Custom compact chevron aligned right.
- Stable width across state changes.
- Focus border uses the warm/gold accent.
- Disabled controls reduce opacity but remain legible.

Dropdown menus:

- Use a dark panel, visible border, and hard shadow.
- Limit height and enable vertical scrolling for long lists.
- Keep option names left-aligned.
- Highlight active options with the established gold selection treatment.
- Maintain alphabetical order unless another ordering has clear user value.

## 8. Checkbox

- Place inside a labeled bordered control when used as a market/stash filter.
- Use `accent-color: var(--gold)`.
- Label uses compact uppercase monospace.
- The full label area should be clickable.
- Checked state changes behavior, not layout dimensions.

## 9. Dual Range Slider

- Dark bordered container.
- Gold value label.
- Neutral rail with gold filled range.
- Square gold handles with dark borders and hard shadow.
- Clicking the rail moves the closest handle and permits continued dragging.
- Handles may meet but never push or move each other.
- Each handle retains its own value while the other is dragged.
- Keyboard arrows must adjust the focused handle.
- Minimum and maximum values must be exposed accessibly.

## 10. Panel / Card

- Fill: `--panel`.
- Border: `1px solid #41484e`.
- Shadow: `--shadow` for major cards.
- Square corners.
- Major cards begin with a Section Bar.
- Internal blocks use separators rather than floating rounded subcards.
- Avoid nesting more than two visually bordered panel levels.

## 11. Data Table

### Header

- Dark table-header fill.
- Gold-brown uppercase monospace text.
- Bottom warm border.
- Item header left-aligned.
- Numeric headers right-aligned.
- Sortable headers show hover feedback and a directional arrow only for the active sort.

### Rows

- Dark row surface.
- Thin neutral separator.
- Consistent vertical rhythm.
- Hover uses a slightly lighter surface.
- Item image appears in a bordered square neutral frame.
- Item title is prominent; type/level appears below in muted text.

### Prices

- Sell: gold and strongest visual priority.
- Buy: blue.
- Latest: violet.
- Supporting date/conversion: smaller muted monospace text.
- Missing values: `n/a` in the unavailable style, never `0` unless zero is a real known value.

### Rules

- Keep column widths stable while filtering and sorting.
- Avoid horizontal scrolling at supported sizes; use responsive column reduction.
- Preserve column meaning across My Stash and Steam Market.
- Use pagination for long market results.

## 12. Item List Row

- Use the same visual hierarchy as a table: item left, quantity and values right.
- Hover may add a narrow red left accent.
- Images and type icons use fixed-size cells to prevent text jumping.
- Unlisted items use a dashed placeholder and no Steam-link action.
- Per-item values always follow the selected currency.

## 13. Status / Loading / Empty States

### Loading

- Use the established compact spinner with a gold active edge.
- Pair it with plain status text.
- Never leave a permanent spinner without timeout, failure, or retry handling.

### Empty

- Center concise monospace text inside the relevant panel.
- Explain whether filters, save contents, or network data caused the empty state.
- Offer one relevant recovery action when possible.

### Error

- Use restrained red emphasis, a clear message, and a recovery action.
- Preserve cached content when possible and explain that it may be stale.

### Success

- Use green only for a confirmed positive result.
- Avoid large celebratory banners for ordinary refresh completion.

## 14. Banner

Future donation, update, feedback, warning, and informational banners must use this hierarchy:

### Informational Banner

- Neutral panel fill.
- Standard border.
- Optional blue or gold left accent.
- Short title plus one concise supporting line.
- Secondary neutral action.

### Update Banner

- Gold left accent or compact gold badge.
- Version and release information in technical typography.
- One primary update action and one dismiss/later action.
- Never block access to the current version unless it is unsafe to continue.

### Warning Banner

- Dark warm/red surface, not a bright full-red block.
- Red border/accent plus explicit warning text.
- Use only for actionable risk.

### Donation Banner

- Must be visually secondary to inventory and market content.
- Use neutral panel styling with gold accents.
- Never imitate a system warning or required action.
- Clearly state that support is optional.
- Do not animate continuously.

### Banner Rules

- No carousel behavior.
- No auto-playing motion.
- No oversized promotional imagery that reduces data visibility.
- Dismissal must be clear when supported.
- Buttons follow existing button variants.

## 15. Modal / Dialog

Dialogs may be introduced for desktop-specific confirmations, settings, diagnostics, donation details, or update actions.

### Backdrop

- Fixed full-window dark overlay.
- Target opacity: approximately `rgba(0,0,0,.70)`.
- Background content remains static and non-interactive.

### Dialog

- Panel background and standard border.
- Main panel shadow.
- Square corners.
- Maximum width appropriate to content; avoid nearly full-screen dialogs for small tasks.
- Red Section Bar or compact dark header depending on importance.
- Standard `14-18px` content padding.
- Footer actions aligned right on desktop and stacked when narrow.

### Behavior

- Move focus into the dialog when opened.
- Trap keyboard focus inside it.
- Close with Escape when safe.
- Return focus to the invoking control.
- Require explicit confirmation for destructive operations.
- Do not use a modal when inline expansion can solve the task more simply.

## 16. Toast / Temporary Notification

- Use for completion or brief non-blocking failures.
- Place consistently in the lower-right desktop area and adapt on narrow windows.
- Dark panel, visible border, compact shadow.
- Maximum two lines plus an optional action.
- Automatically dismiss only informational/success messages.
- Errors requiring action remain until dismissed or resolved.
- Do not stack more than three; consolidate repeated refresh messages.

## 17. Tooltip

- Dark compact surface with a light border.
- Technical or interface font at `10-11px`.
- No large paragraphs.
- Show after a short delay for pointer users and immediately on keyboard focus.
- Tooltips supplement accessible labels; they do not replace them.

## 18. Footer

- Center content inside the standard maximum width.
- Full-viewport separator line without horizontal overflow.
- Compact muted monospace text.
- Links use gold and underline on hover.
- Keep the footer visually quiet.

## Iconography

- Prefer simple SVG icons with consistent stroke/fill weight.
- Use service logos for recognizable external destinations such as Steam.
- Use the official TBH Easy Market icon for application identity.
- Default compact icon size: `14-16px`.
- Standard utility icon container: `24px`.
- Do not mix emoji, text symbols, filled icons, and outlined icons arbitrarily.
- Pixel-art item images may remain raster assets; UI controls should favor crisp SVG.
- Icons require accessible labels when they are the only visible content.

## Motion

- Interaction transition duration: `150-180ms`.
- Use motion for state explanation: chevron rotation, menu opening, hover response, or loading.
- Avoid bouncing, pulsing, parallax, and continuous decorative animation.
- Loading spinner duration: approximately `800ms` linear rotation.
- Respect `prefers-reduced-motion` in the desktop implementation.
- Animation must not shift table columns or change control dimensions.

## Interaction States

Every interactive component must define:

1. Default.
2. Hover.
3. Keyboard focus.
4. Active/pressed.
5. Selected, when applicable.
6. Disabled, when applicable.
7. Loading, when applicable.
8. Error, when applicable.

Focus indicators must remain visible against dark and gold surfaces. Never remove the browser/Electron focus outline without providing an equivalent or stronger replacement.

## Accessibility

- Target WCAG AA contrast for body text and controls.
- Do not communicate status or price type by color alone.
- Use semantic buttons, inputs, tables, headings, and dialogs.
- All icon-only actions need accessible names.
- Keyboard users must be able to operate filters, sorting, pagination, dropdowns, sliders, dialogs, and refresh actions.
- Click targets should be at least `24px`; use approximately `32-42px` for frequent primary controls.
- Maintain logical focus order after responsive reflow.
- Announce asynchronous loading, errors, and completed refreshes using appropriate live regions.
- Item images require useful alternative text or empty alternative text when the adjacent item name is sufficient.
- Test with Windows high contrast and display scaling where feasible.

## Content And Language

- Product interface language is English unless localization is intentionally introduced.
- Use concise labels: `Refresh`, `Clear`, `Equipment`, `Materials`, `Latest`.
- Use title case for page/card titles and sentence case for messages.
- Use uppercase only in compact technical labels and section bars.
- Prefer `n/a` for unavailable market values.
- Distinguish unavailable data from a real zero.
- Be explicit about units, currencies, blockchain networks, and update versions.
- Avoid hype, urgency, or financial promises in donation and market-price messaging.

## Desktop-Specific Extensions

When Electron work begins:

- Preserve the current visual identity while removing browser-specific zoom workarounds.
- Use native window dimensions and CSS scaling rather than global `zoom` if feasible.
- Keep the app's custom content layout independent from the Windows title bar decision.
- System menus, update dialogs, file pickers, and notifications may use native Windows UI when it improves trust or accessibility.
- Native and custom UI should not duplicate the same action simultaneously.
- The application icon must use `icon/tbh-easymarket-icon.ico` for Windows packaging.
- External links must visibly behave as external actions and open in the default browser.

## Anti-Patterns

Do not introduce:

- Rounded SaaS cards or pill buttons.
- Bright gradients unrelated to red or gold branding.
- Glassmorphism or blurred translucent panels.
- Neon crypto-dashboard styling.
- Large decorative illustrations competing with inventory data.
- Multiple primary buttons in one small area.
- New one-off colors when an existing semantic token fits.
- Horizontal scrolling caused by full-bleed backgrounds or oversized toolbars.
- Controls that resize when selected, filtered, or translated.
- Tiny unlabeled icon buttons.
- Permanent spinners or silent network failure.
- Monetary values that do not follow the selected currency.
- `0` as a substitute for missing price data.
- Modal workflows for simple inline filters.

## Implementation Rules

When adding a component:

1. Search for an existing equivalent.
2. Reuse a documented token and component variant.
3. Avoid inline styles and repeated hard-coded values.
4. Add or reuse semantic class names.
5. Implement all relevant states.
6. Add keyboard and accessible semantics.
7. Verify stable dimensions across states.
8. Verify desktop and narrow layouts.
9. Confirm no horizontal overflow.
10. Update this document if the approved addition creates a reusable pattern.

During CSS modularization, create dedicated layers such as:

- `tokens.css`: color, typography, spacing, sizing, shadow, and motion variables.
- `base.css`: resets, body, typography, focus, scrollbar, and accessibility helpers.
- `layout.css`: header, main content, full-bleed behavior, responsive layout.
- `components.css`: buttons, inputs, panels, banners, dialogs, tables, sliders.
- `utilities.css`: minimal shared alignment and visibility helpers.

Do not perform this restructuring solely for documentation; do it as part of an approved implementation phase.

## Component Review Checklist

Before approving a new button, banner, dialog, card, table, or toolbar, confirm:

- [ ] It uses existing color tokens and semantic color meanings.
- [ ] Typography matches one of the three approved font roles.
- [ ] Spacing follows the base scale or an existing component.
- [ ] Corners remain square unless an exception is justified.
- [ ] Item/descriptive text is left-aligned and numeric data is right-aligned.
- [ ] Default, hover, focus, active, selected, disabled, and loading states are covered as applicable.
- [ ] Selection does not resize the component or neighboring layout.
- [ ] Keyboard operation works.
- [ ] Icon-only actions have accessible names.
- [ ] The component works at desktop, medium, and narrow sizes.
- [ ] Windows display scaling does not clip content.
- [ ] It creates no horizontal scrollbar.
- [ ] Missing data is shown as unavailable, not zero.
- [ ] Currency values follow the user's selected currency.
- [ ] Motion is restrained and respects reduced-motion preference.
- [ ] The component does not overpower inventory and market data.
- [ ] Reusable additions are documented here.

## Visual QA Matrix

New reusable components should be inspected in at least these conditions:

| Condition | Required Check |
| --- | --- |
| Desktop wide | Alignment, maximum width, full-bleed surfaces |
| Desktop narrow | Toolbar wrapping, stable control widths |
| `1025px` boundary | Header/search reflow |
| `775px` boundary | Compact rows and hidden secondary data |
| Small mobile-like width | No clipping or horizontal scrolling |
| Windows 100% scaling | Baseline density |
| Windows 125% scaling | Current target appearance |
| Windows 150-200% scaling | Legibility and clipping |
| Keyboard only | Focus order and operation |
| Offline/error state | Recovery UI and cached-data behavior |
| Long text/data | Ellipsis, wrapping, stable columns |

## Governance

- This file is the approved visual standard for TBH Easy Market.
- Design-system changes should be reviewed separately from unrelated feature work.
- A new reusable pattern must be added here after approval.
- One-off exceptions must be documented near the component and should not silently become precedent.
- Periodically compare implemented components against this guide and remove visual drift.

