# VLP (Vehicle Landing Page) — Engineering Spec

Project: the landing page a shopper arrives on after setting their exact vehicle in the site-wide Fit My Vehicle drawer. One page per **exact vehicle**: make + model + year range + body + roof type.

Companion to `spec.md` (PDP), `docs/plp/plp-spec.md` (PLP/VPLP), `docs/search-results/search-results-spec.md`, the header/footer specs and the VCLP (`docs/vehicle-category-landing/`). Same conventions: plain HTML/CSS/JS prototypes, `prototypes/_shared/` component library, Playwright verification before sign-off, push only once approved.

Source design: `VLP WIP - Desktop - Brenton - Logged In (1).png` at the project root (desktop only, Ford Ranger 2022+ 4dr Ute with Raised Roof Rail). It predates several components we have since built. Where they overlap, the built component wins (Section 5).

Planning session: 2026-09-29. Decisions in Section 11 were answered by Brenton the same day.

---

## 0. Goal & scope

Give a shopper who has just told us their exact vehicle one page that shows everything that fits it, grouped by category. It also confirms we know their vehicle: their vehicle's photo, recent real fitments on the same vehicle, and the products that sell most for it.

**In scope:** the VLP template, a new category tile component, a compact Store Finder block, a product-card carousel, routing from the Fit My Vehicle drawer, the page-vs-session vehicle notice, the VPLP breadcrumb change, and housekeeping (index card, Site Admin template list, glossary).

**Out of scope:** real results routing or URL generation (backend), real per-vehicle category availability (which tiles show for which vehicle is backend data), and the VLP developer brief (written once the page is stable).

---

## 1. Terminology

| Term | Meaning |
|---|---|
| **VLP** | Vehicle Landing Page. This page. One per exact vehicle (make/model/year/body/roof). **Not indexed** (Section 9). |
| **VCLP** | Vehicle Category Landing Page (`prototypes/vehicle-category-landing/`). One per make/model (+ category). Owns the indexable, upper-funnel vehicle search terms ("Hilux N80 roof racks"). |
| **VPLP** | Vehicle PLP (`prototypes/vplp/`). One category's product results for an exact vehicle. A VLP category tile links to it. |
| **Page vehicle** | The vehicle the VLP is *for*, fixed by its URL. |
| **Session vehicle** | The vehicle saved in the shopper's session/account (Site Admin "Vehicle" in the prototype, `session-state.js`). |

How the vehicle pages relate: **VCLP** (make/model, indexed) → **VLP** (exact vehicle, all categories, not indexed) → **VPLP** (exact vehicle + one category) → **PDP**.

---

## 2. Worked examples & page vehicle

**Both vehicles are supported** (Brenton, decision 1):

| | Toyota Hilux | Ford Ranger |
|---|---|---|
| Spec | N80, 2015–2026, 4dr Ute, Bare Roof | P703, 2022 onwards, 4dr Ute, Raised Roof Rail (as in the Figma) |
| Photo | `vehicle-toyota-hilux.webp` ✅ | `vehicle-ford-ranger.png` ✅ |
| Make badge | `brand-toyota-badge.png` ✅ | `brand-ford-badge.png` ✅ (from the Figma file, 2026-09-29) |
| Fitment Gallery | 16 real Hilux N80 fitment photos ✅ | None exist, so the section is **hidden**. That's a realistic empty state to demo, not a placeholder |

- The **page vehicle** comes from the URL (`?vehicle=hilux|ranger`, default Hilux). A Demo State Panel control, "Page vehicle (landing URL)", switches it.
- The **session vehicle** stays in Site Admin as today.
- One vehicle record drives everything on the page: H1, hero copy, breadcrumbs, tile copy, carousel heading and fitment, and the Fitment Gallery.
- The Ranger's roof type in `PLP_VEHICLES` (plp.js) currently says "Bare Roof". It changes to "Raised Roof Rail" to match the Figma, so every page describes the Ranger the same way.

---

## 3. Entry points / routing

(Brenton, decision 2)

| Trigger | Behaviour |
|---|---|
| **Fit My Vehicle drawer "Set My Vehicle"** when opened from the header (the utility-bar vehicle link) | Sets the session vehicle **and navigates to the VLP** for that vehicle. Since 2026-09-30 the "Fit My Vehicle" nav link goes to the Fit My Vehicle page instead (`docs/fit-my-vehicle/`), whose own Fit Finder also lands here. |
| Fit My Vehicle drawer opened from in-context triggers (PLP card tooltips, Set/Change Vehicle on the PLP family, search vehicle strip, Add to Cart notice) | Unchanged: sets the vehicle in place, no navigation. |
| **VCLP Fit Finder "View Results"** | Goes to the **VPLP**, not the VLP. The VCLP is already category-scoped, so the shopper wants that category's results for their exact vehicle. Replaces the current stub. |
| VLP "Change Vehicle" (breadcrumb row) | Opens the Fit My Vehicle drawer as a header trigger, so submitting it lands on the new vehicle's VLP. |

