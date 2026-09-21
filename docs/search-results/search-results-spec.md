# Search Results Page — Engineering Spec

Project: the on-site search results page for Roof Racks Galore — reached from the header search box, distinct from a PLP (single category) in that results can span multiple categories or return zero matches.

Companion project to `docs/plp/plp-spec.md` (PLP/VPLP rebuild) — same repo, same conventions (plain HTML/CSS/JS prototype, `prototypes/_shared/` shared component library, Playwright verification before calling anything done, no push to git until Brenton's explicit sign-off). This page reuses the PLP/VPLP shared engine (`_shared/plp.css`/`plp.js`) rather than forking it — see Section 6.

Source designs: none supplied. Built entirely from the planning session (2026-09-21) that produced this doc, reviewing the existing PLP/VPLP/Camping prototypes as the visual/behavioral baseline and making explicit calls (via `AskUserQuestion`) on the four places search genuinely diverges from a category page. No Figma reference exists for this page type, unlike PLP.

---

## 0. Goal & scope

Build a search results page that reuses as much of the PLP/VPLP grid, filter, sort, pagination and card machinery as possible, while handling the things a single-category PLP structurally can't: results spanning several categories at once, and a genuine zero-results case (every PLP category has products; a search may not).

**In scope:** results bar (with inline editable search box), dynamic category quick-tabs, a universal (cross-category) filter set, product grid/list (identical cards to PLP), sort/pagination, zero-results state (message + popular categories + featured products).

**Out of scope for this round:** real search relevance/matching logic (Magento/backend, not this prototype); typo correction / "did you mean" spelling suggestions (flagged as a possible future addition, not built — see Section 8); autocomplete/predictive search in the header box itself (separate feature, not this page); a fully dynamic catalogue (representative demo dataset only, same convention as PLP/VPLP/PDP).

---

## 1. What's reused vs. new

Reviewed against the existing `prototypes/plp/`, `prototypes/vplp/` and `prototypes/plp-camping/` templates before writing this doc.

**Reused as-is** (same markup/CSS/JS patterns, driven by the existing config-driven engine):
- Product grid/list toggle and cards — ribbons, sale pricing (Save X%), Add to Cart vs. View Options split, Show Specs expandable row, Compare Products checkboxes/drawer.
- Sort dropdown (Relevance/Newest/Best Selling/Highest Rated/Price Low→High/Price High→Low).
- Desktop numbered pagination + mobile "Show More Results".
- Mobile filter drawer pattern (right-edge slide-out).
- Header/vehicle strip, footer — untouched, global.

**Doesn't apply to search, dropped entirely:**
- Hero (vehicle photo, category H1, Buyers Guide/Fitting/FAQs/Videos CTA row) — no single category to frame.
- Breadcrumb — a search isn't a taxonomy node.
- SHOP BY tabs as real per-category URLs — replaced by a different, search-specific mechanism (Section 3).
- Per-category configured facet set, priority-filter gold treatment — replaced by a universal facet set (Section 4).
- Fitment Gallery inline grid insert, category videos, FAQ accordion, Buyer's Guide — all sourced from a single category's Magento data; no equivalent exists for a cross-category search.

**New, doesn't exist anywhere in PLP/VPLP today:**
- Zero-results state (Section 5).
- Category quick-tabs generated dynamically from the actual result set, not fixed config (Section 3).
- Inline editable search box in the results bar (Section 2).

---

## 2. Results bar (replaces hero + breadcrumb)

- Compact bar, no vehicle photo, no secondary CTA row.
- Contains: the search input itself (pre-filled with the current query, editable/resubmittable in place — not just a link back to the header box), and result-count text: `Showing 1–12 of N results for "<query>"`.
- Vehicle context is **not** repeated here — the existing top header strip (`Your Vehicle: Toyota Hilux`) already carries that globally; no "Change Vehicle" CTA on this page (nothing here is vehicle-scoped the way a VPLP is).
- Grid/list toggle and sort dropdown sit at the same results-row position as PLP (directly above the grid), not folded into this bar.

---

## 3. Category quick-tabs (replaces SHOP BY)

- **Dynamically generated from whichever categories actually appear in this search's result set** — e.g. `All (23) | Roof Racks (12) | Bike Racks (8) | Cargo Boxes (3)` — not a fixed per-category config like PLP's SHOP BY.
- **In-page filter only, not real URLs.** Unlike PLP's SHOP BY (deliberately real fixed URLs for SEO indexing), a search result set isn't itself an indexable taxonomy node, so there's no SEO reason to hard-URL each tab — clicking one just narrows the current result set client-side.
- Same underlying state as the Category filter in the sidebar (Section 4) — two UI surfaces (tab row + sidebar facet) into one selection, kept in sync.
- "All" is always first/active by default, same convention as PLP's "Show All" tile.

---

## 4. Filters (universal facet set + Category filter)

Per-category configured facets (Bike Racks' "how many bikes," Roof Racks' "cross bar qty") can't apply here since results may span categories that don't share an attribute schema. Filter sidebar instead shows:

- **Category** — the same set the quick-tabs expose (Section 3), as a checkbox-list facet with counts, kept in sync with the tab selection.
- **Brand**, **Price** (range), **Availability** (in stock / can order in), **Rating** — cross-category attributes every product in the catalogue carries regardless of category, same live-count-update behavior as PLP's standard filters.
- **No priority-filter gold treatment** — that's an explicitly per-category/subcategory buyer-journey concept (plp-spec.md Section 6); doesn't map onto an arbitrary mixed result set.
- **No category-specific technical facets** (bike capacity, cross bar qty, plank direction, etc.) — those only make sense within one category's schema.
- Reuses the existing filter sidebar component/mobile drawer pattern as-is, just with this different facet config.

---

## 5. Zero-results state (new)

Doesn't exist anywhere in PLP/VPLP today — every category prototype has products by construction. Search is the first page type that needs a genuine empty state. Replaces the grid entirely when a query returns 0 matches:

1. Message: `No results for "<query>"` + a short hint to check spelling or try fewer/different words.
2. **Popular categories** — a row of links into top-level categories (Roof Racks, Bike Racks, Cargo Boxes, Camping, …), reusing the same category-tile visual pattern as SHOP BY tiles where practical.
3. **Featured products** — a small "You might like" product carousel/row, reusing the standard product card component in a horizontal scroller (same card as the grid, not a new component).

Spelling correction ("did you mean") explicitly deferred — see Section 8.

---

## 6. Build / template architecture

- **`prototypes/search-results/`** — new template, alongside `plp/`, `vplp/`, `plp-camping/`.
- Loads `_shared/plp.css`/`plp.js` (extended, not forked) plus `shared.css`/`shared.js`, same convention as the other PLP-family templates. `plp.js`'s existing config-driven engine (facet matching, sort, pagination, card rendering, Compare Products) is reused directly; new engine additions needed:
  - Universal facet set + Category facet (Section 4) as a new `PLP_CONFIG` shape alongside the existing per-category priority/standard facet shape — engine should support both without breaking `plp`/`vplp`/`plp-camping`.
  - Dynamic quick-tab generation from result-set categories (Section 3), distinct from the existing fixed `shopBy` config array (which stays as-is for the category templates).
  - Zero-results render path (Section 5) — new, no existing equivalent to branch from.
- Page defines its own `window.PLP_CONFIG`-equivalent data, same convention as every other PLP-family page.

---

## 7. Demo dataset

- Primary demo query deliberately spans 2–3 existing categories (e.g. **"roof rack"**, pulling matching products from both the PLP bike-rack dataset and the VPLP roof-rack dataset) so the Category quick-tabs/facet actually has more than one tab to demonstrate.
- Second demo query intentionally returns **0 results**, to demo the empty state.
- Both togglable via the Demo State Panel, same convention as the other prototypes' state toggles (Simple/Vehicle-Set, image fallback tiers, Compare Products on/off, etc.).

---

## 8. Open items / assumptions log

Carried forward for explicit revisit — not blocking a first build:

1. Spelling correction / "did you mean" — explicitly out of scope this round (Section 0); flag for a future pass if Brenton wants it.
2. Category quick-tabs vs. sidebar Category filter showing the *same* categories in two places (tab row + facet list) — assumed both should stay in sync as one selection state; worth confirming this doesn't read as redundant once built and visible.
3. Whether Compare Products / Fitment-Gallery-adjacent per-card behavior needs any tweak when a VRS product (e.g. a Roof Rack search hit) shows up in a *mixed* result set next to non-VRS products — assumed no special-casing needed (card behavior is card-level, not page-level), but not yet visually verified.
4. Universal filter set (Brand/Price/Availability/Rating) is Claude's own proposed minimum set from this planning session, not a client-confirmed list — flag for review once built.

---

*Written 2026-09-21 from a planning session with Brenton, reviewing the existing PLP/VPLP/Camping prototypes and resolving four open design questions via explicit choice (filters, hero, category tabs, zero-results state — see Sections 2–5). Next step: Brenton's sign-off on this document, then prototype build begins.*
