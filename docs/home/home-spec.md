# Home Page — Engineering Spec

Project: a new home page to replace www.roofracksgalore.com.au's current one, built from the same `prototypes/_shared/` component library as every other template, so it matches the new designs.

Companion to `spec.md` (PDP), `docs/plp/plp-spec.md`, `docs/vlp/vlp-spec.md`, `docs/search-results/search-results-spec.md` and the header/footer specs. Same conventions: plain HTML/CSS/JS prototype, Playwright verification before sign-off, push only once approved.

**Source design:** none. There's no Figma or other design for the home page (Brenton, 2026-09-29). The page is built from the live home page's content (crawled 2026-09-29) and this project's existing components.

Planning session: 2026-09-29. Decisions in Section 8 were answered by Brenton the same day.

---

## 0. Goal & scope

Replace the live home page with one that looks and behaves like the rest of the rebuilt site. Keep what the live page does well (hero promos, Fit Finder up front, category tiles, featured products) and lose what reads as dated (the stretched 10-image grid with a red button on every tile, three near-identical product rows with gold "View Details" buttons, and the leftover Key Finder / review / fitting-costs row with a lone "Let Us Help" button under it).

**In scope:** `prototypes/home/index.html`, an inline (non-drawer) mode for the Fit Finder cascade, the hero slider, the offer tiles, the home help row, housekeeping (index card, Site Admin template list, glossary).

**Out of scope:** CMS/merchandising tooling (which slides and offers run, and when, is backend/marketing data), UK/NZ-specific banners (Section 9), and the developer brief (written once the page is stable).

---

## 1. What the live home page has (crawled 2026-09-29)

| # | Live section | Where it goes on the new page |
|---|---|---|
| 1 | Header with a USP bar (Price Guarantee, 30+ Locations, 90 Day Exchange, Expert Advice) | Global header as-is. The USPs move into the trust row under the hero (5.3). |
| 2 | Hero slider, 7 slides, with the Fit Finder panel over the left of it | Hero (5.2), 4 of the slides. The Fit Finder stays in the hero, as on live (decision 2). |
| 3 | 10 category tiles (Overstock Products + 9 categories), each with a red button | Shop by Category (5.5): project's `.cat-tile`, no per-tile buttons. Overstock moves to Current Offers. |
| — | The other 3 slides (Overstock Clearance, EGR, Dropracks) | Current Offers (5.6), directly under the hero, so a sale is visible without waiting for its slide to come round. |
| 4 | Product rows: Roof Boxes & Cargo, Bike Racks, Awnings & Roof Top Tents | Same three rows, as product carousels with the PLP card (5.7). |
| 5 | Key Finder / a customer review / In Store Fitting Costs | Merged into the trust band + help row (5.8, decision 3). |
| 6 | "Let Us Help" + Contact Us | Merged into the help row (5.8). |
| 7 | Footer | Global footer. |

---

## 2. Terminology

