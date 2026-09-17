# PLP / VPLP Rebuild — Engineering Spec

Project: category (listing) pages for Roof Racks Galore — the pages that sit between the header's product taxonomy and an individual PDP. Covers two related but distinct page types (Section 1).

Companion project to `spec.md` (PDP rebuild), `docs/header/header-spec.md`, `docs/footer/footer-spec.md`, and the VCLP work (`docs/vehicle-landing/`) — same repo, same conventions (plain HTML/CSS/JS prototypes, `prototypes/_shared/` shared component library, Playwright verification before calling anything done, no push to git until Brenton's explicit sign-off, a developer-brief handover doc gated on its own separate sign-off, built once this page is stable). This file is the engineering spec/planning log for the PLP/VPLP work specifically. A `PLP-DEVELOPER-BRIEF.md` follows later, once prototype files actually exist — nothing has been built yet as of this writing (2026-09-17); this document is the output of a planning-only session, per [[feedback_discuss_before_actioning]].

Source designs: `PLP Figma Designs/` at the project root —
- `PLP Bike Racks - Vehicle Specific.png` — desktop **grid view**, standard (non-VRS) category, Toyota Hilux set. Its breadcrumb (vehicle-first) is confirmed wrong for this page type — see Section 3.
- `PLP Bike Racks Mobile - Toyota Hilux (Claude).png` — mobile, same category.
- `VPLP VRS WIP.png` — desktop **list view**, VRS category (Roof Racks), Toyota Hilux set. Explicitly WIP: the FAQ copy (Ford Ranger questions), the mismatched result count ("Showing 4 Results" vs. footer's "1-15 of 300"), the red "Recent Fits" banner treatment, and the dual Flat-pack/Assembled buttons are all flagged below as either discarded or unresolved — don't treat this file as a clean target the way the two Bike Racks files are.

Also referenced: the live production site (`roofracksgalore.com.au`), used as real-data/behavior reference in a few places called out explicitly below — its current implementation is inconsistent ("a bit of a mess," per Brenton) and is **not** a structural target except where a section says so.

---

## 0. Goal & scope

Build category pages that (a) work exactly like a normal ecommerce PLP when no vehicle is known, and (b) actively communicate "you're shopping for your [vehicle]" once one is set in session — regardless of whether the category's products are actually vehicle-specific — while (c) handling the subset of categories (Roof Racks, backbones/spines) whose products are *strictly* fitment-locked to an exact vehicle roof type as a deeper variant of the vehicle-set state, not a separate page type.

**In scope:** the PLP page itself (hero, breadcrumbs, subcategory tabs, filters, product grid/list, sort/pagination, Fitment Gallery, category videos, FAQ, Compare Products) across two states (Simple / Vehicle-Set) and category types (standard / VRS). Reuses existing global Header/Footer and the header's vehicle drawer as-is.

**Out of scope for this round:** the Fit Finder's own results-matching logic (owned by Magento/backend, not this prototype); real filter-count data (simulated client-side against demo data, same convention as the rest of this prototype); a fully dynamic, data-driven catalogue (representative demo categories only, same convention the 5 PDP templates used).

---

## 1. Terminology

| Term | Meaning |
|---|---|
| **PLP** | Standard category listing page. |
| **VRS** (Vehicle Rack Set) | A product that is exact-fitment-locked to a specific vehicle roof type — currently only Roof Racks, backbones, and spines. RRG tracks real fitment data for these categories and *only* these — nothing else (not Bike Racks, Cargo Boxes, Tie-Downs, etc.). |
| **VPLP** | The PLP variant listing VRS products (e.g. Roof Racks for a set vehicle). Not a separate template from a build standpoint — it's the "exact-fitment-locked category" branch of the same Vehicle-Set PLP state (Section 2). |
| **VCLP** (Vehicle Category Landing Page) | A different, already-built page type (`prototypes/vehicle-landing/`) — one page per make/model, not per category. **Correction, 2026-09-17:** this project previously mis-called it "VLP." A true VLP is a distinct, not-yet-built page type — don't reuse that abbreviation for this page. See [[project_pdp_vehicle_landing_page]]. |

---

## 2. Page states

Binary, not three-way: **Simple** (no vehicle in session) vs. **Vehicle-Set** (a vehicle exists in session, however it got there — Fit Finder, header drawer, VCLP, anywhere).

Within Vehicle-Set, a **category-level flag** ("is this category exact-fitment-locked?") drives two things — the heading copy (Section 4) and the breadcrumb pattern (Section 3) — but does **not** create a third page/template. A vehicle-set, non-fitment-locked category (Bike Racks, Cargo Boxes) still gets full vehicle-specific hero framing ("shopping for your Hilux"), just without any fitment badges or the Fitment Gallery.

**No per-SKU "fits your vehicle" indicator exists anywhere outside VRS categories.** RRG has no real fitment data for Bike Racks, Cargo Boxes, or anything else — fit-checking for those is deferred entirely to the PDP. Do not add a fitment badge to a non-VRS product card.

**Live-site reality check (2026-09-17, `roofracksgalore.com.au/roof-racks`):** today, a VRS category with *no* vehicle set is not gated or empty — it shows the full real, unfiltered catalogue across every vehicle (e.g. a Peugeot 308 fitting kit sitting next to a Range Rover Velar kit), plus a prominent inline "Fit My Vehicle" 5-field widget above the grid, and the full filter sidebar remains usable. The new design keeps this same idea (real catalogue, not hidden) but replaces the inline 5-field widget with the **existing header vehicle drawer**, opened via a CTA banner (Section 4). The live site's Fit-Finder-only gating for reaching true VRS/VPLP results goes away — once a vehicle exists in session by *any* means, simply navigating into Roof Racks resolves straight to the narrowed VPLP experience.

---

## 3. Breadcrumbs

Breadcrumb structure is driven by **the page type's own taxonomy**, not by session vehicle state:

- **Standard PLP** (any non-VRS category): always the category path, regardless of vehicle state — e.g. `Home → Bike Racks → Attachment Style → Roof Mounting`. The vehicle never appears in a standard PLP's breadcrumb or URL.
- **VPLP** (VRS category): always the vehicle path, because the page is inherently scoped to an exact vehicle spec — e.g. `Home → Vehicles → Toyota → Hilux → Vehicles 2015-2026 → Vehicles 4dr Ute → Bare Roof`.

**Correction:** `PLP Bike Racks - Vehicle Specific.png`'s breadcrumb (vehicle-first) is wrong for that page — Bike Racks is a standard PLP and should use the category-path pattern above even with a vehicle set.

---

## 4. Hero

### 4.1 Vehicle-Set state
- Vehicle photo + brand badge, "Change Vehicle" gold CTA — same shared component/assets as the VCLP hero.
- H1/intro copy is dynamically tagged based on the category-level fitment-locked flag (Section 2):
  - **VRS/fitment-locked:** full vehicle spec in the H1 — "Roof Racks for Toyota Hilux 2015-2026 4dr Ute with Bare Roof."
  - **Standard:** short framing — "Bike Racks for your Toyota Hilux."
- Secondary CTA row (Buyers Guide / Fitting / FAQs / Videos) — category-general, unchanged between states.

### 4.2 Simple state
No Figma reference exists for this state — drafted from everything else agreed this session, flagged for review at first build:
- **No vehicle photo.** A category-level fallback image field will exist in Magento (optional) — if set, show it in the photo's place; if not set, show nothing there at all (no placeholder graphic, no broken layout).
- H1/intro reverts to generic category copy (no vehicle tag).
- The "Change Vehicle" CTA is replaced by a **"set your vehicle"** CTA (exact copy/prominence TBD by Claude, flagged for revisit once built) that opens the same existing header vehicle drawer — not a new component, not the live site's inline 5-field widget.
- Secondary CTA row, SHOP BY row, filters, and grid are otherwise identical to the Vehicle-Set version.

---

## 5. SHOP BY row (subcategory tabs)

Confirmed to be real subcategory navigation, present on **every category**, both states:
- Each tile is a **real, fixed, distinct URL** (not an in-place AJAX filter) — deliberate choice for SEO, so each subcategory can be indexed on its own.
- The full sibling list of subcategories always stays visible regardless of which one is currently active — selecting one does **not** collapse the row into a further drill-down.
- "Show All" navigates to the parent category view (all subcategories' products combined).
- Mobile: horizontal-scroll carousel when the row overflows one line.
- Icon + label styling, active tile visually highlighted (gold background per the Figma reference).

**Live-site reference (visual only, not behavioral):** `roofracksgalore.com.au/roof-racks/roof-racks/cruz-roof-racks` shows a similar icon-tab row (Show All / Platform-Tray / Thru Bar / Flush Bar) directly below the breadcrumb, above the Fit My Vehicle widget and filters, "Show All" defaulting active. Useful for position/visual convention only — the live site's current tab behavior is inconsistent (some categories filter in-place, some don't have tabs at all) and is explicitly **not** the target; the new build always uses fixed URLs.

---

## 6. Refine Results (filter sidebar)

- **Per-category/subcategory configurable facet set** — different categories show different filter attributes entirely (compare Bike Racks' "How many bikes"/"Carrier type" against Roof Racks' "Cross Bar Qty"/"Platform Style"). Build the demo with this as a real configurable structure, not a hardcoded one-off list, even though only 1–2 demo categories will exist.
- **Priority filters:** a per-category/subcategory concept — a subset of filters (soft internal guideline: no more than ~4, no hard technical max) get promoted to a visually distinct gold treatment, always rendered above the standard filter list, worded as buyer-journey questions rather than plain technical labels (e.g. "How many bikes do you need to carry?" instead of "Bike Capacity"). Which filters are "priority" varies **per subcategory**, not just per top-level category — e.g. Bike Racks' "type of carrier" priority filter applies to Tow Bar Mount but not Roof Mounted. **Flag prominently in the dev brief** — Magento/admin needs a way to set, per category or subcategory: which filters are priority, their display order, and their buyer-journey label text (distinct from the filter's plain name).
- If a category/subcategory has no priority filters configured, the sidebar just shows the standard list with no gold section.
- **Filter counts must live-update** as other filters are applied. No real backend exists for this prototype, so it will be simulated client-side against a small demo product dataset — same convention as the rest of this prototype's demo-state toggles.
- **Mobile:** priority filters render as their own row of quick-access chips directly above a "Refine Results" button. Tapping a priority chip opens the same full filter drawer, scrolled to that filter's group (priority filters still pinned at the top of the drawer itself) — not a separate mechanism. The drawer itself has no supplied design; build it following the existing right-edge slide-out convention already established elsewhere in this prototype (the Store Slide-out pattern), flagged for revisit if a bottom-sheet or other pattern is preferred instead.

---

## 7. Product grid / list / card

- **Grid view and List view are the same generic toggle, available on every category** — not tied to VRS vs. standard. Grid is always more compact/less information; List always shows more. No control for this exists in either Figma file — design a toggle (likely sitting near Sort By), no reference supplied.
- **Ribbons — Bestseller vs. Staff Pick:** two different data sources. **Staff Pick** is a manual merchandiser flag set in Rackit (a priority/featured pick). **Bestseller** should be a genuine computed flag based on real sales data — likely a Magento-side computation, not a Rackit field. Treat as mutually exclusive on the card for this build (one ribbon slot; if a product somehow carries both, Staff Pick wins) — **flagged as an assumption to revisit at first build review**, since this wasn't fully resolved.
- **"Show Specs" expandable row:** applies to **every product card, in both grid and list view**, defaulting collapsed in both (kept list view clean rather than always showing the full spec/icon row) — **flagged as an assumption to revisit after first build**, since Brenton was lukewarm rather than certain here. Expanding it reveals the same icon+value spec row shown in the VRS list-view mock (Product Weight, Max Total Weight, Wheel Base, Wheel Size, etc., category-appropriate).
- **VRS/VPLP list rows specifically** additionally carry:
  - A per-SKU **"Fitment Gallery (N)"** button under the thumbnail — opens the exact same drawer/component as the PDP's Fitment Gallery, launched inline from the PLP without navigating away.
  - **A single "View Options" CTA** (not the WIP mock's dual "Flat-pack"/"Assembled" buttons) linking through to the PDP with the default/first variant pre-selected. **Open dispute, noted for the dev team:** the client's dev team wants two separate buttons because Magento treats Flat-pack and Assembled as two distinct URLs/products; Brenton disagrees and wants one button landing on the default variant. **Build Brenton's single-button version first** — he's taking it back to the team for feedback before the dual-button version (if any) gets built.
- The Bike Racks mock's wide horizontal "featured" card (full spec table, Thule FreeRide) is **not** a real component — confirmed stale/leftover, just an illustration of what a list-view row looks like, sitting in the wrong (grid-view) screenshot. No "Product Spotlight" component needed.

---

## 8. Sort & pagination

- **Sort options:** standard ecommerce set — Relevance (default), Price Low→High, Price High→Low, Newest, Best Selling, Highest Rated.
- **Desktop pagination:** numbered pages (per the VPLP WIP mock's `1 2 3 4 5 › »`), not infinite scroll.
- **Mobile pagination:** "Show More Results" tap-to-load button (per the Bike Racks mobile mock) — stays a manual button, not auto-triggered on scroll.

---

## 9. Fitment Gallery (on PLP/VPLP)

- **Exact same widget, exact same visual style, as the PDP/VCLP version** (icon-badge panel, heading, "View All In-store Fitments" link, photo carousel, slide-out with per-fitment detail view). **The WIP mock's red "Recent Fits" banner treatment is discarded entirely** — that was an abandoned design direction, not a PLP-specific skin to build toward.
- Appears **once per results page**, at position 2 — the 2nd row in list view, or directly after the first full row in grid view.
- Only appears on **VRS/fitment-relevant categories** with a vehicle set (never on standard PLPs, never in the Simple state).

---

## 10. Category Videos

Two separate, differently-scoped video surfaces, both sourced from a Magento video field set on the category (or its subcategories):

1. **Sidebar module**, directly under the filter panel — capped at **2 videos**. Sourced from the current category's own videos; if the category has none, fall back to its subcategories' videos. Category-level videos always take priority over subcategory ones when both exist.
2. **Bottom-of-page carousel** — aggregates **every** video across the category *and all its subcategories*, no cap.

---

## 11. FAQ

- **VRS/VPLP pages** get real, vehicle-specific FAQ content — same idea as the VCLP's per-make/model FAQ (justified by the fitment complexity).
- **All other (standard) PLPs** get generic category/product-based FAQ content that never references the vehicle — confirmed this doesn't scale (can't author per-vehicle FAQ copy for every generic category like cargo boxes).
- The WIP mock's FAQ content (Ford Ranger-specific questions) is stale leftover copy from the VCLP build, not a real content example — ignore it as content, keep the *component* (reused `.faq-section`/`.faq-item` accordion).

---

## 12. Compare Products

Originally deferred as future-only, then **brought back into scope** mid-session:
- Fully functional for this build: checkboxes on product cards select up to **2 products**; a "Compare" action opens a **right-edge slide-out drawer** (matching the Store Slide-out convention) showing the two products' specs side-by-side.
- The entire feature is gated behind a **Demo State Panel toggle** (show/hide), same convention as every other reviewer-only preview toggle in this prototype set — not part of the default "always on" shipped state until the client explicitly confirms it should be.

---

## 13. Build / template architecture (confirmed 2026-09-17)

Confirmed with Brenton, following the 5-PDP-template + `_shared/` convention:

- **`prototypes/plp/`** — one template covering the standard PLP, demoed with the Bike Racks / Toyota Hilux dataset from the supplied Figma. Handles both Simple and Vehicle-Set states as a togglable demo state (same convention as the PDP templates' Demo State Panel), plus the Grid/List toggle (Section 7).
- **`prototypes/vplp/`** — a second template covering the VRS/VPLP variant, demoed with the Roof Racks / Toyota Hilux dataset from the VPLP WIP file. Also needs a Simple-state demo per Section 2's live-site finding (full unfiltered catalogue + set-vehicle CTA), even though VRS makes that state less common in practice.
- Both share `prototypes/_shared/shared.css`/`shared.js` and reuse the header vehicle drawer, Fitment Gallery, FAQ accordion, and Store-Slide-out-style drawer convention as-is.

---

## 14. Open items / assumptions log

Carried forward for explicit revisit — not blocking a first build, but should be checked once something real exists to look at:

1. Bestseller vs. Staff Pick tie-break (Section 7) — assumed mutually exclusive, Staff Pick wins.
2. Show Specs defaulting closed on list view (Section 7) — Brenton was lukewarm, not certain.
3. Mobile priority-filter chip opening the full drawer scrolled to that group (Section 6) — Brenton said "maybe," treated as the working assumption.
4. Simple PLP hero CTA copy/prominence (Section 4.2) — Claude's design call, explicitly deferred to post-build review.
5. Flat-pack/Assembled single-button vs. dual-button dispute (Section 7) — building Brenton's version first; the team may push back once he shares it.
6. Filter-panel-as-configurable-facet-system (Section 6) and the template/build architecture (Section 13) are both proposed structures inferred from the conversation rather than lines Brenton stated explicitly word-for-word — worth a quick confirm before heavy build investment.

---

*Written 2026-09-17 from a group-by-group planning session with Brenton — no prototype files exist yet. Next step: Brenton's sign-off on this document (particularly Section 13's proposed architecture and the Section 14 assumptions), then prototype build begins, then `PLP-DEVELOPER-BRIEF.md` once the prototypes are stable.*