**Implementation:** the trigger carries a flag (e.g. `data-open-fit-finder="navigate"`), and the drawer's submit handler navigates only when it was opened that way.

---

## 4. Page vehicle vs session vehicle

(Brenton, decision 3)

| Session vehicle on arrival | Behaviour |
|---|---|
| None | Silently set it to the page vehicle. |
| Same as the page vehicle | Nothing. |
| **Different** | Don't overwrite. Show a small notice under the breadcrumbs: "You're viewing the **Ford Ranger P703**. Your saved vehicle is the **Toyota Hilux N80**. [Make this my vehicle] [View my Hilux]". "Make this my vehicle" sets the session. "View my Hilux" goes to the session vehicle's VLP. The notice can be dismissed. |

The notice **is** the Fitment Status card in its no-fit state (`.fitment.no_fit` — white, red left border, red car icon and label), so it reads exactly like the PDP's and the product cards' "Doesn't fit your …" (Brenton, 2026-09-29; the first build used an amber banner). Its buttons are the fitment card's red-outline ones, never gold.

---

## 5. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 5.1 | Header / utility bar | Global shell as-is | "Your Vehicle: …" shows the session vehicle, not the page vehicle. |
| 5.2 | Breadcrumbs + Change Vehicle | `.plp-crumbs-row` + `.rrg-crumbs` + `btn-outline-red` | Trail in Section 6. Change Vehicle stays in the breadcrumb row (2026-09-18 review), not the gold hero button the Figma shows. |
| 5.3 | Page-vs-session notice | Section 4 | Conditional. |
| 5.4 | Hero | `.plp-hero` + `.plp-hero-media` + make badge (same as the VCLP) | H1: "Shop Roof Racks & Accessories for your {Make} {Model} {Years} {Body} with {Roof}" ("Shop … for your" added 2026-10-02 to match every category hero; the `<title>` is unchanged). Short intro copy, no hero CTA. |
| 5.5 | "{Vehicle} Specific Roof Racks & Accessories" | **New category tile component** (Section 7): 1 feature tile + 6 standard tiles + the compact Store Finder block (5.6) in the Figma's grid positions | Feature tile = Roof Racks, with body copy and one CTA ("Shop Crossbars & Platforms"). Standard tiles: Bike Racks, Roof Boxes, Awnings, Roof Top Tents, Roof Rack Accessories, Vehicle Specific Accessories. |
| 5.6 | Compact Store Finder block | **New, derived from the Showroom Finder widget** | Black block: "Store Finder" heading, "35+ Locations Nationwide", postcode field, Use My Location, nearest store line, mini map. Opens the existing Store slide-out. The region cascade applies (NZ/UK heading copy, same as the Showroom Finder). **Why it stays (Brenton):** it's the flexible filler for 5.5's grid. When a vehicle-specific tile drops out, the Store Finder widens to take its space (Section 7.1), the same way the PDP's Get It Installed panel widens when there's no video (`.install-media-row.no-video`). The grid never has a hole. |
| 5.7 | "Adventure Carriers & Accessories for the {Vehicle}" (grey band) | Category tile, compact size, 12 tiles | Baskets, Luggage Bags, Trade & Work, Lighting, Tie Downs, Recovery Gear, Fishing, Water Sports, Snow Sports, Camping, Fridge Slides, Other Accessories. **All non-vehicle-specific, so they always show.** |
| 5.8 | "Vehicle Specific Accessories for the {Vehicle}" | Category tile, compact size, 5 tiles | Towing Mirrors, Roller Shutters, Storage & Drawers, Protection & Trim, Misc Vehicle Accessories — the live site's category names (renamed 2026-10-07 from the Figma's Underbody Protection / Rear Drawers / Internal Storage / More Accessories). **All vehicle-specific:** each tile shows only if it has fitting products. **If none do, the whole section is hidden.** Each tile opens its tab on the Vehicle Specific Accessories VPLP (`?attachment=<tab>`), and the top section's Vehicle Specific Accessories tile opens that VPLP on Show All — see Section 11. |
| 5.9 | Fitment Gallery | **The existing widget, unchanged** (`.fit-gallery-section`, `initFitGalleryCarousel()`, `buildFitGallerySlideout()`) | Replaces the Figma's red "RECENT FITS" banner and its duplicate Change Vehicle button. Populated with the page vehicle's fitments. Hidden when there are none (the Ranger). |
| 5.10 | Trust banner | `.vclp-trust-banner` as-is | Already has the Reviews.io badge and the Book An Installation / Store Finder CTAs. |
| 5.11 | "Popular Racks for your {Vehicle}" | **New product-card carousel** (Section 8) | New PLP card. |
| 5.12 | FAQ | `.faq-section` / `.faq-item` | Not in the Figma. Added so the shared per-master-vehicle FAQ (2026-09-18 review item 6) has somewhere to show. 4–6 vehicle-specific Q&As. |
| 5.13 | Shop The Best Brands | `.brands-section` as-is | Every real brand logo in `_shared/`. |
| 5.14 | Footer | Global | |

