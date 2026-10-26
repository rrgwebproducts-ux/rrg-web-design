# Installation — Engineering Spec

Project: the rebuilt `/roof-rack-installation-and-fitting-costs` page: fitting services, a fitting request form and the current fitting charges. Companion to `docs/fit-my-vehicle/fit-my-vehicle-spec.md`, `docs/store/store-spec.md` and `docs/store-finder/store-finder-spec.md`.

Planning session: 2026-09-30. Decisions in Section 7 were answered by Brenton the same day. **Revised 2026-09-30 after the design review** (spec.md §16 items 1–4): the estimator is gone, the form comes first beside a store card, and the prices are a public collapsed accordion below the form.

**Revised 2026-10-26 (Brenton): a Magento CMS page, no form in Phase 1.** Everything inside `<main>` is static HTML that goes into the CMS editor as is (Section 0a). The fitting request form (Section 5) is out of Phase 1, so every "Book a Fitting" / "Book An Installation" button on the site goes to the Store Finder (`/locations`) instead. The trust row is replaced by the Home page's thin trust bar, straight under the header.

---

## 0. Goal & scope

The live page is a photo with old logos baked in, a pipe-separated list of what's fitted, two paragraphs, and a raw price table that **shows customers the internal fit-charge codes** (`FIT_2BAR_NO_DRILL`…). Its "Book a Fitting" just goes to `/locations`; there's no booking system.

**In scope:** `prototypes/installation/`, the price list, and every booking/fitting-cost link on the site.

**Out of scope:** the fitting request form and its lead delivery (Phase 2, Section 5), real availability or calendar booking.

---

## 0a. CMS page (2026-10-26)

The page is a Magento CMS page that Brenton maintains. The prototype marks the CMS content with `<!-- ===== CMS content … ===== -->` comments.

**Paste-ready file for the current live site:** `docs/installation/cms/installation-cms.html`, generated from the prototype. Its README has the steps, the SEO comparison with the live page, the image upload list and the live-site compatibility notes. Tested 2026-10-26 inside a saved copy of the live page with the live marcwatts theme CSS. The SEO decisions (2026-10-26):
- the live H1, the price heading and the hero image + alt text are kept word for word;
- the live keyword H2 is written into the hero copy;
- the live meta title and description are left as they are.

| Part | Where it lives |
|---|---|
| Hero, What We Fit tiles, How It Works + callout, Current Fitting Charges, FAQs | **CMS.** Static HTML inside `<main>`; no page script builds any of it. |
| `Service` + `FAQPage` JSON-LD | **CMS.** A static `<script type="application/ld+json">` block. If the CMS editor strips scripts, it goes in the page's layout update instead. When an FAQ changes, the JSON-LD has to change with it. |
| Thin trust bar under the header | **Theme.** The Home page's shared widget (`<div data-widget="trust-bar" data-placement="top">`), not CMS content. |
| Header, breadcrumbs, brands strip, footer | **Theme.** |
| Opening `#costs` on arrival / on click | **Theme JS.** Small (about 15 lines in the prototype). Without it the links still scroll to the closed accordion. |
| CSS for `.page-hero`, `.cat-tile-*`, `.steps`, `.callout`, `.price-accordion`, `.price-table`, `.faq-*` | **Theme CSS.** |
| NZ/UK | Each store view gets its own CMS content. NZ/UK leave out the price section and the two links to it until regional prices exist (§16 item 35). The prototype's region switcher hides them (`data-region-prices`). |

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Breadcrumbs | Home › Roof Rack Installation | |
| 1.2 | **Hero (contained)** | `.page-hero` | H1 "Roof Rack Installation & Fitting", the live "why fit professionally" copy, **Book a Fitting** (gold → Store Finder, 2026-10-26) as the one button, plus a quiet "See fitting charges" text link (→ `#costs`, AU only). The live photo, cropped to remove its baked-in old logos; 16:9, max 360px tall (was taller, 2026-09-30). The photo choice is still open. |
| 1.0 | **Thin trust bar** (2026-10-26) | Shared widget `trust-bar`, `data-placement="top"` | Straight under the header, above the breadcrumbs, the same as the Home page: Over 200,000 Racks Fitted · Reviews.io rating · Price Guarantee · 90 Day Exchange. It replaces the old 4-column trust row (Covered by Our Warranty · Rack Fit Guarantee · Over 200,000 Racks Fitted · 35+ Fitting Centres). |
| 1.4 | What we fit | The VLP's tile grid (`.cat-tile-grid--main`) | **Roof Racks & Platforms** as the large feature tile in its own column (with a **Shop Roof Racks & Platforms** button → `/roof-racks`, like the other tiles' Shop links; Brenton, 2026-10-26. It was "See Roof Rack Fitting Charges" → `#costs`), and the rest in two rows beside it: Bike Racks, Kayak & SUP Carriers, Roof Boxes, Awnings & Roof Top Tents, Roller Shutters, Van Fit-Outs & Ladder Racks, Accessories. The spare space is a dark **"Something else? We fit most things. Ask your nearest store and they'll quote it. → Book a Fitting"** tile (`.cat-tile--ask`, → Store Finder), the way the VLP's Store Finder tile fills its grid (Brenton, 2026-09-30: the first pass's 4-across tiles were too big). |
| 1.5 | How it works | `.steps` + `.callout` | Choose → Book ("Contact your nearest store [→ Store Finder] and they'll book you in, or just drop by", 2026-10-26) → Fitted & Checked ("We fit it, load-check it and show you how it all works before you drive off", wording approved 2026-09-30). "How long does it take?" callout: 30 minutes to 8 hours (live). |
| ~~1.6~~ | ~~**Book a Fitting** (`#book`)~~ | | **Out of Phase 1 (2026-10-26).** The form, its store card and the "from $120" line above it are gone from the page. See Section 5. |
| 1.7 | **Current fitting charges** (`#costs`) | `<details class="price-accordion">` + `.price-groups` | Section 4. Collapsed, public (in the HTML, so indexable). AU only. |
| 1.8 | FAQ | `.faq-section` | 6 questions about the visit, not prices (Section 6). `Service` (no priced `Offer`s) + `FAQPage` JSON-LD. Google no longer shows FAQ rich results (May 2026): the FAQs are for customers, not an SEO feature. |
| 1.9 | Brands, footer | | |

