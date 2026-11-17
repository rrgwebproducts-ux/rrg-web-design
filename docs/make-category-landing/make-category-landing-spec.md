# MCLP (Make Category Landing Page) — Engineering Spec

Project: a roof rack landing page for a vehicle **make** ("Toyota Roof Racks"). It sits one level above the VCLP (make/model, "Toyota Hilux Roof Racks") in the breadcrumb tree, and links down to every model's VCLP.

Companion to `spec.md` (PDP), `docs/plp/plp-spec.md` (PLP/VPLP), `docs/vlp/vlp-spec.md` and the VCLP brief (`docs/vehicle-category-landing/`). Same conventions: plain HTML/CSS/JS prototypes, `prototypes/_shared/` shared code, Component Library first for any widget change, Playwright verification, push once approved.

Planning session: 2026-10-08, from a meeting with Marc (developer). Decisions in Section 11 were answered by Brenton the same day; Section 12 still needs answers before the build.

---

## 0. Goal & scope

Marc's point: the VCLP covers make + model, so the breadcrumb tree needs the make level above it. The make page owns the make search term ("Toyota roof racks") and passes internal links down to each model's VCLP.

A shopper on either page can go two ways:
1. **Fit Finder:** it starts pre-filled (Make on the MCLP; Make + Model on the VCLP), so they finish the remaining fields and go straight to the results.
2. **Internal links:** MCLP → model's VCLP → generation → VPLP.

**In scope:**
- the MCLP template (Toyota and Ford worked examples)
- Fit Finder make-only pre-fill
- the new vehicle mismatch drawer
- a second VCLP (Ford Ranger) to demo the drawer's "view your vehicle's page" route
- category-led breadcrumbs across the roof rack vehicle family
- wiring the mega menu "Roof Racks" link
- housekeeping (index card, Site Admin template list, glossary, Component Library registry)

**Out of scope:** real URL generation and per-make model data (backend), the MCLP developer brief (written once the page is signed off).

---

## 1. Terminology

| Term | Meaning |
|---|---|
| **MCLP** | Make Category Landing Page. This page. One per make (+ category, roof racks for now). Indexed. Live equivalent: `/roof-racks/toyota` (H1 "Roof Racks for Toyota"). |
| **VCLP** | Vehicle Category Landing Page (`prototypes/vehicle-category-landing/`). One per make/model. |
| **VLP / VPLP** | Exact-vehicle landing page / one category's results for an exact vehicle. Unchanged by this spec apart from breadcrumbs (Section 6). |
| **Page make / page model** | The make (MCLP) or make + model (VCLP) the page is *for*, fixed by its URL. |
| **Session vehicle** | The vehicle saved in the shopper's session (Site Admin "Vehicle", `session-state.js`). |

Tree: **MCLP** (make) → **VCLP** (make/model) → **VPLP** (exact vehicle + category) → **PDP**.

---

## 2. Worked examples