**Dropped from the Figma, with reasons:** the gold hero "Change Vehicle" button (yellow overload and the one-primary-CTA rule, and it duplicates the breadcrumb-row button); a gold "Shop X" button on every tile (25 gold buttons on one page); the red "RECENT FITS" banner (replaced by the real widget); the raw `{{vehicle_make}}` tokens in the Roof Racks copy (rendered as real text, with the tokens listed as backend fields in the dev brief).

---

## 6. Breadcrumbs (decision 5 — VPLP becomes a child of the VLP)

One vehicle trail family, extended down from the VCLP (`spec.md` §15 L8):

| Page | Trail |
|---|---|
| VCLP | Home › Vehicles › Toyota › Hilux |
| **VLP** | Home › Vehicles › Toyota › Hilux › 2015–2026 › 4dr Ute › Bare Roof |
| **VPLP (changed)** | Home › Vehicles › Toyota › Hilux › 2015–2026 › 4dr Ute › Bare Roof › Roof Racks (was `… › Hilux › Roof Racks`) |

- On the VLP the last crumb is plain text. Year and Body link back up to the VCLP, since there's no page per year or per body.
- On the VPLP, "Bare Roof" links to the VLP.
- BreadcrumbList JSON-LD stays on both, mirroring the visible trail, even though the VLP is noindex, because it's harmless and the VPLP's could be indexed later.
- `spec.md` §15 L8, `PAGE-GLOSSARY.md`'s Breadcrumbs row and the PLP brief are updated to match.
- **Open:** Vehicle-Specific PDP's trail (`… › Hilux › Platforms & Trays › <product>`) is not changed in this round (Section 12).

---

## 7. Category tile component (new, shared)

Lives in `shared.css` under a generic name (`.cat-tile`, `.cat-tile-grid`) so any page can reuse it.

- **Look:** photo tile with a white 6px-radius card, the title overlaid in Barlow Condensed Bold uppercase on a top dark gradient scrim, and a quiet label strip below ("Shop Bike Racks" as text with a chevron, **not** a gold button). The whole tile is one `<a>`. Hover lifts the tile slightly and darkens the scrim.
- **Sizes:** `feature` (tall, with body copy + one gold CTA), `standard` (5.5), `compact` (5.7 / 5.8, sits in a grey card).
- **Desktop grids:** 5.5 follows the Figma (feature tile spans 2 rows, 4 columns of standard tiles, Store Finder spans 2 columns). 5.7 is 6 columns × 2 rows. 5.8 is 6 × 1.
- **Mobile (≤900px):** feature tile full width; standard tiles 2-up; compact tiles 3-up; Store Finder full width.
- **What a tile links to (production):** that category's PLP, which opens in its Vehicle-Set state because the session vehicle is now set. For example, Lighting → the Lighting PLP with the hero "Shop Lighting for your Ford Ranger". A vehicle-specific category (Roof Racks, for example) lands on its VPLP. The VLP is a hub that sends shoppers onward; it doesn't list products itself (apart from the 5.11 teaser).
- **Links in the prototype:** Roof Racks → `../vplp/`, Bike Racks → `../plp/`, Camping → `../plp-camping/`. Everything else is `#`. No new PLP pages are built for the other tiles.
- **Images:** the originals from the Figma file (`Website (WIP)`, frame `3210:12051`), pulled via the Figma MCP on 2026-09-29. Many of them aren't on the live site. There are 25 tiles in `prototypes/_shared/category-tiles/<slug>.webp`. Where Figma held two copies of an image, the higher-resolution one was used, capped at 900px (1400px for the Roof Racks feature tile). Known weak spots: **Camping is only 240×240 in the Figma** and will look soft at the feature/standard sizes (it's a compact tile, so borderline acceptable). **Roof Top Tents is 512×342.** The top-section **Vehicle Specific Accessories** tile and **Underbody Protection** use the same underbody photo, as they do in the Figma. Category names now match the live site and `nav-data.js` (2026-10-07). Storage & Drawers, Protection & Trim and Misc Vehicle Accessories reuse the Figma's Rear Drawers, Underbody Protection and More Accessories photos (`img` on the tile).