---

## 2. Prices

Every price is the live table's, verbatim, regrouped for customers:

| Group | Contents |
|---|---|
| Removable roof racks (no drilling) | 1–4 bars, $100–$250; 2 bars $120 "most common"; streamline-style 2 bars $200 |
| Drill-fit roof racks (track/gutter) | 1–4 bars, $200–$400; 2 bars $280 "most common" |
| Platforms (incl. backbone) | No drilling $280 "most common"; drilling $380; assemble +$100; universal platform onto existing bars $200; non-standard product POA |
| Vehicle surcharges (on top of the base fit) | Rail removal $150 / with hood-lining drop $450; Wrangler backbone $350; complex fits $200; Front Runner platform $250; internal canopy 1 bar $250 / 2 bars $450 |
| Accessories & add-ons | Accessory $50; vertical bike rack $95; ladder slide $100 each; tent onto bars $250 / platform $500; budget ladder rack $180; roller shutter manual $700 / electric $900; custom $150/hour |
| Products bought elsewhere | $100; tents $350 |

The internal fit-charge codes never show on the page. **Staff shortcut (Brenton, 2026-10-26):** each row carries its code as `data-sku`, and clicking the item name copies it, with a "Copied FIT_…" confirmation. Now that the table is static CMS HTML they aren't in the page source either, so this is the mapping (for Phase 2, if the prices are ever pulled from the fit-charge products):

