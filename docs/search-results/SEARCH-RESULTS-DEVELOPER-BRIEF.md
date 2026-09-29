# Search Results Page — Developer Brief

> **Updated 2026-09-29 for the cross-template consistency pass** (`spec.md` §15, steps 1–5). The text now matches the current code. Screenshots are deliberately held until final handover, so some of them may still show the pre-pass look.

## 1. Project context

**Audience:** for Marc, same as `DEVELOPER-BRIEF.md`, `HEADER-DEVELOPER-BRIEF.md`, `FOOTER-DEVELOPER-BRIEF.md` and the Vehicle Category Landing Page brief — detailed information on this page's build so implementation decisions in Magento stay consistent with the intent, even where the exact prototype code can't be lifted verbatim.

**What this page is:** the on-site search results page, reached by submitting the header search box (or clicking its "View All Results" link — Section 6) or the "You Might Like"/popular-category links on this page itself. It's a genuinely different page type from a PLP/VPLP: a PLP is always exactly one category with a fixed, known product set; a search's results can span **multiple categories at once**, or return **zero matches** — neither of which a single-category PLP is structurally built to handle. Extends the existing PLP/VPLP/Camping engine (`prototypes/_shared/plp.css`/`plp.js`) rather than forking it, so the grid/card/sort/pagination/compare machinery is identical to those pages by construction, not a lookalike copy.

**Companion documents:** `docs/search-results/search-results-spec.md` is the original engineering spec (written 2026-09-21, before build) — read it for the *why* behind each design divergence from PLP; this brief is the handover summary of what was actually built, not a replacement for it. The project memory log (`project_pdp_search_results_planning`, if you have access to it) has the full day-by-day build history including three follow-up rounds after initial sign-off. `docs/PAGE-GLOSSARY.md` doesn't yet have a Search Results section — worth adding (Section 6).

**This page reuses the PLP/VPLP/Camping engine's product grid, cards, sort, pagination, and mobile filter drawer wholesale** — those components are now fully documented in `docs/plp/PLP-DEVELOPER-BRIEF.md` (written 2026-09-22, after this brief flagged it was missing). This brief documents the **search-specific** pieces in full (Section 4) and only summarizes the reused PLP-family pieces with a pointer to that brief, rather than re-documenting card/grid/pagination behaviour it now owns properly.

**Reworked 2026-09-29** after the 2026-09-24 design meeting: the page's own search box is gone (one heading line with an "in Products ▾" switcher replaces it), matching site pages appear as buttons beside the heading, and results are now vehicle-aware. Sections 3, 4.1, 4.5 and the new 4.7 describe the current build; `search-results-spec.md` Section 9 has the reasoning.

**Build status:** built as `prototypes/search-results/index.html`, worked example query is "roof rack" (16 results spanning Roof Racks and Bike Racks, including 3 Ford Ranger products added 2026-09-29 to demo vehicle-aware ordering). Playwright-verified across every round below: desktop (1440px) and mobile (390px, zero horizontal overflow), category quick-tabs + Level 3 icon-card filtering, zero-results state, mobile filter drawer, sidebar merchandising, header search entry points. Zero console errors throughout (the old favicon 404 is gone; the page now loads the real favicon, 2026-09-29). Pushed to `main` across several commits from 2026-09-21 through 2026-09-22 (`6504017` initial build, `240c273`/`af18f60`/`6b218d1`/`e450ed1` follow-ups) — see the spec doc and project memory for the exact history if needed.

---

## 2. Typography & colour reference

Same type scale and colour tokens as `DEVELOPER-BRIEF.md` Section 2 (Barlow Condensed for headings/buttons, Lato for body text, the full `--rrg-*` custom-property table) — not repeated here. No page-specific typography deviations.
- **Page H1 (2026-09-29):** this page used to be the odd one out, at 28px on desktop and 22px on mobile. It now uses the one shared page-H1 rule, 32px / 1.1, stepping down to 28px at 640px and below, the same as the PDP and the PLP hero.
- **Other shared rules:** buttons, section spacing (48px), tooltips, drawers and carousel dots all follow the site-wide rules from the same pass. They are listed once in `PLP-DEVELOPER-BRIEF.md` Section 2.