### 7.1 Dynamic tiles (Brenton, 2026-09-29)

Every tile belongs to one of two kinds:

| Kind | Rule | Tiles |
|---|---|---|
| **Vehicle-specific** | Shows only when the category has products that fit the page vehicle. Otherwise the tile is **removed** (not greyed out or shown empty). | 5.5: Vehicle Specific Accessories. 5.8: all 6. |
| **Always shown** | Always shows. | 5.5: **Roof Racks** (vehicle-specific, but every vehicle has one, so it's never dynamic: Brenton, 2026-09-29), Bike Racks, Roof Boxes, Awnings, Roof Top Tents, Roof Rack Accessories. 5.7: all 12. |

- **Section rule:** a section whose tiles are all removed is hidden entirely, heading included. In practice this only affects 5.8, since 5.5 and 5.7 always have universal tiles.
- **Store Finder widening (5.5):** the desktop grid is 5 columns (feature tile in column 1, spanning 2 rows, plus 4 columns for the rest). The Store Finder always sits last and **spans every column left over in its row.** Only one tile in 5.5 is dynamic (Vehicle Specific Accessories), so there are just two layouts: Store Finder spans 2 columns with that tile present (the Figma layout) and 3 with it removed. The span is still computed from the leftover columns, not hard-coded, so adding another dynamic tile later needs no new CSS. On mobile the Store Finder is always full width, so nothing changes.
- **Production data:** each category is flagged vehicle-specific or universal. The backend passes the VLP the list of vehicle-specific categories with at least one product fitting the page vehicle. The frontend only removes tiles and computes the Store Finder span.
- **Prototype:** each page vehicle carries its own list of vehicle-specific categories with results. Hilux has everything. Ranger has no Vehicle Specific Accessories (so its Store Finder spans 3 columns) and only 3 of the 6 bottom-section categories, so both rules are visible just by switching vehicles. The Demo State Panel adds a "Vehicle-specific categories with results" checklist (Vehicle Specific Accessories + the 6 in 5.8) that overrides the vehicle's list. Unticking all six in 5.8 hides that section.
- **Roof Racks is always the feature tile** and is never removed.

---

## 8. Product-card carousel (new wrapper)

- Uses `plpCardHTML()` from plp.js (grid-mode card) so the card is identical to the PLP family's. The Related Products `.product-card` is not used.
- Horizontal scroll-snap track with nav arrows (same arrow style as the Fitment Gallery carousel); swipe on mobile. Around 5 cards visible at 1440px.
- **Data:** the VPLP's existing roof-rack dataset for the Hilux, sorted by best seller. For the Ranger, a small set of real Ranger-fitting products taken from the live site. Every card is "Fits your vehicle" because the page is filtered to the page vehicle.
- **Card extras:** ribbons stay as the data sets them, Compare is off and Show Specs is hidden. The carousel is a teaser, not a listing.
- Needs plp.js loaded on a page without `[data-plp-page]`. Check its init is gated, so it doesn't try to render a listing.
- "View all Roof Racks" link at the end → VPLP.

---

## 9. SEO — not indexed (decision 6)

`<meta name="robots" content="noindex, follow">`. Reason (Brenton): the VCLP owns the vehicle search terms people actually type ("Hilux N80 roof racks"), because it covers every variant of that model for a category. Nobody searches "Toyota Hilux N80 2023 4dr Ute with raised roof rails", and indexing every make × model × year × body × roof combination would only produce thin, near-duplicate pages competing with the VCLP. `follow` so link equity still flows to the VPLPs/PDPs. No canonical to the VCLP (it isn't a duplicate, just not a search target). BreadcrumbList JSON-LD stays; no FAQPage/ItemList JSON-LD.

---

## 10. Build list — built 2026-09-29

All built and Playwright-verified (1440 + 390px, both page vehicles, session none/same/different, header vs in-context drawer, no horizontal overflow, zero console errors). Not pushed.

1. ✅ Tile images, Ford badge and the Ranger's six Popular Racks product photos pulled from the Figma file (`_shared/category-tiles/`, `_shared/brand-ford-badge.png`, `_shared/vlp-products/`). Category names come from the Figma; the live-site crawl wasn't needed since only three tiles link anywhere in the prototype.
2. ✅ `prototypes/vlp/index.html`. Everything renders from `VLP_VEHICLES` (inline script) so `?vehicle=hilux|ranger` switches the whole page.
3. ✅ `shared.css`: `.cat-tile` family, `.store-finder-tile`, `.product-carousel`, `.vlp-vehicle-notice`, `.section-intro`. The VCLP's trust banner + brand strip CSS moved into shared.css (now used by both pages).
4. ✅ `shared.js`: the Fit My Vehicle drawer is now a real Make → Model → Year/Body/Roof cascade over Hilux + Ranger (`FIT_FINDER_VEHICLES`); header triggers open it in `navigate` mode (submit lands on the VLP), in-context triggers stay in place. VLP-only Demo State section (page vehicle + category checklist, neither saved). `initProductCarousels()`. Store Finder tile hooks into the region cascade (`[data-region-store-count]`) and the nearest-store session display (`[data-sft-nearest]`).
5. ✅ Dynamic tiles: `vlpRenderTiles()` / `vlpSizeStoreFinder()`.
6. ✅ VCLP "View Results" → VPLP — already done in the consistency pass (§15 V2), nothing to change.
7. ✅ VPLP breadcrumb (Section 6; `plpRenderBreadcrumb()` now honours a segment `href`); `PLP_VEHICLES` Ranger → Raised Roof Rail.
8. ✅ Index card, Site Admin template list, `PAGE-GLOSSARY.md`, `spec.md` §15 L8 note, `plp-spec.md` terminology row.
9. ✅ Playwright (above).
10. Later: `docs/vlp/VLP-DEVELOPER-BRIEF.md` (text only, no screenshots until final handover).

**Built differently from the plan:**
- **Ranger demo data** has Towing Mirrors, Roller Shutters and Protection & Trim only (no Vehicle Specific Accessories, Storage & Drawers or Misc Vehicle Accessories), so switching to the Ranger shows both rules at once: the Store Finder widens to 3 columns and the bottom section loses tiles.
- **Store Finder map** is centred on the nearest store (North Lakes) at street level rather than all 35 stores — at tile size the Australia-wide view read as an empty dark rectangle. The map is darkened with a CSS filter to match the Figma's dark street map.
- **Popular Racks cards** show the session vehicle's fitment, so with a different saved vehicle they honestly read "Doesn't fit your Toyota Hilux" until the shopper uses the notice's "Make this my vehicle".

---

## 11. Decisions log (2026-09-29)

| # | Question | Answer |
|---|---|---|
| 1 | Worked-example vehicle | **Both** Hilux and Ranger, switchable. |
| 2 | What routes to the VLP | **Fit My Vehicle drawer submit** (header triggers). The VCLP's View Results goes to the **VPLP** instead. |
| 3 | Page vehicle ≠ session vehicle | Silent set if none; notice (not overwrite) if different. |
| 4 | Store Finder block in the tile grid | **Keep.** Roof Racks is never dynamic, and the 5.5 heading stays as-is. It's the flexible filler that widens when vehicle-specific tiles drop out (Section 7.1). Vehicle-specific tiles/sections are dynamic; universal tiles always show. |
| 5 | VPLP breadcrumb as a child of the VLP | **Yes.** |
| 6 | Indexable | **No** (Section 9). |
| 7 | Where the vehicle-specific tiles go (2026-10-07, Graham meeting + Brenton) | A second VPLP, **Vehicle Specific Accessories** (`prototypes/vplp-accessories/`). The top section's Vehicle Specific Accessories tile opens it on Show All; each tile in the vehicle-specific section opens its own tab (`?attachment=<tab>`). Tabs are the live category names, and only the ones the vehicle has fitting products in. Products are only the ones made for that vehicle. Not in the mega menu, noindex. Every one of these categories also keeps its own indexed PLP in the mega menu (4x4 Accessories / Vehicle Accessories), which carries universal products too. |

---

## 12. Open items

- **Ranger fitment photos:** none exist, so the gallery is hidden for the Ranger.
- **VS PDP breadcrumb:** should it also go through the VLP (`… › Bare Roof › Platforms & Trays › <product>`)? Not changed this round.
- **Page-vehicle mechanism in production:** the URL structure for exact-vehicle pages is backend-owned; `?vehicle=` is prototype-only.