| Group | Row | Fit-charge code |
|---|---|---|
| Removable roof racks | 1 bar | `FIT_1BAR_NO_DRILL` |
| Removable roof racks | 2 bars | `FIT_2BAR_NO_DRILL` |
| Removable roof racks | 2 bars, streamline style (e.g. Streamline) | `FIT_2BAR_NO_DRILL_STREAMLINE` |
| Removable roof racks | 3 bars | `FIT_3BAR_NO_DRILL` |
| Removable roof racks | 4 bars | `FIT_4BAR_NO_DRILL` |
| Drill-fit roof racks | 1 bar | `FIT_1BAR_DRILL` |
| Drill-fit roof racks | 2 bars | `FIT_2BAR_DRILL` |
| Drill-fit roof racks | 3 bars | `FIT_3BAR_DRILL` |
| Drill-fit roof racks | 4 bars | `FIT_4BAR_DRILL` |
| Platforms | Platform, no drilling required | `FIT_PLATFORM_NO_DRILL` |
| Platforms | Platform, drilling required | `FIT_PLATFORM_DRILL` |
| Platforms | Assemble platform | `FIT_SURCHARGE_ PLATFORM_ASSEMBLY` |
| Platforms | Assemble and fit a universal platform to existing bars | `FIT_PLATFORM_ON_BARS` |
| Platforms | Fit of a product not listed as a manufacturer’s standard | `FIT_CUSTOM` |
| Vehicle surcharges | Rail removal, standard (e.g. Prado 100/200, D-Max, Colorado, MU-X) | `FIT_SURCHARGE_RAIL_REMOVAL` |
| Vehicle surcharges | Rail removal including hood lining drop (e.g. Everest, Wildtrak, Fortuner, Pajero) | `FIT_SURCHARGE_HOOD_LINE_DROP` |
| Vehicle surcharges | Jeep Wrangler backbone (2 or 4 door) | `FIT_SURCHARGE_WRANGLER` |
| Vehicle surcharges | Complex fits (including SX D-Max, MU-X and Dodge RAM) | `FIT_SURCHARGE_SPECIAL_VEHICLE` |
| Vehicle surcharges | Front Runner platform fit charge | `FIT_SURCHARGE_FRONT_RUNNER` |
| Vehicle surcharges | Heavy duty internal canopy system, 1 bar | `FIT_INTERNAL_CANOPY_1BAR` |
| Vehicle surcharges | Heavy duty internal canopy system, 2 bars | `FIT_INTERNAL_CANOPY_2BAR` |
| Accessories & add-ons | Basic accessory not sold with a rack or platform (e.g. bike carrier, awning, basket) | `FIT_ACCESSORY` |
| Accessories & add-ons | Assemble and fit a vertical bike rack | `FIT_VERTICAL_BIKE _RACK _ASSEMBLY` |
| Accessories & add-ons | Ladder slide, MSL & CSL (per slide) | `FIT_LADDERSLIDE` |
| Accessories & add-ons | Roof top tent onto standard bars | `FIT_TENT_TO_BARS` |
| Accessories & add-ons | Roof top tent onto a platform | `Fit_TENT_TO_PLATFORM` |
| Accessories & add-ons | Budget ladder rack | `FIT_BUDGET_BAR` |
| Accessories & add-ons | Manual roller shutter, standard vehicles (excludes bracing and racks if required) | `FIT_MANUAL_ROLLER_SHUTTER` |
| Accessories & add-ons | Electric roller shutter, standard vehicles (excludes bracing, racks and electrical wiring) | `FIT_ELECTRIC_ROLLER_SHUTTER` |
| Accessories & add-ons | Non-listed, custom or special fitting requests | `FIT_OTHER` |
| Products bought elsewhere | Fit surcharge for products not bought from Roof Racks Galore | `FIT_SURCHARGE_NOT_SOLD_PRODUCT` |
| Products bought elsewhere | Fit surcharge for any tent not bought from Roof Racks Galore | `FIT_SURCHARGE_NOT_SOLD_TENT` |

---

## 3. Links into this page (decision 3)

- Every **"Book An Installation"** / **"Book a Fitting"** link on the site → **the Store Finder (`/locations`)** (2026-10-26; was `#book` until the form left Phase 1). That covers the trust banners on Home, VLP, VCLP, Store Finder and store pages, the PLP/VPLP fitting banner, the Fit My Vehicle page and this page's own hero, "Something else?" tile and How It Works step. **"See Fitting Costs"** → `#costs`.
- The PDP's **"See Fitting Options"** (it pointed at the live URL in a new tab) → this page.
- On a **store page**, its booking links go to `/locations?store=<name>`, so the Store Finder opens on that store.
- The **order confirmation's** "Book a Fitting" card is a separate inline form (`docs/checkout/checkout-spec.md`). It needs the same backend, so it is also a Phase 2 question.
- Matched by link text in `shared.js` (`rrgLinkInstallation()`), the same approach as the Store Finder and Fit My Vehicle links, so no template needs a markup change.

---

## 4. Current fitting charges (§16 item 2)

