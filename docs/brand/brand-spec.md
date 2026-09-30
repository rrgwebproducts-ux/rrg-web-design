# Brand Pages — Engineering Spec

Project: the rebuilt brand page (`/brands/brands/{brand}`) and a new Brands hub (`/brands`). spec.md §16 item 30. Companion to `docs/plp/plp-spec.md` (the product grid, filters and vehicle states come from there) and `docs/home/home-spec.md` (Recent Fitments, brand strip). Same conventions as the other templates.

Planning session: 2026-09-30. Decisions in Section 9 were answered by Brenton the same day, and the spec was signed off with changes (decisions 9–12). **Status: built 2026-09-30, Playwright-verified; see Section 11.**

---

## 0. Goal & scope

Brand pages rank for "{brand} roof racks" searches and are where the header's Brands menu and Home's "Shop The Best Brands" strip should land. Live, they're just an H1 and a product dump (Section 1). The rebuild makes them a proper landing page for the brand, then keeps the full range browsable underneath.

**In scope:**
- `prototypes/brand/`: one template, built out for **8 brands** (decision 12): Thule, Rhino-Rack, Yakima, Front Runner, Cruz, MAXTRAX, ROLA, Rockymounts (`?brand=thule` and so on). These are the brands the prototype already holds logos for, and all 8 are sold in AU and NZ.
- `prototypes/brands/`: the Brands hub.
- Wiring: Home's brand strip logos, the header Brands mega-menu, and Search Results' brand cards link to these pages. The other brands in the A–Z stay on their live URLs.

**Out of scope:**
- The "Roof Racks by vehicle make" half of the live Brands menu (`/brands/roof-racks/toyota`). Those are vehicle pages, not brand pages.
- §16 item 28 (component pages): parked (decision 7).
- The department-level brand pages (`/bike-racks/by-brand/thule-bike-racks` and so on). They stay as ordinary PLPs; brand pages link to them.

**Reference:** the old Figma "Brand Page - Rhino-Rack - V1 - Desktop" (file `Website (WIP)`, node 2938:10096), supplied by Brenton 2026-09-30. Its section order and look (brand banner, image category tiles, brand-colour About band) are the starting point. Its red buttons and "New Rhino Racks Products" label (the row is actually vehicles) are not.

---

## 1. The live pages today (crawled 2026-09-30)

- **Brand page** `/brands/brands/thule` (AU and NZ identical, Magento): H1 "Thule", the sidebar Fit Finder, and a product grid on "Default" sort that **opens on rows of identical "Thule Roof Rack Fitting Kit 141xxx" cards**. The category description block is empty. The only brand copy is the `<title>` and meta description:
  - Thule: "Thule Roof Racks, Roof Boxes & Bike Racks" / "Browse Thule roof rack systems, WingBar roof bars, roof boxes, bike carriers and touring accessories with premium transport solutions for cars, SUVs, vans and 4WDs."
  - Rhino-Rack: "Rhino-Rack Roof Racks, Platforms & Touring Gear" / "Browse Rhino-Rack roof rack systems, Pioneer Platforms, Batwing awnings, roof top tents and touring accessories with adventure-ready solutions for utes, SUVs, vans and 4WDs."
