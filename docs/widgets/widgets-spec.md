# Shared Widgets Migration — spec

Owner: Brenton. Plan agreed 2026-10-01. Follows the Component Library (spec.md §17).

## 1. Goal

Every widget that is copied into several pages becomes **one shared renderer**, so a change made once updates every page and the Component Library (`prototypes/components/`).

Each widget migrates:
- with **no visual change**, unless Brenton has decided on a change;
- **proven by a pixel comparison** of every page it's used on.

## 2. Ground rules

1. **Component Library first** (spec.md §17). Every widget change starts in its `prototypes/components/registry.js` entry, then goes to every page in its `usedOn` list, then gets checked with Compare across pages.
2. **Discuss before actioning.**
   - Phase 1 widgets need no design decisions. Build them, but confirm the batch with Brenton before starting.
   - Phase 2 widgets need Brenton to decide each one before building.
3. **Push only once approved.** Commit as rrgwebproducts@gmail.com to github.com/rrgwebproducts-ux/rrg-web-design. Brenton reviews on Vercel: https://rrg-web-design.vercel.app/prototypes/.
4. **Match the surrounding code.** Plain JS, no build step, the same comment style and naming as `_shared/*.js`.
5. **Developer briefs.** Keep the brief text up to date wherever a widget's markup or class names change. No screenshot recapture until final handover.

## 3. Architecture

- **New file `prototypes/_shared/widgets.js`.**
  - It holds one render function per widget, following the existing `plpCardHTML` / `rrgCartLineHTML` pattern: `rrgWidgetTrustRowHTML(opts)`, `rrgWidgetFooterHTML()`, and so on.
- **Pages keep only a placeholder.**
  - Example: `<div data-widget="trust-row" data-variant="product"></div>`.
  - Per-page *content* (breadcrumb trail, FAQ questions, product copy) is passed as data: `data-*` attributes, or a `<script type="application/json">` next to the placeholder.
  - Structure and classes live only in widgets.js.
- **Mount order.**
  - widgets.js loads after `nav-data.js` / `session-state.js` and **before** `mega-menu.js` / `admin-panel.js` / `shared.js` / `cart.js` / `plp.js`.
  - It renders the placeholders synchronously as it runs, so every existing `DOMContentLoaded` init in shared.js still finds its elements.
  - `component-mode.js` stays first.
- **Differences between copies.**
  - **Intentional** ones become named options on the one widget. Example: the Vehicle-Specific sticky bar's thumbnail becomes `data-variant="vehicle"`.
  - **Accidental** ones get merged into the version Brenton picks.
- **After each widget migrates**, update its `registry.js` entry:
  - set `build: 'shared'`;
  - point `source` at the new function;
  - check `usedOn` is still right.

## 4. Proving nothing changed (each widget)

1. **Before editing:** screenshot every variation of the widget through component mode, at desktop 1280 and mobile 390. Include the "Compare across pages" set: the widget's first variation taken from every `usedOn` page.
   - Use the same URLs the library builds (`../<page>/index.html?component=<sel>&ls=…`).
   - Save the shots in `.playwright-mcp/baseline/<widget>/`.
2. Migrate the widget.
3. **Re-screenshot the same set and pixel-compare.**
   - Any difference must be explained (an intended merge from a Phase 2 decision) or fixed.
4. **Check every touched page:**
   - It loads with no JS errors.
   - The Demo State and Site Admin panels still drive the widget.
   - Mobile 390 has no sideways scroll.
5. **Re-run the library check:** every registry variation is found and has a height (the Reviews Strip is the known exception, since it depends on the live reviews.io API).

## 5. Phase 1: identical copies, no decisions needed

Structure-only comparison, 2026-10-01: tags and classes, ignoring text and list lengths. Suggested order: biggest payoff first.

| # | Widget(s) | Copies |
|---|---|---|
| 1.1 | Header shell: utility bar, region selector, main header + nav, search box, mega menu shell, sticky mobile header, mobile menu takeover | identical on 21 pages (all but checkout) |
| 1.2 | Footer | identical on 21 pages |
| 1.3 | Product-page parts: brand logo + SKU row, short description, reviews strip, price block, Add to Cart + payment badges, Get It Installed, Showroom Finder, variant picker, related products | same structure on PDP5 (VS, Config-Variant, Sibling/Colour, Simple, Grouped/Bundle); related products also on PLP3 |
| 1.4 | Category hero, listing toolbar, store finder tile, steps | same structure where static |

## 6. Phase 2: drifted copies, each needs Brenton's decision

For each widget:
- show the versions side by side (Component Library → Compare across pages, plus a short written diff);
- recommend **merge to version X** or **keep as a named option**;
- Brenton decides; then build and prove as in §4.

Batch several decisions into one message.