| | Toyota (main example) | Ford (second, so the Ranger's breadcrumb has somewhere to go) |
|---|---|---|
| URL | `make-category-landing/index.html?make=toyota` (default) | `?make=ford` |
| H1 | Shop Toyota Roof Racks | Shop Ford Roof Racks |
| Make badge | `brand-toyota-badge.png` ✅ | `brand-ford-badge.png` ✅ |
| Hero image | `vehicle-toyota-hilux.webp` ✅ | `vehicle-ford-ranger.png` ✅ |
| Model list | Real, from the live `/roof-racks/toyota` (crawled 2026-10-08, ~100 models) | Real, from the live `/roof-racks/ford` (~58 models) |
| Fitment Gallery | The 16 real Hilux N80 photos (all Toyota fitments we have) | None, so the section is hidden (same empty state as the VLP's Ranger) |

One make record drives the page: H1, hero copy, breadcrumbs, Fit Finder pre-fill, directory, FAQ and gallery. A Demo State Panel control, "Page make (landing URL)", switches between them, matching the VLP's "Page vehicle" control.

---

## 3. Sections (top to bottom)

Built from the VCLP's parts so the two pages read as one family.

| # | Section | Build | Notes |
|---|---|---|---|
| 3.1 | Header | Global | |
| 3.2 | Breadcrumbs + Change Vehicle | `.plp-crumbs-row` | Trail in Section 6. |
| 3.3 | Hero | `.plp-hero` + `.plp-hero-media.is-cutout` + make badge (same as the VCLP) | H1 "Shop Toyota Roof Racks". Intro copy written fresh from the live page's points (Toyota range runs from utes to small cars, so what fits depends on the model: platforms and thru bars for a Hilux, flush and thru bars for a Corolla), linking to the Fit Finder. |
| 3.4 | Fit Finder | Shared vehicle finder, **Make pre-filled only** (Section 5) | Model is the first open field. |
| 3.5 | **Model directory (new)** | New shared widget, `model-directory` (Section 4) | "Shop Roof Racks by Toyota Model". |
| 3.6 | Fitment Gallery | Existing widget, unchanged | Hidden when the make has no fitments. |
| 3.7 | "What Roof Racks Fit My Toyota?" | `.content-block` | Short education block: the roof types that come up across Toyota's range (bare roof on Hilux, raised rails on Prado/LandCruiser/RAV4, flush rails on Kluger/Corolla Cross, etc. — **each fact checked against the live site before it goes in**). No generation table (that belongs on the VCLP). |
| 3.8 | Trust banner | `.vclp-trust-banner` as-is | |
| 3.9 | FAQ | `.faq-section` | 4–6 make-level Q&As + FAQPage JSON-LD. |
| 3.10 | Shop The Best Brands | `.brands-section` as-is | |
| 3.11 | Footer | Global | |

**Not included:** a product grid. The live `/roof-racks/toyota` has one, but the VCLP doesn't. The MCLP stays a landing page that routes into the VPLP. Raise it if you want one.

---

## 4. Model directory widget (new, shared)

Grouped text tiles (Brenton, decision 1). Each tile links to that model's VCLP; it does **not** link down to generations (decision 2).

- **Groups:** Utes · 4WD & SUVs · Vans & People Movers · Cars. Each group is a heading over a grid of tiles.
- **Tile:** model name + the year span we stock racks for (e.g. "Hilux · 1997–2026+"), arrow on hover, whole tile is the link. White card, standard border/radius tokens. No imagery: we only have cutouts for Hilux and Ranger.
- **Grid:** 4 columns desktop, 3 tablet, 2 mobile.
- **Link targets (prototype):** Hilux → the real VCLP (`?model=hilux`), Ranger → the new Ranger VCLP (`?model=ranger`). Every other model → the Hilux VCLP as a placeholder, the same convention as unbuilt stores in the Store Finder. Flagged in the dev brief.
- **Long tail:** see Section 12 Q1.
- **SEO:** plain `<a href>` links in the HTML (no JS-only navigation), plus an `ItemList` JSON-LD of the models.

Goes into the Component Library (`registry.js`, usedOn: MCLP) in the same change.

---

## 5. Fit Finder pre-fill

| Page | Pre-filled | First open field | Attribute |
|---|---|---|---|
| MCLP | Make | Model | **new** `data-vf-preset-make="toyota"` |
| VCLP | Make + Model | Year | existing `data-vf-preset="hilux"` (already built 2026-10-02) |

- Pre-filled fields can still be changed.
- The Model list on the MCLP needs the make's models. `FIT_FINDER_VEHICLES` (shared.js) only has Hilux and Ranger. The Toyota and Ford **popular** models (the ones in the directory's tiles) are added for the demo. Only Hilux and Ranger have real Year/Body/Roof cascades. The others get the same stand-in options, marked `standIn: true` in the data and listed in the dev brief.
- `FIT_FINDER_MAKES` stays Ford + Toyota.
- Widget change: Component Library first, then every usedOn page (Home, FMV, Cart, Brand, VCLP, MCLP).

---

## 6. Breadcrumbs — category-led (decision 4)

The roof rack vehicle family switches from the "Vehicles" trail to category-led labels that match the page titles and search terms.

| Page | Trail (new) |
|---|---|
| **MCLP** | Home › Roof Racks › Toyota Roof Racks |
| **VCLP** | Home › Roof Racks › Toyota Roof Racks › Toyota Hilux Roof Racks |
| **VPLP** (Roof Racks) | see Section 12 Q3 |
| **Vehicle-Specific PDP** | see Section 12 Q3 |

- **"Roof Racks"** links to the roof racks PLP without a vehicle (decision: Brenton). In the prototype that's `vplp/index.html`, the VPLP's "Shop Roof Racks" simple state, which is the same page the mega menu's Roof Racks link opens. The mega menu "Roof Racks" Level 1 `href` (`nav-data.js`, currently `#`) is wired to it in the same change.
- "Toyota Roof Racks" → MCLP; "Toyota Hilux Roof Racks" → VCLP. The last crumb is plain text.
- BreadcrumbList JSON-LD mirrors the visible trail on every page.
- `spec.md` §15 L8, `docs/vlp/vlp-spec.md` §6, `PAGE-GLOSSARY.md` and the PLP and VCLP briefs are updated to match.

---

## 7. Vehicle mismatch drawer (new, shared)

Shown when the session vehicle doesn't match the page (decision 3).

**Match rules:**

| Page | Session vehicle | Result |
|---|---|---|
| any | none | No drawer. The Fit Finder shows the page's pre-fill. |
| MCLP Toyota | any Toyota (e.g. Hilux) | Match. The Fit Finder shows its normal "Shopping for your Hilux?" state. |
| MCLP Toyota | Ford Ranger | **Mismatch** |
| VCLP Hilux | Hilux (any generation) | Match |
| VCLP Hilux | Ford Ranger | **Mismatch** |

**Drawer:**
- Standard right-hand drawer (same shell as the Fit Finder drawer).
- Heading: "This page isn't for your Ford Ranger".
- One line: "You're viewing Toyota Hilux roof racks. Your saved vehicle is a Ford Ranger."
- The vehicle panel reuses the fitment card's no-fit style (`.fitment.no_fit`, per the "notices = fitment card" rule), never a tinted box.
- **Actions:**
  - **View Ford Ranger roof racks** (primary). Goes to the session vehicle's **make/model page** (VCLP `?model=ranger`), since that's the same page type the shopper is on.
  - **Clear my vehicle** (secondary, outline). Clears the session vehicle, closes the drawer and leaves the Fit Finder showing the page's pre-fill.
  - **Close** (X / backdrop / Esc). Keeps the vehicle, so the Fit Finder shows "Shopping for your Ranger?".

**When:** opens automatically on page load, **once per page per vehicle**. Dismissing it sets a `localStorage` key (`rrgMismatchSeen:<page>:<vehicle>`), so it doesn't come back on later visits; changing vehicle or opening another page shows it again.

Goes into the Component Library (registry.js, usedOn: MCLP, VCLP) with both states demoable.

---

## 8. Ford Ranger VCLP

Needed so "View Ford Ranger roof racks" lands on something real (Brenton, follow-up 3).

- **Same template, data-driven:** `vehicle-category-landing/index.html?model=hilux|ranger` (default Hilux), the same pattern as the VLP's `?vehicle=`. One model record drives the H1, hero copy, image/badge, Fit Finder preset, generation table, FAQ and gallery. Demo State Panel control: "Page model (landing URL)". This means the Hilux page's hardcoded content moves into a data block. The rendered Hilux page must stay pixel-identical (before/after Playwright diff).
- **Ranger content:**
  - Generations from the live `/roof-racks/ford` (PX1 2011–2015, PX2/PX3 2015–2022, P703 2022+, Super Duty 2026+).
  - Roof types matching the rest of the prototype (P703: Raised Roof Rail, per `PLP_VEHICLES`).
  - FAQ written from live-site Ranger product content. No invented specs.
- **Fitment Gallery:** none exist for the Ranger, so it's hidden.
- **Generation "Shop" links:** go to the VPLP (Hilux-only demo data, flagged), same as today.

---

## 9. SEO

- MCLP and VCLP are **indexed**; canonical = the clean make (or make/model) URL.
- `<title>` "Toyota Roof Racks | Roof Racks Galore".
- One H1.
- JSON-LD: BreadcrumbList, ItemList (models), FAQPage.
- The directory's links are real anchors, so link equity flows MCLP → VCLP.

---

## 10. Build list

1. Component Library: Fit Finder `vfPresetMake`; new `model-directory` widget; new `vehicle-mismatch` drawer (registry entries + demo states).
2. `FIT_FINDER_VEHICLES` / make data: Toyota + Ford popular models (stand-in cascades flagged).
3. VCLP → data-driven (`?model=`), Hilux unchanged (diff-verified); add Ranger.
4. New `prototypes/make-category-landing/` (Toyota + Ford).
5. Mismatch drawer wired on MCLP + VCLP.
6. Breadcrumbs (Section 6) + mega menu Roof Racks link.
7. Housekeeping: index card, Site Admin template list + Demo State controls, PAGE-GLOSSARY, spec cross-refs.
8. Playwright: desktop 1440 / mobile 390, every mismatch state, no horizontal overflow, zero console errors.
9. Push, then the MCLP developer brief once signed off (screenshots held until final handover).

---

## 11. Decisions log (2026-10-08, Brenton)

1. Model directory: **grouped text tiles**.
2. Link depth: **models only** (generations stay on the VCLP).
3. Saved vehicle doesn't match the page: **drawer** explaining the mismatch, with "Clear my vehicle" and "View [my vehicle]'s page".
   - Opens automatically, once per page per vehicle.
   - Same-make vehicle counts as a match on the MCLP; same model on the VCLP.
   - "View" goes to the vehicle's make/model page.
   - **Build the Ranger VCLP** to showcase it.
4. Breadcrumbs: **category-led** labels.
5. "Roof Racks" crumb → the non-vehicle Roof Racks PLP (also the mega menu link).

---

## 12. Open questions (need answers before the build)

1. **Long tail of models.** Toyota has ~100 models on the live site, many of them JDM imports (Allex, Belta, Raum…). Grouping all of them by type is a lot of tiles and a lot of type data. **Recommendation:** grouped tiles for the ~15 popular AU models, then a compact "All Toyota models A–Z" link list underneath (same links, plain text, columns). Popular list per make is a backend field.
2. **Ford MCLP.** Build it as the second example, so the Ranger VCLP's "Ford Roof Racks" crumb works? **Recommendation: yes** — it's the same template with a second data record.
3. **Breadcrumbs below the VCLP.** The category-led tree clashes with the VLP decision of 2026-09-29 (VPLP is a child of the VLP: `… › Hilux › 2015–2026 › 4dr Ute › Bare Roof › Roof Racks`). **Recommendation:**
   - **VPLP:** Home › Roof Racks › Toyota Roof Racks › Toyota Hilux Roof Racks › Hilux 2015–2026 4dr Ute Bare Roof (one crumb, links to the VLP) › Platform/Trays.
   - **Vehicle-Specific PDP:** Home › Roof Racks › Toyota Roof Racks › Toyota Hilux Roof Racks › <product>.
   - **VLP** (all categories, noindex) and **Vehicle Specific Accessories VPLP** (not roof racks): keep the Vehicles trail, but point their Toyota/Hilux crumbs at the MCLP/VCLP.
4. **The VLP's existing mismatch notice** (inline fitment-card notice, vlp-spec §4). Switch it to the new drawer so there's one behaviour site-wide? **Recommendation: yes**, keeping the VLP's "Make this my vehicle" action, since an exact-vehicle page can set a full vehicle.
