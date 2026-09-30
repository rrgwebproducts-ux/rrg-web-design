# Installation — Engineering Spec

Project: the rebuilt `/roof-rack-installation-and-fitting-costs` page: fitting services, a fitting request form and the current fitting charges. Companion to `docs/fit-my-vehicle/fit-my-vehicle-spec.md`, `docs/store/store-spec.md` and `docs/store-finder/store-finder-spec.md`.

Planning session: 2026-09-30. Decisions in Section 7 were answered by Brenton the same day. **Revised 2026-09-30 after the design review** (spec.md §16 items 1–4): the estimator is gone, the form comes first beside a store card, and the prices are a public collapsed accordion below the form.

---

## 0. Goal & scope

The live page is a photo with old logos baked in, a pipe-separated list of what's fitted, two paragraphs, and a raw price table that **shows customers the internal fit-charge codes** (`FIT_2BAR_NO_DRILL`…). Its "Book a Fitting" just goes to `/locations`; there's no booking system.

**In scope:** `prototypes/installation/`, the fitting request form, the price list, and every booking/fitting-cost link on the site pointing here.

**Out of scope:** real lead delivery (backend), real availability or calendar booking.

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Breadcrumbs | Home › Roof Rack Installation | |
| 1.2 | **Hero (contained)** | `.page-hero` | H1 "Roof Rack Installation & Fitting", the live "why fit professionally" copy, **Book a Fitting** (gold → `#book`) as the one button, plus a quiet "See fitting charges" text link (→ `#costs`, AU only). The live photo, cropped to remove its baked-in old logos; 16:9, max 360px tall (was taller, 2026-09-30). The photo choice is still open. |
| 1.3 | Trust row | `.trust-row` | Covered by Our Warranty · Rack Fit Guarantee · Over 200,000 Racks Fitted (30+ years) · 35+ Fitting Centres. |
| 1.4 | What we fit | The VLP's tile grid (`.cat-tile-grid--main`) | **Roof Racks & Platforms** as the large feature tile in its own column (with "See Roof Rack Fitting Charges", AU only), and the rest in two rows beside it: Bike Racks, Kayak & SUP Carriers, Roof Boxes, Awnings & Roof Top Tents, Roller Shutters, Van Fit-Outs & Ladder Racks, Accessories. The spare space is a dark **"Something else? We fit most things → Book a fitting"** tile (`.cat-tile--ask`), the way the VLP's Store Finder tile fills its grid (Brenton, 2026-09-30: the first pass's 4-across tiles were too big). |
| 1.5 | How it works | `.steps` + `.callout` | Choose → Book → Fitted & Checked ("We fit it, load-check it and show you how it all works before you drive off", wording for Scott to confirm). "How long does it take?" callout: 30 minutes to 8 hours (live). |
| 1.6 | **Book a Fitting** (`#book`) | `.booking` + `.booking-from` + store card | Section 5. A "from" line above the form: "Most roof rack fits start from $120. Your store confirms the final price after checking your vehicle." NZ/UK: "Call your store for a fitting price." |
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

The internal codes stay in the data (`FIT_PRICES[].rows[].sku`, inline in the page) for Magento and the developer brief, but never show on the page.

---

## 3. Links into this page (decision 3)

- Every **"Book An Installation"** / **"Book a Fitting"** link on the site → `#book` (trust banners on home, VLP, VCLP, Store Finder, store pages; the Fit My Vehicle page). **"See Fitting Costs"** → `#costs`.
- The PDP's **"See Fitting Options"** (it pointed at the live URL in a new tab) → this page.
- On a **store page**, its booking links carry `?store=<name>`, so the form opens with that store picked.
- Matched by link text in `shared.js` (`rrgLinkInstallation()`), the same approach as the Store Finder and Fit My Vehicle links, so no template needs a markup change.

---

## 4. Current fitting charges (§16 item 2)

- A collapsed `<details id="costs">` below the form: "Current Fitting Charges — Click to view". A GST note and the six price groups (Section 2) go inside.
- It's **public**, not behind a store login: collapsed content stays in the HTML, so Google indexes it and customers can still check a price. A login-gated list would be neither.
- Arriving on `#costs` (every site-wide "See Fitting Costs" link, the hero link, the "from" line, the What We Fit tile) opens it and scrolls to it.
- **AU only** until there are regional prices (§16 item 35). In NZ/UK the accordion, the hero link and the tile link are hidden, and the "from" line reads "Call your store for a fitting price".
- **Removed:** the fitting cost estimator (§16 item 1; Scott: stores don't want customers holding an itemised estimate, and a big total can put people off the rack). `FIT_PRICES` stays the single price source.

---

## 5. Fitting request form (decision 3)

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

---

## 8. Build list — built 2026-09-30, revised the same day (§16)

Built and Playwright-verified:
- 1440 + 390px.
- `#costs` opens the accordion on arrival; store card + map for `?store=Kedron`; no priced Offers in the JSON-LD.
- Form validation (required, Sunday, Saturday afternoon); a successful request to Kedron.
- `?store=` and saved-store prefill; a store page's booking links carry its store.
- No overflow; zero console errors.

Not pushed.