- A collapsed `<details id="costs">` below How It Works: "Current Fitting Charges — Click to view". A GST note and the six price groups (Section 2) go inside.
- It's **public**, not behind a store login: collapsed content stays in the HTML, so Google indexes it and customers can still check a price. A login-gated list would be neither.
- Arriving on `#costs` (every site-wide "See Fitting Costs" link, the hero link, the What We Fit tile) opens it and scrolls to it.
- **AU only** until there are regional prices (§16 item 35). In NZ/UK the accordion, the hero link and the tile link are left out (Section 0a).
- **Removed:** the fitting cost estimator (§16 item 1; Scott: stores don't want customers holding an itemised estimate, and a big total can put people off the rack). `FIT_PRICES` stays the single price source.

---

## 5. Fitting request form (decision 3) — PHASE 2

**Out of Phase 1 (Brenton, 2026-10-26).** It was taken off the page, and the booking links go to the Store Finder for now. This section is kept as the Phase 2 design. The last build with the form is commit `3c78efc`, `prototypes/installation/index.html`.

- **Fields:** Store (all AU stores, grouped by state), name, phone, email, vehicle, what needs fitting, bought from us?, preferred date, preferred time, notes.
- **Store prefill:** `?store=` (from a store page) first, otherwise the visitor's saved store (Site Admin "Nearest store set?" / Make this my store). The **vehicle** is prefilled from the session vehicle.
- **Routing:** the request goes to the chosen store's inbox. The form says so under the store field ("Goes straight to our North Lakes team (northlakes@…)"). Store emails follow the live pattern (`northlakes@`, `eastbrisbane@`, `smeatongrange@`…; `rrgStoreEmail()`). **Production:** the lead goes to the store's inbox or CRM queue from the backend.
- **Store card** (§16 item 3), beside the form: the chosen store as the Store Finder's `.sf-card`: name (→ store page), open now, address, today's hours, a small map, **Call {store}**, Directions and View store. Below it, the two paths: **1. Send a request** and **2. Prefer to talk? Ring {store} on {phone}**. Before a store is chosen it shows a "Choose your store" prompt with a Store Finder link. On desktop it sticks beside the form.
- **Analytics (for the build):** a GA4 event on `tel:` taps (`data-track="fitting_call"`) and on form submit (`fitting_request`), each tagged with the store. Taps aren't connected calls; call tracking would need Google Ads call forwarding or a vendor.
- **Destination:** keep it one config value (the store's email today) so a move to the Avenue booking engine (§16 item 5) is a backend change.
- **Validation:** required fields, a callable phone number, a valid email, no Sundays (stores are closed), and no Saturday afternoons (stores close at 12:30). The date can't be before tomorrow.
- **After sending:** the form is replaced by a confirmation: "Request sent to Kedron… They'll call you on 0412 345 678 to confirm a time", plus the store's email, address and phone. It's a request, not a confirmed booking, and the form says so.

---

## 6. FAQs (§16 item 4) — DRAFT

How long does a fitting take? · Can I wait in store while it's fitted? · Do I need to leave my car with you? · Can you fit a rack I bought somewhere else? · Do you fit accessories as well as roof racks? · What if my vehicle needs extra work?

To check against Crisp chat transcripts and Graham's NZ questions before launch.

## 6a. Open items

- **Store emails:** confirm every store follows the `<name>@roofracksgalore.com.au` pattern (checked on the 11 live store pages crawled).
- **Lead delivery:** email, CRM (e.g. a Magento form module) or Retail Express, decided by the backend.
- **Warranty link** goes to `#` (live has `/warranty`).
- **Saturday-afternoon rule** assumes every store closes at 12:30 on Saturday (true for every store checked).

---

## 7. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 2 | Fitting cost estimator | ~~Yes.~~ **Removed** after the 2026-09-30 design review (§16 item 1). |
| 16.2 | Prices | Form first; the full list in a **public** collapsed accordion below it, plus a "from $120" line. AU only. |
| 3 | Booking | **"Book a Fitting" goes to this page's form**, which sends the lead to the store picked in the form, **prefilled from the session store**. |
| 4 | Hero | **Contained.** |
| 2026-10-26 | CMS | **A Magento CMS page.** What We Fit, the price table and the FAQs are static HTML, not JavaScript. |
| 2026-10-26 | Booking | **The form is out of Phase 1.** Every Book a Fitting CTA → Store Finder (`/locations`). |
| 2026-10-26 | Trust | **The Home page's thin trust bar** (top of page) replaces the trust row. |

---

## 8. Build list — built 2026-09-30, revised the same day (§16)

Built and Playwright-verified:
- 1440 + 390px.
- `#costs` opens the accordion on arrival; store card + map for `?store=Kedron`; no priced Offers in the JSON-LD.
- Form validation (required, Sunday, Saturday afternoon); a successful request to Kedron.
- `?store=` and saved-store prefill; a store page's booking links carry its store.
- No overflow; zero console errors.

**2026-10-26 CMS rebuild**, Playwright-verified: the trust bar sits under the header, above the breadcrumbs. There are 9 tiles, 32 price rows and 6 FAQs, all static, plus a 6-question `FAQPage` JSON-LD. The booking links go to the Store Finder on this page, the PLP and store pages (with `?store=`). Zero console errors.