The product grid/card, filter sidebar, and sort/pagination controls use the same classes and styling as the PLP/VPLP/Camping templates (`plp.css`) — again, no deviation specific to this page. The only genuinely new visual patterns this page introduces are documented with their own styling notes in Section 4 (category quick-tabs, the zero-results empty state, and the Level 3 icon-card counts).

---

## 3. Page Layout — Search Results

One page, section order top to bottom:

1. Global Header (incl. the search box that leads here — Enter, the search button, or the dropdown's links) + vehicle strip
2. Breadcrumb — "Home > Search results for > \<query\>" (not a real taxonomy trail, since a search isn't a category). "Home" is a link (fixed 2026-09-29); the middle crumb isn't. It sits in the same `.plp-crumbs-row` as the PLP family, which is always one line and truncates with an ellipsis.
3. Heading line — `Search results for "<query>" in Products ▾` + count on the left, up to 3 page buttons on the right (Section 4.1)
4. **Products view** (the switcher's default):
   1. Vehicle strip — only when the results contain vehicle-specific products (Section 4.7)
   2. Category quick-tabs (Section 4.2)
   3. Toolbar (reused from PLP), left to right: grid/list toggle → "Refine Results" (mobile only) → "Showing 1-12 of N Results", with "Sort By" on the right. This page's order became the standard for every PLP-family page on 2026-09-29.
   4. Two-column layout below the toolbar:
      - **Sidebar:** Filters (universal facet set, Section 4.3) + Merchandising block (Section 4.4)
      - **Main:** Level 3 icon-card row when one category is narrowed (Section 4.2) → product grid/list (reused from PLP) → pagination (reused)
      - **OR**, if the query matches no products: the zero-results state replaces the grid/pagination (Section 4.5)
5. **OR Pages / Articles / Brands view** — replaces everything in item 4 when chosen in the switcher (Section 4.1)
6. Global Footer. The gap above it is 48px, the same as every other page; it used to be about 88px here.

**Screenshots:**
- Desktop (1440px), full page, default "roof rack" query: ![Search Results — desktop full page](search-results-dev-brief-assets/fullpage-desktop.png)
- Mobile (390px), full page: ![Search Results — mobile full page](search-results-dev-brief-assets/fullpage-mobile.png)

---

## 4. Component Library

### 4.1 Heading Line — query, "in Products ▾" switcher, page buttons

**Name:** Heading Line (replaced the old Results Bar + "Search Results" heading, 2026-09-29)

**Location:** directly below the static breadcrumb — the first thing on the page.

**Purpose:** say what was searched for and get the shopper to results immediately. The page used to have a generic heading and its own search box stacked above the tabs, which pushed every product below the fold; the header search box already does the searching, so this page no longer has one.

**Contents, left to right:**
- `<h1>`: `Search results for "<query>"`, on the shared page-H1 rule (32px, 28px at 640px and below; Section 2).
- **Switcher** — `in Products ▾` (styled like the heading, in brand red with a 2px underline; modelled on Supercheap Auto's search page). It is set at the heading's size, 32px, dropping to 28px on smaller screens (`.plp-search-scope-in` / `.plp-search-scope-btn`). Opens a small menu: **Products (N)**, **Pages (N)**, **Articles (N)**, **Brands (N)**. Products is always listed, even at 0; the others only appear when they have at least one match.
- Count for the current view, e.g. "16 products".
- **Page buttons** (right-aligned, max 3; `.btn-outline` at the shared small size, 13px or 12px on phones) — site pages whose keywords match the query *and* are flagged as button-worthy: Fit My Vehicle, the matching vehicle landing page (VCLP), Find a Store. Help articles and plain info pages (Warranty, Delivery...) never appear as buttons, only inside the Pages/Articles views. Vehicle pages (e.g. "Toyota Hilux Roof Racks") only appear when a vehicle is set in session or the query names that vehicle.

**Switcher views — same frame, different content** (reworked 2026-09-29 after Brenton found the first version's plain card grid too big a jump from Products): every view keeps the same page skeleton — tab row, toolbar (count + sort), filter sidebar + merchandising, 3-column card grid on the same product-card frame (image top, body, full-width action at the bottom). Only the content changes:

| View | Tab row | Sidebar filters | Sort | Card |
|---|---|---|---|---|
| Products | Categories in the results (4.2) | Universal facets (4.3) | Relevance, Newest, Best Selling, Highest Rated, Price: Low to High, Price: High to Low (the shared `PLP_PRODUCT_SORT_OPTIONS` list) | Product card |
| Pages | Vehicle Pages / Categories / Tools & Services / Help & Policies | Page Type | Relevance, Title A–Z | Image, type, title, one-line description, View Page |
| Articles | The same product categories as Products, same icons (Roof Racks / Bike Racks / Roof Boxes…) | Topic, Type (Buying Guide / FAQ) | Relevance, Title A–Z | Image, "FAQ · Roof Racks", title, description, Read Article |
| Brands | The categories each brand sells (a brand can appear under several) | Sells | Relevance, Name A–Z | Logo (or wordmark), name, what it sells, Shop \<Brand\> |

Tabs only show categories/groups that have results. The grid/list toggle and vehicle strip are Products-only. The Pages, Articles and Brands filter groups (Page Type, Topic, Type, Sells) have the same tooltip icon as every product filter (`plpFilterTooltipHTML()`, since 2026-09-29). Their copy is the generic "Narrow your results by \<filter\>." fallback. Each view keeps its own tab/filter/sort selection, so switching back to Products restores exactly what was selected there. The chosen view is written to `?type=` so it survives a reload or shared link.

**Listing images:** every page and article card needs its own primary image — **not the site-wide Facebook share image**, which is the same on every page. In the prototype, real article images come from the help centre where they exist; the live static pages have no images at all and 7 of the articles don't either, so those use a relevant real product photo marked as a stand-in. A page with no image at all shows a logo fallback tile (Warranty/Delivery/Returns in the demo) — build that fallback for older pages/blogs, and **add a listing-image field to every CMS page and blog post** going forward.

**Behaviour:** the query arrives as `?q=` and is also copied back into the header search box on this page, so the shopper can edit it in place. The header box now genuinely submits — Enter or its search button navigate here (previously only the dropdown's "View All Results" link did).

**Data source:** the prototype matches Pages/Articles/Brands against a shared hardcoded list in `shared.js` (`RRG_SEARCH_PAGES`, `RRG_SEARCH_BRANDS`) — every entry is a real page, brand page or help-centre article crawled 2026-09-29. **In Magento these should come from the search index** (Algolia), indexed alongside products, with a "show as button" flag on the handful of pages that should appear as heading buttons.

**Mobile:** the heading wraps; page buttons drop onto their own row underneath as a single horizontally scrolling line.

**Screenshots:** ![Heading line, vehicle set](search-results-dev-brief-assets/headline-closeup.png) ![Switcher open](search-results-dev-brief-assets/switcher-open.png) ![Articles view](search-results-dev-brief-assets/switcher-articles.png)

---

### 4.2 Category Quick-Tabs + Level 3 Icon-Cards

**Name:** Category Quick-Tabs (top) / Level 3 icon-cards (below the toolbar, conditional)

**Location:** quick-tabs sit directly below the heading line (and the vehicle strip, when shown); the icon-card row (when present) sits between the toolbar and the product grid.

**Purpose:** replaces PLP's fixed "SHOP BY" tabs with a set **dynamically built from whichever categories actually appear in this search's result set** — e.g. a "roof rack" query pulls real matches from both the Roof Racks and Bike Racks catalogues, so both appear here; a query that only matched one category would only show one tab (plus "All"). Unlike PLP's SHOP BY (deliberately real, indexable per-category URLs), these tabs are **in-page filtering only** — a search result set isn't itself a taxonomy node, so there's no SEO reason to hard-URL each one.

**Contents:** "All (N)" plus one tile per category present in the result set, each showing a live count — e.g. `ALL (13) | ROOF RACKS (8) | BIKE RACKS (5)`. Selecting a tab (or the sidebar's Category filter checkbox, Section 4.3 — both control the same underlying selection, kept in sync) narrows to one category and, if that category has sub-types configured, reveals a row of icon-cards for them directly above the grid (e.g. within Roof Racks: Platform/Trays (2), Thru Bars (5), Flush Bars (1) — counts sum back to the parent tab's 8). This icon-card pattern is reused unchanged from the Camping template's own Level 3 nav-depth cards; the only search-specific addition is that **these cards show a live result count**, added 2026-09-22 after review — on plain PLP/Camping this same component is pure navigation (no count, since the catalogue there is fixed), so don't expect this exact count behaviour if you're cross-referencing that other usage.

**Click action:** selecting a tab or icon-card is a pure client-side re-filter — no page navigation, no URL change.

**Screenshot (tabs + Level 3 cards + synced sidebar checkbox, Roof Racks selected):** ![Quick-tabs and Level 3 cards](search-results-dev-brief-assets/tabs-level3-closeup.png)

---

### 4.3 Filters (universal facet set)

**Name:** Filters sidebar

**Location:** left column, below the heading line/tabs, alongside the product grid.

**Purpose:** PLP's per-category configured facets (e.g. Bike Racks' "how many bikes," Roof Racks' "cross bar quantity") can't apply here, since a mixed result set may span categories that don't share an attribute schema. This page instead shows a fixed **universal** facet set that every product in the catalogue carries regardless of category.

**Contents:** Category (same set as the quick-tabs, Section 4.2 — one shared selection, not a second independent filter), Brand, Price (range buckets, not exact-match — a new engine mode, see the note below), Availability (the same site-wide filter as every PLP-family page, with options that follow Build Phase / store set — PLP brief 4.5, reworked 2026-09-29), Customer Rating. Every option shows a live count that narrows correctly against both the active query *and* any other active filters (confirmed important during build — see the engine note below). No priority-filter treatment (the red-outline buyer-journey groups are a per-category concept from `plp-spec.md` that doesn't map onto an arbitrary mixed set), and no category-specific technical facets. Every group has the shared filter tooltip icon (PLP brief 4.5), and the sidebar and mobile drawer both have a "Clear Filters" link.

**Engine note for whoever maintains `plp.js`:** two additions were needed to the shared engine to support this page, both gated behind a `PLP_CONFIG.isSearch` flag so `plp`/`vplp`/`plp-camping` are unaffected: (1) a `'range'` facet mode in `plpValueMatches()` — every other facet mode reads `product.facets[key]`, but Price here reads `product.price` directly; (2) the search-query text match itself lives in the same choke point (`plpMatchesFiltersExcept()`) as every other filter check, so a query like "roof rack" narrows the pool *before* facet counts are computed — doing this later, only in the final grid render, would have left the sidebar's counts wrong (counting against the whole catalogue instead of the query's matches).

**Screenshot:** ![Filters sidebar](search-results-dev-brief-assets/filters-closeup.png)

---

### 4.4 Merchandising Sidebar

**Name:** Merchandising Sidebar (promo carousel + Featured Product)

**Location:** directly below the Filters panel, same column.

**Purpose:** added 2026-09-22 — this page was missing the same sidebar merchandising slot every PLP/VPLP/Camping page already has. No engine change was needed at all; the shared `plpRenderMerchSidebar()` function already supported any page generically, this page's markup and config just hadn't been wired up to it yet.

**Contents:** a promo image carousel (dots if more than one slide) + a "Featured Product" card below it. **Because this page has no single category to draw a "real" category-level promo from, it uses a cross-category promo instead** (a storewide sale tile) rather than PLP's per-category promo — same reasoning as Section 4.3's dropped priority-filter treatment. The featured product is a single hardcoded pick from the demo dataset; in production this would presumably follow whatever merchandising rule Magento applies (same open question as the equivalent PLP component, not specific to this page). Since 2026-09-29 the Featured Product card uses the product card's own price markup and "SAVE X%" corner band (PLP brief 4.9). The carousel dots are the shared round grey dots, with a red active dot.

**Screenshot:** ![Merchandising sidebar](search-results-dev-brief-assets/merch-closeup.png)

---

### 4.5 Zero-Results State

**Name:** Zero-Results State

**Location:** replaces the entire product grid + pagination area when the active query matches nothing.

**Purpose:** genuinely new — every PLP/VPLP/Camping template has products by construction, so this is the first page type in this project that needs a real empty state.

**Contents, top to bottom:**
1. `No products found for "<query>"` heading + a short hint to check spelling, try fewer words, or a more general term. (Spelling correction / "did you mean" was explicitly scoped out for this round — see the spec doc Section 8 — this is a static hint line only, not a real suggestion engine.) **Added 2026-09-29:** if the query matched no products but did match pages, articles or brands (e.g. "warranty"), a line underneath says "We did find 1 page matching your search", linking straight to that view of the switcher (4.1).
2. **Popular Categories** — three links to the real Roof Racks/Bike Racks/Camping Gear category pages (not `href="#"` placeholders).
3. **"You Might Like"** — a small featured-product row reusing the exact same product card component as the main grid. **Built as a genuine horizontal-scroll carousel** (not a wrapping grid) — exactly 3 cards visible on desktop with the 4th+ reachable by scroll; this was a real regression caught and fixed 2026-09-22 (an in-progress edit had briefly turned it into a 3-column grid, which wrapped the 4th card onto a visible second row instead of scrolling).

**Subheadings (2026-09-29):** "Popular Categories" and "You Might Like" (`.plp-search-empty-subheading`) use the shared section-heading style, the same as "Related Products" elsewhere. They sit on the shared 48px section spacing, with 16px to their content. "You Might Like" was an 18px red one-off before.

**Screenshot:** ![Zero-results state](search-results-dev-brief-assets/zero-results-closeup.png)

---

### 4.6 Product Grid/Cards, Sort, Pagination, Mobile Filter Drawer (reused, not re-documented)

**Location:** main content column; mobile filter drawer is a right-edge slide-out triggered by a "Refine Results" button, mobile only.

**Purpose/contents:** identical to the PLP/VPLP/Camping templates. This covers:
- grid/list toggle, with a 3-per-row desktop grid
- ribbons (Phase 2 preview only)
- sale pricing (Save X% corner band) in the region's currency
- Add to Cart vs. View Options split, both gold `.btn-cta` (green in the UK)
- Out of Stock and Discontinued, which both show a disabled button
- "(N Reviews)"
- Show Specs expandable row
- Compare Products checkboxes/drawer (Phase 2 preview only)
- Sort dropdown (Relevance/Newest/Best Selling/Highest Rated/Price: Low to High/Price: High to Low, from the shared `PLP_PRODUCT_SORT_OPTIONS`)
- desktop numbered pagination + mobile "Load More (N)"
- the mobile filter drawer (shared 420px drawer, closes on Escape)

**None of this is re-documented here** — see `docs/plp/PLP-DEVELOPER-BRIEF.md` Section 4 (4.6, 4.8, 4.12) for the real component-level detail (Name/Purpose/States/screenshots per widget). This brief only confirms that search-results uses these components completely unchanged.

**Demo State Panel (prototype only, don't build):** on this page it shows only **Phase 2 previews** (Compare Products, Product ribbons; disabled until Site Admin is on Build Phase 2) and **Search shortcuts**. The shortcuts are demo query links: "roof rack", "ranger", "bike racks", "warranty", and "snorkel" for zero results. The old Default view and Grid columns controls were removed on 2026-09-29. See PLP brief 4.13.

**Screenshot (mobile filter drawer, showing the same universal facet set as 4.3):** ![Mobile filter drawer](search-results-dev-brief-assets/mobile-drawer.png)

---

### 4.7 Vehicle-Aware Results (fitment strip, ordering, card fitment status, Add to Cart notice)

**Name:** Vehicle-aware results (added 2026-09-29)

**Location:** strip between the heading line and the category tabs; "Fits" tag on product cards; the notice is a centred pop-up over the page.

**Purpose:** search results mix vehicle-specific products (rack sets, platforms, fitting kits) with universal ones. A shopper who has told us their vehicle should see what fits first; a shopper who hasn't should be nudged to, and shouldn't quick-add the wrong vehicle's rack set without being warned.

**Source of truth:** the session vehicle — the same one the header's "Your Vehicle: …" shows. In the prototype it is set by the Site Admin Panel's **Vehicle** select (None / Toyota Hilux / Ford Ranger; `rrgVehicle()` in `session-state.js`), which replaced the old "Vehicle Set" checkbox on 2026-09-29. Choosing Ford Ranger demos the "doesn't fit" states against the Hilux products without a separate control. Each product carries which vehicle it fits (`fitsVehicle` in the prototype; empty for universal products).

**One component, three levels of detail (2026-09-29, Brenton):** the strip and the card status are the **same component as the vehicle-specific PDP's fitment card** (`.fitment` in `shared.css`: white box, 3px coloured left border, car icon, Barlow uppercase label, detail line), in the same three states and colours — green *fits*, red *doesn't fit*, amber *confirm your vehicle*. The PDP card is the full version; the strip is the same card with an action button on the right (`.btn-outline-red.btn-sm`, the site-wide Change Vehicle style); the product-card status is the compact version (`.fitment.fitment-compact`: a single label line, no actions). Both the strip and the card status literally use the PDP card's CSS classes, so they can't drift apart — build it as one shared component in Magento.

**States:**
- **Vehicle set, Sort = Relevance:** results ordered in three tiers — fits the session vehicle → not vehicle-specific → fits a different vehicle — with normal relevance order inside each tier. **Nothing is hidden or filtered out** (the meeting was explicit: matches "take precedence", not "exclusively"). Strip (green): "FITS YOUR VEHICLE FIRST — Products that fit your Toyota Hilux N80 are shown first." + Change vehicle. If nothing in the results fits (e.g. searching "ranger" with a Hilux set), the strip goes red: "NOTHING HERE FITS YOUR VEHICLE — None of these vehicle-specific products fit your Toyota Hilux N80."
- **Vehicle set, any other sort:** the shopper's chosen sort wins; no tier ordering, no strip (card statuses still show).
- **No vehicle set:** normal relevance order. Strip (amber): "CONFIRM YOUR VEHICLE — Some of these products are vehicle-specific. Set your vehicle to see what fits first." + Select your vehicle, which opens the site-wide Fit Finder drawer (`HEADER-DEVELOPER-BRIEF.md` 4.10); Change vehicle does the same. Only shown when the results actually contain a vehicle-specific product — a "bike racks" search gets no strip.
- **Product-card status**, between the product name and the reviews on grid cards (above the name in list view), centre-aligned in grid view, vehicle-specific products only: one line only, naming the make/model so it stays slim — green "FITS YOUR TOYOTA HILUX", red "DOESN'T FIT YOUR TOYOTA HILUX", or amber "SUITS TOYOTA HILUX ONLY" (the product's vehicle) when no vehicle is set. The car icon is hidden at 640px and below. **Hover / tap / keyboard focus shows a tooltip with the full vehicle** (added 2026-09-29 after the team pointed out "Suits Toyota Hilux only" doesn't say which Hilux): fits — "Confirmed for your Toyota Hilux N80 (4dr Ute, Bare Roof, 2015 to 2026)."; no vehicle — "This product is specific to the Toyota Hilux N80 (4dr Ute, Bare Roof, 2015 to 2026). Set your vehicle to confirm it fits."; doesn't fit — "This product is built for the Ford Ranger P703 (…) — not your Toyota Hilux N80 (…)." It drops down over the card under the label, using the one shared tooltip bubble (the same as the filter tooltips): footer charcoal (#211E20), white Lato 14px. In the no-vehicle state "Set your vehicle" is a link (and "Change your vehicle" in the doesn't-fit state) that opens the site-wide **Fit Finder drawer** (`HEADER-DEVELOPER-BRIEF.md` 4.10). **This is on every PLP-family page, not just search** — the Vehicle PLP shows it on every card (all its products are Hilux N80 rack sets); the bike-rack and camping PLPs have no vehicle-specific products, so nothing shows there. The Add to Cart notice below works on every PLP-family page too.
- **Quick Add to Cart on a vehicle-specific product, no vehicle set:** the product **is added** (nothing is blocked), then a pop-up: "✓ Added to cart", the product thumbnail + name, and an amber warning — "You haven't set a vehicle yet. This product only fits the Toyota Hilux N80 4dr Ute (2015 to 2026). Please confirm it fits your vehicle before ordering." — with Set Your Vehicle / Continue Shopping buttons. Closes on the ×, the backdrop, Escape or Continue Shopping.
- **Same, but a different vehicle is set:** same pop-up, warning reads "This product is for a different vehicle. It's made for the Ford Ranger P703 4dr Ute (2022 onwards), but your vehicle is set to the Toyota Hilux…", button reads Change Vehicle. (Not raised in the meeting — added because it's the same risk.)
- Products with options (siblings/grouped) keep "View Options" instead of quick add, so they never trigger the pop-up — the PDP handles vehicle confirmation for those.

**For Magento:** the pop-up logic is purely client-side on the add-to-cart response; it needs the product's fitment vehicle and the session vehicle, both of which already exist for the PDP's own fitment checks.

**Screenshots:** ![No-vehicle strip](search-results-dev-brief-assets/vehicle-strip-none.png) ![Add to Cart vehicle notice](search-results-dev-brief-assets/vehicle-notice.png)

---

## 5. SEO & Structured Data

**Location:** the page `<head>` — not a visible widget, so it doesn't follow the Name/Location/Purpose/screenshot template used above.

**Decided (Brenton, 2026-09-22): this page is not indexable.** It doesn't need to be findable by Google at all — query-dependent, unstable content is exactly the case a search-results page is normally kept out of the index for, and RRG doesn't need it discoverable via search regardless.

**What's built:** the prototype now carries `<meta name="robots" content="noindex, nofollow">` in its `<head>`, matching that decision. No meta description, canonical tag, Open Graph tags or `BreadcrumbList`/`ItemList` JSON-LD exists on this page, and **none of that needs building** — it would only matter for a page meant to be indexed. It is the only listing page left without them on purpose; PLP and Camping got them on 2026-09-29. Like every page since 2026-09-29, it has `<html lang="en-AU">` and the real favicon. The `<title>` is `"Search Results — Roof Racks Galore"`, which follows the site-wide "Page name — Roof Racks Galore" format. Still give it a real title in the Magento build regardless of noindex status, since the tab/window title and any internal tooling that reads it benefit from one.

**For the real Magento build:** carry the same `noindex, nofollow` directive through (or an equivalent robots.txt/canonical-based exclusion, whichever fits the site's existing SEO tooling) — this is a one-line implementation once the decision itself was the only open question.

---

## 6. Known gaps before production

1. ~~No PLP Developer Brief exists yet~~ — **resolved 2026-09-22**, see `docs/plp/PLP-DEVELOPER-BRIEF.md`.
2. ~~SEO strategy for this page type is a genuinely open decision~~ — **resolved 2026-09-22**: not indexable, see Section 5.
3. ~~The header search box now has real functionality feeding into this page, not yet documented in `HEADER-DEVELOPER-BRIEF.md`~~ — **resolved 2026-09-22**, see that brief's new Component Library entry for the search typeahead/focus-state dropdown/View All Results link.
4. **Universal filter set (Brand/Price/Availability/Rating) is this project's own proposed minimum**, not a client-confirmed list (spec doc Section 8, item 4) — flag for review.
5. **Compare Products / VRS-adjacent card behaviour in a mixed result set** was assumed to need no special-casing (card behaviour is card-level, not page-level) but hasn't been specifically visually verified with a VRS product sitting next to non-VRS products in the same grid (spec doc Section 8, item 3).
6. **Category quick-tabs vs. sidebar Category filter showing the same categories in two places** was a deliberate design call (one shared selection, two surfaces), but is worth confirming with Brenton/the client that it doesn't read as redundant now that it's actually visible and built (spec doc Section 8, item 2).
7. **How the category tabs are built from a real search** (which Level 1 tabs a query like "bracket" produces, and whether a Level 1 then expands its Level 2 like the mega menu) — left for Marc to work out with the search engine's category data, per the 2026-09-24 meeting.
8. **Query intent parsing** (e.g. "Hilux roof racks" → set the vehicle and Roof Racks category automatically instead of keyword-matching) — floated in the meeting as worth doing if the search engine supports it; not prototyped.
9. **Pages/Articles/Brands need indexing** alongside products (Section 4.1 data source note) — the prototype's hardcoded lists are demo-only.