| Term | Meaning |
|---|---|
| **Slide** | One hero banner: a full-bleed background image plus a transparent artwork layer (the sale's headline/product art, made by marketing). Both come straight from the live site's slider. |
| **Offer tile** | A smaller link tile with the same two layers, for a promo that isn't currently a hero slide. |
| **Session vehicle** | As everywhere else: Site Admin's Vehicle (`session-state.js`). |

---

## 3. Entry points / routing

- The home page is `/`. The logo, the mobile menu's logo and the breadcrumb "Home" link all point to it in production. In the prototype, every template's header, sticky-header and mobile-menu logo links here (Brenton, 2026-09-29); the template index is reached from Site Admin → "All templates".
- **Hero Fit Finder "View Results"** sets the session vehicle and **lands on that vehicle's VLP**, the same as the header's Fit My Vehicle drawer (`vlp-spec.md` Section 3). It's the same cascade (Make → Model → Year/Body/Roof, `FIT_FINDER_VEHICLES`) rendered inline instead of in a drawer.

---

## 4. Above the fold

Governing rule (2026-09-10): one unmistakable primary action above the fold. On the home page that's the **Fit Finder's gold View Results**. The slide link is a quiet white-outline button, so it doesn't compete.

---

## 5. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 5.1 | Header / utility bar | Global shell as-is | No breadcrumbs (it's the root). |
| 5.2 | **Hero** | **New `.home-hero`** | Full-bleed (decision 1). Details below. |
| 5.3 | Trust row (**now after 5.5**) | `.trust-row` (the PDP's) | Moved below Shop by Category on 2026-09-30 so the categories reach the fold (spec.md §16 item 22). A compact proof line sits in the hero finder instead: "Since 1989 · 35+ fitting centres · 200,000+ racks fitted". | Trusted Since 1989 · Over 200,000 Racks Fitted · Price Guarantee · 90 Day Exchange. Wording from the live site's header USPs + meta description; each links to the live page it names. |
| 5.4 | ~~Your vehicle bar~~ | — | **Merged into the hero Fit Finder** on 2026-09-30 (§16 items 7/26): with a vehicle set, the hero panel reads "Shopping for your Toyota Hilux?" with Shop for my Hilux and Change vehicle. See `PAGE-GLOSSARY.md` → Vehicle finder. |
| 5.5 | **Shop by Category** | `.cat-tile` compact, new 5-column `.cat-tile-grid--home` | 10 tiles in 2 rows: Roof Racks, Bike Racks, Roof Boxes, Baskets, Awnings, Roof Top Tents, Kayak & SUP, Ski & Snowboard, Lighting, Recovery Gear. The first 9 are the live page's own tiles (labels as live); Recovery Gear replaces live's Overstock tile, which moves to 5.6. Images are the Figma originals already in `_shared/category-tiles/`. Mobile: 3-up then 2-up. |
| 5.6 | **Current Offers** | **New `.home-offer-tile`**, 3-up | **Sits directly under the hero, before the trust row, with no heading** (Brenton, 2026-09-29; the grid carries `aria-label="Current offers"` instead). Overstock Clearance, Up to 35% off EGR Roller Shutters, Up to 50% off Dropracks: the three live slides not used in the hero. Each is its slide's background + artwork, cropped to a tile, and links where the live slide does. **≤900px: one swipeable row** (next tile peeking in, dots below) moved by swipe or the dots. **No auto-advance** since 2026-09-30 (§16 item 22; Baymard: never auto-rotate on mobile). Tiles are about 20% shorter (1400:656). — `initOfferCarousel()` |
| 5.7 | **Product carousels ×3** | `.product-carousel` + `plpCardHTML()` (same as the VLP's Popular Racks) | Roof Boxes & Cargo · Bike Racks · Awnings & Roof Top Tents, each "View all …" → its category. The live rows' first 10 products each (names, prices, was-prices and images as live, 2026-09-29). Images are hotlinked at the live site's own 215×190 thumbnail size; the full-size catalogue path serves a placeholder to hotlinks. Cards show no fitment line: these aren't vehicle-specific products. |
| 5.7a | **Recent Fitments** | The Fitment Gallery panel (`fitGalleryPanelHTML()`) | §16 item 24: the newest in-store fitment photos, each linking to that vehicle's VLP; "Find fitments for your vehicle ›" → Fit My Vehicle. The prototype has only real Hilux photos. |
| 5.8a | **What Our Customers Say** | `.home-review-track` | §16 item 25: after the trust band. Real Reviews.io score (4.3 from 1,914) and the 8 newest reviews exactly as posted, including a 4★ one: not filtered to 5 stars, hand-scrolled, never auto-rotating. Production reads them from the Reviews.io API. Replaces the trust band's static badge on this page. |
| 5.8 | **Trust band + help row** | `.vclp-trust-banner` as-is + **new `.home-help-grid`** | Merges live's Key Finder / review / fitting-costs row and "Let Us Help" (decision 3). Banner: heading, Reviews.io badge, **Book An Installation** + **See Fitting Costs** (outline). Help row, 3 cards: **Store Finder tile** (the VLP's `.store-finder-tile`, with map; replaces live's "View Store Locations"), **Key Finder** (key number field + Search + the brand logos we hold), **Let Us Help** (hours, phone, email, Contact Us — the footer's own copy). Mobile: stacked. |
| 5.9 | Shop The Best Brands | `.brands-section` as-is | |
| 5.10 | Footer | Global | |

### 5.2 Hero detail

- **Slides (4):** Spring Adventure Sale, New Platform Slimline 3, Cruz Kicker 2, Expert Fitting (35+ locations). Images downloaded from the live slider into `_shared/home-hero/`; slide link labels and destinations as live ("Shop Adventure Sale", "Shop Slimline 3", "Shop Cruz Kicker 2", "Find Your Store").
- **Desktop (>1100px):** the background covers the full width. The artwork is anchored to the right. The **Fit Finder panel** (the vehicle finder, `.fit-finder-widget[data-vehicle-finder]`: 2-column fields with View Results sharing the last row with Roof Type, §16 item 23) sits over the left inside `.wrap`, as on live; 504px wide (was 420px, widened ~20% on 2026-10-02). With a vehicle known it stacks: the vehicle photo on top (up to 240px, centred), then the text and actions at the panel's full width (2026-10-02, Brenton — same as the phone layout). The panel is the **same size in every state** (504 × 412px min-height; the proof line is pinned to the bottom), so Change vehicle / ← Back don't make it shrink or move. The slide link sits bottom-right.
- **Tablet/mobile (≤1100px):** the banner becomes a fixed-ratio strip showing the artwork, and the Fit Finder drops below it as a full-width block (light or dark, per Site Admin → Design options), so no fields sit on top of artwork on a small screen. With a vehicle known it's side by side (photo left) between 601 and 1100px, and stacked with the photo on top on phones. Fields stay 2-up even on phones (the shared ≤520px one-column rule made it a full screen of dropdowns).
- **Controls:** prev/next arrows (desktop), dots, swipe on touch. Autoplay every **10s on desktop only** (2026-09-30, §16 item 22; was 6s everywhere), paused on hover or focus inside the hero and **off entirely under `prefers-reduced-motion`**. Inactive slides are `aria-hidden` and their links are not focusable.
- **Performance:** only slide 1's images load eagerly (`fetchpriority="high"`); the rest are `loading="lazy"`.

---

## 6. New / changed components

| Component | Where | Notes |
|---|---|---|
| `.home-hero` (+ `-slide`, `-bg`, `-art`, `-link`, `-dots`, `-nav`, `-finder`) | `shared.css` | Generic enough for any future landing page slider. |
| Inline Fit Finder | `shared.js` | The drawer's cascade logic is split out into one `initFitFinderCascade(root, onSubmit)` used by both the drawer and `[data-fit-finder-inline]`, so the two can never drift. |
| `.cat-tile-grid--home` | `shared.css` | 5 columns → 3 (≤900px) → 2 (≤520px). |
| `.home-offer-tile` | `shared.css` | |
| `.home-vehicle-bar` | `shared.css` | |
| `.home-help-grid`, `.home-help-card` | `shared.css` | The Store Finder tile inside it spans one column. |
| `.visually-hidden` | `shared.css` | For the H1 (Section 7). |

All typography comes from `shared.css`'s shared heading/body rules (standing rule, 2026-09-16); no page-local type CSS.

---

## 7. SEO — indexed

This is the site's most-linked page, so it's **indexed**.

- `<title>` and meta description as live: "Roof Racks Galore - Australia's #1 Roof Rack Superstore" and "Australia's roof rack specialists since 1989. Roof racks, bike racks, roof boxes & 4WD gear with expert fitting at 30+ stores. Price guarantee + 90-day exchange."
- **H1:** live has none. The new page has one, "Roof Racks Galore — Australia's Roof Rack Specialists", visually hidden because the hero artwork already carries the visual headline. Section headings are H2s.
- `Organization` and `WebSite` (with `SearchAction` pointing at the search results URL) JSON-LD. No BreadcrumbList (it's the root).
- Hero artwork has real alt text (as live's). Offer tiles and slides use their headline as the link's accessible name.

---

## 8. Decisions log (2026-09-29)

| # | Question | Answer |
|---|---|---|
| 1 | Full-width hero? (Full-bleed heroes were ruled out for PDPs because of product photography) | **Yes for the home page.** Hero artwork is made by marketing, not catalogue photography. |
| 2 | Fit Finder in the hero, or rely on the header drawer? | **In the hero, like live.** |
| 3 | Key Finder + "Let Us Help" | **Merge** into the trust band (5.8). |
| 4 | Existing Figma / meeting notes to follow? | **None.** Built from the live page + existing components. |

---

## 9. Open items

- ~~**Logo → home**~~ — done 2026-09-29: every template's logos link to this page (Brenton).
- **UK / NZ:** the slides and offers are the AU live site's. Region-specific banners are marketing data; not built this round.
- **Key Finder:** Prorack is on live's key-finder logo row, but there's no Prorack logo in the project. The card shows the four brands we have.
- **Merchandising:** which slides/offers/product rows run, and when, is backend/CMS. The prototype hard-codes the live page's 2026-09-29 content.

---

## 10. Build list — built 2026-09-29

All built and Playwright-verified (1440 + 390px, session vehicle none/Hilux/Ranger, Fit Finder → VLP sets the vehicle, dots/arrows, inactive slides out of the tab order, autoplay on / off under reduced motion, the refactored drawer still cascades, no horizontal overflow, zero console errors). Not pushed.


1. ✅ `_shared/home-hero/`: slide + offer images from the live site.
2. ✅ `shared.css`: Section 6 components.
3. ✅ `shared.js`: `initFitFinderCascade()` (drawer refactored onto it) + the inline Fit Finder + `initHomeHero()`.
4. ✅ `prototypes/home/index.html`.
5. ✅ Index card, Site Admin template list, `PAGE-GLOSSARY.md`.
6. ✅ Playwright: 1440 + 390px, session vehicle none/Hilux/Ranger, Fit Finder → VLP, slider controls + reduced motion, no horizontal overflow, zero console errors.
7. Later: `HOME-DEVELOPER-BRIEF.md` (text only, no screenshots until final handover).
