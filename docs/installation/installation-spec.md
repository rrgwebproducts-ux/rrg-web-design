# Installation — Engineering Spec

Project: the rebuilt `/roof-rack-installation-and-fitting-costs` page: fitting services, prices, a cost estimator and a fitting request form. Companion to `docs/fit-my-vehicle/fit-my-vehicle-spec.md`, `docs/store/store-spec.md` and `docs/store-finder/store-finder-spec.md`.

Planning session: 2026-09-30. Decisions in Section 7 were answered by Brenton the same day.

---

## 0. Goal & scope

The live page is a photo with old logos baked in, a pipe-separated list of what's fitted, two paragraphs, and a raw price table that **shows customers the internal fit-charge codes** (`FIT_2BAR_NO_DRILL`…). Its "Book a Fitting" just goes to `/locations`; there's no booking system.

**In scope:** `prototypes/installation/`, the estimator, the fitting request form, and every booking/fitting-cost link on the site pointing here.

**Out of scope:** real lead delivery (backend), real availability or calendar booking.

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Breadcrumbs | Home › Roof Rack Installation | |
| 1.2 | **Hero (contained)** | `.page-hero` | H1 "Roof Rack Installation & Fitting", the live "why fit professionally" copy, **Book a Fitting** (gold → `#book`) + See Fitting Costs (→ `#costs`). The live photo, cropped to remove its baked-in old logos; 16:9, max 360px tall (was taller, 2026-09-30). The photo choice is still open. |
| 1.3 | Trust row | `.trust-row` | Covered by Our Warranty · Rack Fit Guarantee · Over 200,000 Racks Fitted (30+ years) · 35+ Fitting Centres. |
| 1.4 | What we fit | The VLP's tile grid (`.cat-tile-grid--main`) | **Roof Racks & Platforms** as the large feature tile in its own column (with "See Roof Rack Fitting Costs"), and the rest in two rows beside it: Bike Racks, Kayak & SUP Carriers, Roof Boxes, Awnings & Roof Top Tents, Roller Shutters, Van Fit-Outs & Ladder Racks, Accessories. The spare space is a dark **"Something else? We fit most things → Book a fitting"** tile (`.cat-tile--ask`), the way the VLP's Store Finder tile fills its grid (Brenton, 2026-09-30: the first pass's 4-across tiles were too big). |
| 1.5 | How it works | `.steps` + `.callout` | Choose → Book → Fitted & Tested. "How long does it take?" callout: 30 minutes to 8 hours (live). |
| 1.6 | **Fitting costs** (`#costs`) | New `.estimator` + `.price-groups` | Section 4. |
| 1.7 | **Book a Fitting** (`#book`) | New `.booking` | Section 5. |
| 1.8 | FAQ | `.faq-section` | 6 questions answered only from the live page and price list; `Service` (with every priced fit as an `Offer`) + `FAQPage` JSON-LD. |
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

The internal codes stay in the data (`FIT_PRICES[].rows[].sku`, inline in the page) for Magento and the developer brief, but never show on the page.

---

## 3. Links into this page (decision 3)

- Every **"Book An Installation"** / **"Book a Fitting"** link on the site → `#book` (trust banners on home, VLP, VCLP, Store Finder, store pages; the Fit My Vehicle page). **"See Fitting Costs"** → `#costs`.
- The PDP's **"See Fitting Options"** (it pointed at the live URL in a new tab) → this page.
- On a **store page**, its booking links carry `?store=<name>`, so the form opens with that store picked.
- Matched by link text in `shared.js` (`rrgLinkInstallation()`), the same approach as the Store Finder and Fit My Vehicle links, so no template needs a markup change.

---

## 4. Estimator (decision 2)

Four steps, each line priced from the same data as the price list, so the two can't disagree:

1. **What are we fitting?** Removable racks / drill-fit racks (with 1–4 bars, and a streamline option at 2 bars), platform with or without drilling (+ "needs assembling"), universal platform onto existing bars, or no rack (accessories only).
2. **Vehicle extras:** each vehicle surcharge as a checkbox card.
3. **Add-ons:** roof top tent (onto bars or platform), accessories × 0–4, roller shutter, ladder slides × 0–2, vertical bike rack assembly, budget ladder rack.
4. **Bought elsewhere?** +$100, and +$350 when there's a tent.

The summary (sticky beside the form on desktop) itemises the lines and the total, notes "Estimate only… complex or custom fits are $150 per hour", and **Book This Fitting** copies the estimate into the booking form's notes and picks "What needs fitting". On phones and tablets, a total bar sticks to the bottom of the screen while the estimator is in view.

---

## 5. Fitting request form (decision 3)

- **Fields:** Store (all AU stores, grouped by state), name, phone, email, vehicle, what needs fitting, bought from us?, preferred date, preferred time, notes.
- **Store prefill:** `?store=` (from a store page) first, otherwise the visitor's saved store (Site Admin "Nearest store set?" / Make this my store). The **vehicle** is prefilled from the session vehicle.
- **Routing:** the request goes to the chosen store's inbox. The form says so under the store field ("Goes straight to our North Lakes team (northlakes@…)"), and the side panel shows the store's phone for anything urgent. Store emails follow the live pattern (`northlakes@`, `eastbrisbane@`, `smeatongrange@`…; `rrgStoreEmail()`). **Production:** the lead goes to the store's inbox or CRM queue from the backend.
- **Validation:** required fields, a callable phone number, a valid email, no Sundays (stores are closed), and no Saturday afternoons (stores close at 12:30). The date can't be before tomorrow.
- **After sending:** the form is replaced by a confirmation: "Request sent to Kedron… They'll call you on 0412 345 678 to confirm a time", plus the store's email, address and phone. It's a request, not a confirmed booking, and the form says so.

---

## 6. Open items

- **Store emails:** confirm every store follows the `<name>@roofracksgalore.com.au` pattern (checked on the 11 live store pages crawled).
- **Lead delivery:** email, CRM (e.g. a Magento form module) or Retail Express, decided by the backend.
- **Warranty link** goes to `#` (live has `/warranty`).
- **Saturday-afternoon rule** assumes every store closes at 12:30 on Saturday (true for every store checked).

---

## 7. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 2 | Fitting cost estimator | **Yes.** |
| 3 | Booking | **"Book a Fitting" goes to this page's form**, which sends the lead to the store picked in the form, **prefilled from the session store**. |
| 4 | Hero | **Contained.** |

---

## 8. Build list — built 2026-09-30

Built and Playwright-verified:
- 1440 + 390px.
- Estimator totals (for example platform + assembly + rail removal + tent onto platform + outside tent = $1,380), Book This Fitting → form prefill.
- Form validation (required, Sunday, Saturday afternoon); a successful request to Kedron.
- `?store=` and saved-store prefill; a store page's booking links carry its store.
- Mobile sticky total; no overflow; zero console errors.

Not pushed.