- **`/brands`**: an all-products listing (it currently shows Yakima racks) under the live intro "At Roof Racks Galore, we believe that quality and reliability…" (3 paragraphs). No brand directory.
- **Brands mega-menu:** 35 "Product Brands" (AU) linking to `/brands/brands/{slug}`. NZ's pages link 14 of them.
- **UK (roofbox.co.uk):** a different site. Brand pages are department pages (`/roof-bars/roof-bars-thule.php`: Thule, Atera, Cruz, Whispbar, Yakima), with real brand copy (Thule's SquareBar / WingBar / WingBar Edge / SlideBar / Professional explainer and the One Key System offer). Kamei (car styling) and Rhino (commercial, "Rhino Products") also appear.
- **Department brand pages already exist** and become the category tiles (Section 3.3): e.g. Thule has roof racks, roof bars, leg packs, fitting kits, Caprock platforms, baskets & bags, bike racks, roof boxes, water & snow, awnings & roof top tents, camping & off-road.

---

## 2. Brands hub (`/brands`)

| # | Section | Build | Notes |
|---|---|---|---|
| 2.1 | Breadcrumbs | Home › Brands | |
| 2.2 | Header | `.page-hero` (contained, no image) | H1 "Our Brands"; the live intro's **first paragraph** word for word, the rest behind the existing read-more. |
| 2.3 | Featured brands | Brand card grid | The 8 built brands: logo, one-line summary (from 3.4), what they make (category chips from 3.3), product count, "Shop {brand}". Region-filtered (Section 6). |
| 2.4 | All brands A–Z | Letter-grouped list + jump bar | The full mega-menu list for the region, alphabetical; each → its brand page. Letters with no brand are greyed in the jump bar. |
| 2.5 | Trust band, footer | | |

Indexed. `BreadcrumbList` + `ItemList` of brand URLs.

---

## 3. Brand page (`/brands/brands/{brand}`)

Section order follows the Figma, with the full grid added (decision 2).

| # | Section | Build | Notes |
|---|---|---|---|
| 3.1 | Breadcrumbs | Home › Brands › Rhino-Rack | Figma's "Shop by Brand" becomes "Brands", matching the hub. |
| 3.2 | **Brand banner** | New `.brand-hero` | Full-width-in-container lifestyle image, brand logo (white) and the brand's tagline over it, as in the Figma. H1 is the brand name (visually the logo; the H1 text is the brand name for SEO). One line under the banner: the product count and a "Browse all {n} products ↓" jump link to 3.8. |
| 3.3 | **Shop {brand} by category** | Image tiles (`category-tiles` pattern) | 6 tiles on desktop (Figma: Roof Racks, Roof Boxes, Awnings, Platforms, Accessories, Bike Racks for Rhino-Rack), a horizontal scroll row on mobile. Each tile → that brand's **existing** department brand page (Section 1). The tile set is per brand and per region (Section 6). Buttons are `.btn-outline`, not the Figma's solid colour, to keep one primary CTA. |
| 3.4 | **About {brand}** | New `.brand-about` band | Brand colour background (Section 5), heading, lead line, 2–3 sentences, 4–5 bullet points, photo on the right. **Copy: researched and written for RRG** (decision 9): every fact checked against the brand's own site, no invented figures. Marketing can edit it, but it's written to ship. |
| 3.5 | **Vehicle finder** | `.fit-finder-widget[data-vehicle-finder]` (shared) | Scoped to this brand. **No vehicle:** the Make → Model → Year → Body → Roof fields; View Results sets the vehicle and filters this page (3.8) rather than leaving for the VLP. **Vehicle known:** "Shopping for your Toyota Hilux", Change vehicle, and the grid is already filtered (decision 8, Section 4). The page's **one gold CTA** is this finder's button. |
| 3.6 | **Top selling {brand} products** | Product card carousel (`.plp-card`) | 6–8 bestsellers, manual scroll (no autoplay, like Home's reviews). The Figma's ribbons ("Stock Low", "Final Days") are not used; the cards follow the card rules already agreed (no RRP prefix, stock line). |
| 3.7 | **Recent {brand} fitments** | Home's Recent Fitments carousel, filtered to the brand | **No vehicle:** the brand's latest fitments across vehicles. **Vehicle known:** that vehicle's fitments with this brand ("Toyota Hilux fits" in the Figma), falling back to all the brand's fitments if there are fewer than 4. Each photo → that vehicle's VLP. Real in-store fitment photos from the brand's own live product pages (the Rackit fitment gallery). **Hidden for brands with no fitment photos** (e.g. MAXTRAX, Rockymounts), never padded with another brand's. |
| 3.8 | **All {brand} products** | PLP grid + Refine Results sidebar (`plp.js`) | The brand's full range. Grid contents and default sort **as live** (decision 3): fitting kits and leg packs stay in. Filters: Category first (so shoppers can get past the kits in one click), then the standard facets. Numbered pagination on desktop, Show More on mobile. With a vehicle set, the "Fits your {vehicle} ×" chip applies (Section 4). |
| 3.9 | **Popular vehicles for {brand}** | Vehicle tile row | The Figma's vehicle row (Hilux, LandCruiser 79, Ranger, Patrol Y62), relabelled. Each → that make/model's VCLP. Hidden when a vehicle is set (it's a "pick your vehicle" prompt). |
| 3.10 | Other brands | `.brands-section` strip | "Shop more brands", the logo strip with this brand left out, now linked. |
| 3.11 | Trust band, footer | | As every page. |

**SEO:** indexed. `<title>` and meta description as live. Canonical is the unfiltered brand URL; the vehicle filter is client-side state and never changes the URL. `BreadcrumbList` + `Brand` (name, logo) on a `CollectionPage`. No `FAQPage` (no FAQ without real content).

---

## 4. Vehicle filtering (decision 8)

When a vehicle is in session, the grid (3.8) opens filtered, with a **"Fits your Toyota Hilux ×"** chip at the top of the active filters. Clearing it shows the full range; the finder (3.5) still says "Shopping for your Hilux".

RRG only has fitment data for **VRS** products (roof racks, fitting kits, bars/legs sold per vehicle, backbones, spines; `plp-spec.md` §2). So the filter:
- **narrows VRS products** to the ones that fit the vehicle (this is also what clears the fitting-kit wall for vehicle shoppers), and
- **leaves non-VRS products in** (bike racks, roof boxes, awnings…), with no fit badge on them, because we can't say whether they fit.

The chip's tooltip says so: "Roof racks and fitting parts are matched to your Hilux. Other products don't depend on your vehicle."

Top sellers (3.6) are not filtered. Recent fitments (3.7) switch to the vehicle as above.

---

## 5. Brand theming

- Each brand has one **accent colour** (the About band background and the category-tile hover edge) and a **banner image + tagline**, set per brand (Magento category fields).
  - Rhino-Rack: **#005cb9** (sampled from the Figma).
  - Thule: **dark grey**, taken from thule.com (decision 10).
  - The other six: each brand's own primary colour from its official site, checked for AA contrast with white text; where a brand's colour fails, a darker shade of it.
- The accent never replaces the gold primary CTA, the red header or the site's typography. Colour goes through a `--brand-accent` custom property on the page. Styles live in `shared.css` (no page-local CSS), and text on the accent must pass AA contrast (white on #005cb9 does: about 6.5:1).
- Banner and About images: Rhino-Rack uses the Figma's images if they can be exported, otherwise real product/lifestyle photos already in the prototype; Thule uses real Thule product imagery from the live site. Any stand-in is labelled demo.

---

## 6. Regions (decision 5: one template, region swaps)

| | AU | NZ | UK |
|---|---|---|---|
| Brand list (hub A–Z, mega-menu) | The 35 live "Product Brands" | The brands live NZ links (14: Cruz, Darche, Ezy Anchor, Front Runner, Kuat, MAXTRAX, Prorack, Rhino-Rack, Rocky Mounts, Rola, Stedi, Thule, Tred Outdoors, Yakima) | roofbox.co.uk's brands (Thule, Yakima, Atera, Cruz, Whispbar, Rhino, Kamei), each checked against the live UK site at build |
| Category tiles | Brand's AU department pages | Same, less any the NZ site doesn't have | Brand's UK department pages; tiles for ranges the UK doesn't sell are hidden |
| Prices, currency, stock line | Region's own (existing region swap) | | |
| Rhino-Rack page | Full | Full | **Listed** (decision 11). The UK sells Rhino's commercial range; the page shows those tiles and products. |
| Front Runner, MAXTRAX, ROLA, Rockymounts | Full | Full | Not sold by The Roof Box Company: not in the UK hub. Reached in the UK (e.g. from a shared link), the page shows "{brand} isn't available from The Roof Box Company" with a link to the UK hub. |

Brand pages use the existing region switch (`applyRegion()`); no new mechanism.

---

## 7. Prototype mechanics

- `prototypes/brand/index.html` reads `?brand=` (default `thule`). Brand data (name, slug, logo, accent, banner, tagline, tiles per region, top sellers, popular vehicles) sits in one `BRAND_PAGES` object in the page, the same way the PLPs carry `PLP_CONFIG`. The grid reuses `plp.js` with a brand-scoped `PLP_CONFIG`.
- **Products are real live products** (names, SKUs, prices crawled from the brand pages at build). The top sellers are a hand-picked stand-in for a bestseller feed and are labelled so in the brief.
- Vehicle state uses the existing Site Admin session toggle (Toyota Hilux N80, the demo vehicle).
- `rrgBrandUrl()` (shared.js) points the 8 built brands at the prototype (`brand/index.html?brand={slug}`); the rest keep their live URLs.
- Added to Site Admin's page list and the index "Page designs" tab (Category & listing group). Loads `cart.js` after `shared.js`. Standard header/footer shell.

---

## 8. Open items

1. **Brand copy** (3.4) is researched and written to ship. Marketing to read it once, especially the warranty lines, which point to the brand's own terms.
2. **UK:** the live UK Thule page has real range copy (SquareBar / WingBar / SlideBar / Professional, One Key System). It could replace the About copy for the UK.
3. **Brand colours:** taken from the brands' sites; each brand's guidelines should confirm them.
4. **Brand banner imagery:** needs brand-supplied lifestyle shots per brand.
5. **Bestseller feed:** 3.6 needs a real sales-ranked source (same as the PLP's Bestseller ribbon, `plp-spec.md` §7).
6. **Grid default:** kept as live (decision 3). Worth checking with the team once they see the Thule page open on fitting kits with no vehicle set.

---

## 9. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 1 | Scope | **Brand page + Brands hub.** |
| 2 | Brand page structure | **Landing top + full product grid.** |
| 3 | Fitting kits / leg packs in the grid | **Keep as live.** |
| 4 | Brand intro copy | **Placeholder.** |
| 5 | Regions | **One template, region swaps.** |
| 6 | Demo brand(s) | **Thule + Rhino-Rack** (superseded by 12: 8 brands). |
| 7 | §16 item 28 on brand pages | **No, stays parked.** |
| 8 | Vehicle known | **Auto-filter the grid to the vehicle** (VRS only, Section 4). |
| — | Reference design | The old Figma Rhino-Rack brand page (supplied mid-planning). |
| 9 | Brand copy (revises 4) | **Research each brand and write copy we should use.** |
| 10 | Thule colour | **Dark grey**, as thule.com. |
| 11 | Rhino-Rack in the UK | **Still list it.** |
| 12 | Number of brands | **At least 8**, so the Brands hub has substance. |

---

## 10. Build stages (after sign-off)

Each stage Playwright-verified (1440 + 390px, AU/NZ/UK, no console errors, no horizontal overflow), committed and pushed for review on Vercel.

1. **Brands hub** + linking: hub page, `rrgBrandUrl()`, Home brand strip links, mega-menu links, index + Site Admin entries.
2. **Brand page top half** (all 8 brands' data for this half): banner, category tiles, About band, vehicle finder, theming.
3. **Products:** top sellers, full grid with filters, vehicle auto-filter + chip, recent fitments, popular vehicles, other brands.
4. **The other six brands** + UK/NZ variants, then docs: `PLP-DEVELOPER-BRIEF.md` gets a Brand pages section, `PAGE-GLOSSARY.md` gets the new sections, spec.md §16 item 30 updated.

---

## 11. Build notes — built 2026-09-30

Built in one pass rather than four separate pushes: the hub, the top half and the products share the data files and CSS, so they landed together. Verified at 1440 and 390px, AU / NZ / UK, all 8 brands: no console errors, no horizontal overflow.

- **Data** (`prototypes/brand/brand-data.js`, `brand-products.js`): generated from a crawl of the live site on 30 Sep 2026. Each brand's grid is a real sample (36–167 products): the live brand page's first page in live order, the first products of each department page, and the brand's real racks for the two demo vehicles (from the live "Roof Racks by make" pages). Live counts: Thule 2,558, Rhino-Rack 1,978, Yakima 1,593, Cruz 1,385, Front Runner 731, ROLA 296, MAXTRAX 68, Rockymounts 47.
- **Fitment:** `fitsVehicle` is the demo vehicle's key when the product title names the Hilux N80 (bare roof) or the Ranger P703 (raised rail). It's "other" for anything else vehicle-specific (a title naming another vehicle, fitting kits, leg packs, tracks, backbones, ridge mounts), and empty otherwise. Fitting kits and leg packs whose title names no vehicle count as not fitting the demo vehicles; production uses real fitment data.
- **Fitment photos:** real Rackit gallery photos from each brand's own product pages (Thule 35, Rhino-Rack 98, Yakima 22, Front Runner 12, ROLA 7, Cruz 2). MAXTRAX and Rockymounts have none, so their banner shows the signature product and Recent Fitments is hidden.
- **Copy** (3.4): researched from each brand's own site on 30 Sep 2026. Worth knowing: Thule's Australian warranty is 2 years (5 on racks and boxes when registered), not "limited lifetime"; Front Runner is now sold as "Dometic Front Runner Series"; Front Runner's founding year and warranty, and Cruz's warranty, couldn't be confirmed, so they're left out.
- **Accents:** Thule #181818 (thule.com), Rhino-Rack #005cb9, Yakima #ab2328, Front Runner #0d0d0d. Darkened for AA white text: Cruz #007cb0 (from #009cde), MAXTRAX #c25200 (#ff6c00), ROLA #e7121a (#ed1c24), Rockymounts #197ea4 (#27acde).
- **UK Rhino-Rack:** listed (decision 11), but the research found roofbox.co.uk's "Rhino" range is **Rhino Products**, a separate UK van-rack company, not Rhino-Rack. To confirm with the UK team. Until then the UK Rhino-Rack page shows the Australian range.
- **Shared changes:** the vehicle finder's `data-vf-stay` / `data-vf-shop-href` / `data-vf-shop-label` (shared.js); `cfg.vehicleFilter` with the chip, plus generic fit wording for vehicles the prototype doesn't model (plp.js); the brand strip on every template now links to the brand pages; the header Brands panel links to the hub and the 8 pages; Search Results' brand cards open the brand page in the same tab.
- **Also fixed:** Home's inline script had a syntax error left by the checkout stage 1 commit (an orphaned Add to Cart handler body), which stopped Home's categories, carousels, fitments and reviews rendering. Removed; cart.js already handles those buttons.