| Widget | Structures found | Grouping |
|---|---|---|
| Breadcrumbs | 4 | store-finder+FMV+installation+cart+brand+brands+search / store+vlp+PLP3 / PDP5 / VCLP |
| Breadcrumb row | 4 | store-finder+FMV+installation+cart+brand+brands+search / vlp+PLP3 / store / VCLP |
| Trust row | 5 | PDP5 / home / store / FMV / installation (copy differs by design; check structure) |
| Vehicle finder (inline) | 4 | FMV+cart / home / VCLP / brand — ✅ done 2026-10-02: merged into `rrgWidgetVehicleFinderHTML()` (see §9) |
| Product gallery | 4 | VS+grouped / config+sibling / simple / store |
| Delivery / Click & Collect | 3 | sibling+simple+grouped / VS / config-variant |
| Sticky mobile Add to Cart | 3 | config+sibling / simple+grouped / VS (VS thumbnail is intentional) |
| FAQ | 3 | store+FMV+installation+vlp+PLP3+brand / PDP5 / VCLP |
| Product carousel | 3 | vlp+brand / store / cart |
| Description & Specs tabs | 5 | one per PDP |
| Content block | 3 | store / FMV / VCLP |
| Persistent bar | 2 | config+sibling+simple+grouped / VS |
| Trust banner | 2 | home+brand+brands / store-finder+VCLP+vlp |
| Brands strip | 2 | 9 pages / brand (brand page shows "other brands") |
| Page hero | 2 | FMV / installation |
| Callout | 2 | FMV / installation |
| Order summary | 2 | checkout / order-confirmation |
| What's Included | 2 | VS / grouped-bundle |

## 7. Phase 3: compound and inline-script widgets

- **Decision Panel** (6 versions: PDP5 + store page): rebuild it as a composition of the shared Phase 1/2 parts, with per-template options.
- **Move each page's inline scripts into shared renderers:**
  - category tiles: home, installation, cart, brand, `vlpTileHTML`; sizes feature / standard / compact / product / ask;
  - store cards: `sfCardHTML` in store-finder, installation, `storeCardHTML` in order-confirmation and checkout;
  - variant picker: `renderVariantPicker` / `renderVehicleVariantPicker`;
  - brand banner / about, store panel.

## 8. Known issues to raise along the way (not to fix silently)

- `.btn-cta` has no disabled style, so a disabled Add to Cart looks enabled. This is visible in the library under Building blocks → Buttons.
- The Reviews Strip is hidden whenever the reviews.io rating doesn't load.
- VLP doesn't load `cart.js`, so its header cart count never updates and stays at 0 (found in the 1.1 checks; it was the same before the migration). VLP's own comment says its Add to Cart uses cart.js, so Add to Cart there may not work either.

## 9. Progress log

| Date | Widget | Phase | Commit | Notes |
|---|---|---|---|---|
| 2026-10-01 | 1.1 Header shell (utility bar, region selector, main header + nav, search, mega menu shell, sticky mobile header, mobile menu takeover) | 1 | ec1bad1 | Byte-identical on 21 pages; now `rrgWidgetHeaderHTML()` (built from `rrgWidgetUtilityBarHTML` / `MainHeader` / `StickyHeader` / `MobileTakeover`), placeholder `<div data-widget="header"></div>`. 0 px change on every widget shot (one search-results typeahead shot varies run to run because of its product thumbnails; it does the same on the original code). All 21 pages: no JS errors, no sideways scroll at 390; Site Admin (login, vehicle, cart) and the region switcher still drive it; mega menu, sticky headers and the takeover still work. |
| 2026-10-01 | 1.2 Footer | 1 | ec1bad1 | Byte-identical on 21 pages; now `rrgWidgetFooterHTML()`, placeholder `<div data-widget="footer"></div>` (replaced, not filled, so it is still the next sibling of `<main>`). 0 px change. |
| 2026-10-02 | 2. Vehicle finder (inline) | 2 | 765de5b | Merged into `rrgWidgetVehicleFinderHTML()`, placeholder `<div data-widget="vehicle-finder" …>` with options as data-* (`id`, `class`, `intro`, `submit`, `inline="false"`, any `data-vf-*` passed through). The intentional differences became options: home's `class="home-hero-finder"` and `vf-proof`; brand's `intro`, `vf-stay` and `vf-shop-href`; VCLP's `intro`, `vf-preset="hilux"`, `vf-submit-href` and `vf-shop-label`. Home / FMV / Cart / Brand pixel-identical before and after. VCLP's older bespoke widget (Make/Model locked, own inline validation script) replaced by the shared one: Toyota / Hilux pre-filled but changeable, follows the session vehicle and light/dark. The Fit Finder drawer (`buildFitFinderDrawer()`) now uses it too (`inline: false`, `submit: 'Set My Vehicle'`, always the no-vehicle cascade). Also: vehicle-known heading now ends in "?" ("Shopping for your Toyota Hilux?"), and on phones (≤600px) the known state stacks photo / text / full-width button with Change vehicle centred under it. Component Library: Vehicle Finder (inline) is `build: 'shared'`; Fit Finder Drawer variations are Light / Dark. |
