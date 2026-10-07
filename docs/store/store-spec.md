# Store Page — Engineering Spec

Project: a new template for each store's own landing page (for example `/roof-racks-north-lakes-superstore`), replacing the live Magento store page.

Companion to `docs/home/home-spec.md`, `docs/vlp/vlp-spec.md` and the header/footer specs. Same conventions: plain HTML/CSS/JS prototype, Playwright verification before sign-off, push only once approved.

Planning session: 2026-09-29. Decisions in Section 9 were answered by Brenton the same day.

---

## 0. Goal & scope

Every store already has a page on the live site, but **nothing on the site links to them**. They're only reached as the website link on each store's Google Business Profile. They're built from a template the team **can't stand** (Brenton: "don't try to replicate it at all"). The new page is designed from scratch in the rebuilt site's style and linked from everywhere a store is named.

**In scope:** `prototypes/store/` (one template, eleven real stores via `?store=`), the per-store data model, "Make this my store", links into the page from the rest of the site, and housekeeping (index card, Site Admin list, glossary).

**Out of scope:** the all-stores locator page (`/locations`), real per-store stock or display data, and the developer brief (written once the page is stable).

---

## 1. How the live page is built (Magento store record)

The live page is one template filled from each store's record. North Lakes' record (supplied by Brenton, 2026-09-29):

| Field | Live use | New page |
|---|---|---|
| `description.slogan` | The H2 over the local copy. Free text; it's where North Lakes' "North lakes" typo comes from. | **Dropped.** Headings are built from the store name + a new `area` field. |
| `description.seo_text` | Local copy block | **Kept**, as the local copy section. |
| `store.open.hours` | HTML text (`Mon-Fri: …<br>Sat: …`) | **Replaced** by structured hours per day, so the page can show "Open now" and today's hours, and emit `openingHoursSpecification`. |
| `location.map.embed_code` | Pasted Google iframe | **Replaced** by `lat`/`lng` (taken from the iframe for these three stores). The map is the site's own Leaflet map. |
| `location.map.url` | — | **Kept**: Get Directions / View on Google Maps. |
| `store.image_main`, `store.images` | Hero photo, gallery | **Kept**, plus **alt text per image** (live shows "Store Image 2", "Store Image 3"…). |
| `store.click_and_collect`, `retailexpress.*`, `inventory.stock_location` | Click & Collect, stock | **Kept**: drives the Click & Collect service line; stock stays backend. |
| *(email)* | Shown on live but not in the supplied record | **Needs confirming** where it lives; the prototype uses the live value. |
| *(FAQ)* | Hard-coded in the template: five questions, every answer the same placeholder, one about shipping internationally | **New per-store `faqs` field.** Answers are written for each store, not shared (decision 3). |
| *(new)* `area`, `areasServed` | — | "North Brisbane"; the suburb list that's currently buried in `seo_text`. |
| *(new)* `onDisplay` | — | Products on the showroom floor (decision 4). Per-store data from the display/inventory system in production; demo data here. |
| *(new)* `url` | — | The page's address, so every mention of the store can link to it. |

The prototype's `STORES` object (inline in `prototypes/store/index.html`) follows this shape field for field, so it doubles as the proposed Magento data model.

---

## 2. Worked examples (decision 2)

| | North Lakes | Moorebank | Castle Hill |
|---|---|---|---|
| State | QLD | NSW | NSW |
| URL (live, kept) | `/roof-racks-north-lakes-superstore` | `/roof-racks-moorebank-superstore` | `/roof-racks-castle-hill-superstore` |
| Area | North Brisbane | South West Sydney | North West Sydney (live's H2 says "North Sydney"; the store's own copy says north-west) |
| Photos | 5 | 8 | 3 |

All three stores' hours, phone, email, address, local copy and photos come from their live pages (crawled 2026-09-29). Photos are in `_shared/stores/`. The page is chosen by `?store=<slug>` (prototype only), default North Lakes, which is the prototype's default nearest store.

**Eight more stores (Brenton, 2026-09-30: every nearby card should link to its store's page).** Every store in the three examples' "Other stores near …" lists that has a live page was built the same way from its live page: Kedron, East Brisbane, Rocklea, Silverwater, Smeaton Grange, Miranda, Warriewood and Matraville. That's eleven stores in all. The records moved to `prototypes/store/stores-data.js`.

- **Sunshine Coast** has no live store page (the live sitemap lists 30 store pages; Sunshine Coast, Gold Coast, Canberra and Hoppers Crossing are among those without one). Its card on North Lakes stays unlinked and offers Get Directions instead.
- The eight new stores' own nearby lists sometimes include a store we haven't built (Springwood appears for the Brisbane stores). Those cards are unlinked in the prototype; in production every store with a page links.
- **Whole card clickable:** a card for a store with a page is one link (the store name's link stretches over the card); the phone number stays a separate tap-to-call link.
- **Live data problems found while crawling:** East Brisbane's meta description says "Gold Coast southside" (corrected in the prototype); Kedron's local copy is one paragraph with no suburb list, so its "Areas we serve" is hidden; two live gallery entries are 300×400 placeholders (Kedron's `kedron-7.jpg`, East Brisbane's `eastbrisbane-inside-3jpg` with a missing dot) and were left out.

---

## 3. Sections (top to bottom)

Deliberately nothing like the live layout. It uses the same familiar shape as the PDP (photos left, a decision panel right), which Brenton prefers over imagery-led layouts.

| # | Section | Build | Notes |
|---|---|---|---|
| 3.1 | Header / footer | Global | "Your Nearest Store" links to the saved store's page. |
| 3.2 | Breadcrumbs | `.rrg-crumbs` | Home › Store Finder › Queensland › North Lakes. Store Finder and the state link to the locator (not built this round). |
| 3.3 | **Hero** | `.hero` + the PDP's `.gallery-col` / `.gallery-main` / `.gallery-thumbs` + `.decision-panel` | **Left:** the store's photos, same gallery as a product (full-width thumbnails, same click handler). **Right, the store panel:** H1 "Roof Racks Galore North Lakes", area subline, **open status** ("Open now · Closes 5:00pm" / "Closed · Opens Mon 8:30am", worked out in the store's own time zone), a **Google rating** line ("★ 4.8 · 312 Google reviews", linking to the Google listing; §16 item 15), address, phone, email, a **holiday hours** line for the next 60 days ("closed Mon, 5 Oct (King's Birthday)"), then the week's hours with today highlighted and any public holiday in the coming week shown on its row as "Closed · King's Birthday" in soft red (§16 item 14). Open status treats a holiday as closed. **Get Directions** is the one gold action; Call the Store is outline; **Make this my store** is a quiet link that becomes "✓ Your store" once set. |
| 3.4 | **Services** | `.trust-row` | Expert Fitting · Click & Collect · See It In Person · Advice & After-Sales. Copy trimmed from live's "Get Racked Right". Click & Collect only when `store.click_and_collect`. |
| 3.5 | **See It in Person at {store}** | `.product-carousel` + `plpCardHTML()` | Renamed from "On display at" (§16 item 16: make it clear there's far more in store to see and touch; "core products" was rejected). Intro: "Plus hundreds more racks, fittings and accessories in store — ask the team." In Phase 2, **Shop what's in stock at {store} ›** goes to the PLP with Availability = In Stock at that store (`?availability=here&store=`). Demo products differ per store; production should drive the row from a real per-store "on display" flag, not stock level. |
| 3.5a | **Latest Google reviews** | `.store-review-row` | §16 item 15: the newest 3 Google reviews, unedited and never hand-picked, with Google's attribution (logo, author name and photo, per the Places API terms) and **Read all on Google ›**. The prototype shows the layout only; no review text is made up. |
| 3.6 | **Local copy + map** | `.content-block` beside the shared `#showroomMap` | H2 "{Area} Roof Racks & Touring Accessories", the store's `seo_text`, **Areas we serve** chips, and the map centred on the store at street level with every other store's pin still there. |
| 3.7 | Trust banner | `.vclp-trust-banner` | Reviews.io badge + Book An Installation / Call the Store. Replaces live's empty "Real Feedback" section. |
| 3.8 | **FAQ** | `.faq-section` | 6 questions **written for this store** (Section 5). |
| 3.9 | **Nearby stores** | **New `.store-nearby`** | The 4 closest other stores (straight-line km from `lat`/`lng`), each with suburb, phone and a link to its page. The internal links Google has never had. |
| 3.10 | Shop The Best Brands | `.brands-section` | |

---

## 4. Links into store pages (decision 1)

Every place the site names a store links to its page:

- **Header "Your Nearest Store"** → the saved store's page.
- **Store slide-out** rows (every template) → store name is a link.
- **Click & Collect** store rows (PDPs) → store name is a link.
- **Showroom Finder** "On display" rows (PDPs) → store name is a link.
- **Nearby stores** on each store page.

One shared helper, `rrgLinkStoreNames()` in shared.js, turns store names in `.dc-store` rows into links, so no template needs its own markup changes. In production every store has a page. In the prototype only the three built stores link; the others stay plain text.

### "Make this my store"

Sets the visitor's saved store (new `rrgSessionStoreName`, localStorage). That name then drives "Your Nearest Store" in the header and the store-aware stock lines, which previously used a store name fixed in each page's markup. Setting it also switches Site Admin's "Nearest store set?" on.

---

## 5. FAQ (decision 3)

Six per store, all using that store's own facts: its hours, address, services, suburbs, nearest other store, and the trips its own copy mentions (Bribie Island / K'gari; Blue Mountains / South Coast; Blue Mountains / Hawkesbury). **No universal questions**, and nothing like "Do you ship internationally?". They're drafts for the store teams to check. Nothing is stated that isn't in the store's live data (for example no parking or fitting-time claims); those are good additions once the stores supply them.

---

## 6. SEO

- **Indexed.** Keep each store's live URL and `<title>`/meta description (they're good).
- **H1** "Roof Racks Galore {Store}" (fixes live's "North lakes").
- **JSON-LD:** `AutoPartsStore` (a `LocalBusiness` type) with address, `geo`, phone, email, `openingHoursSpecification`, images, `areaServed` and `parentOrganization`, plus `BreadcrumbList` and `FAQPage`. Live has only a generic `Organization` block, so Google gets none of the store's details from the page.
- The internal links in Section 4 are the other half of the SEO fix.

---

## 7. New / changed components

| Component | Where | Notes |
|---|---|---|
| `.store-panel` extras (`.store-open`, `.store-hours`, `.store-contact`) | `shared.css` | Inside the PDP's `.decision-panel`. |
| `.store-local` (copy + map), `.store-areas` chips | `shared.css` | |
| `.store-nearby` | `shared.css` | |
| `RRG_STORE_PAGES`, `rrgStorePageHref()`, `rrgLinkStoreNames()`, `rrgSetStore()` | `shared.js` | Section 4. |
| North Lakes / Moorebank / Castle Hill `lat`/`lng` in `RRG_STORE_NETWORK` | `shared.js` | Corrected to the Google listing positions. |

---

## 8. Open items

- **Google rating + reviews** (§16 item 15): the ratings are **demo figures**. Production reads `rating` + `user_ratings_total` and the newest reviews from the Google Places API and caches only as Google's terms allow. No `AggregateRating` markup: since 2019 Google doesn't show stars for a business's reviews of itself.
- **Public holidays** (§16 item 14): real 2026 dates by state in `RRG_PUBLIC_HOLIDAYS` (shared.js), emitted as `specialOpeningHoursSpecification` (closed = 00:00–00:00). Real hours and holidays are entered in cPanel/PHP. Ask Marc (§16 item 33) whether they can feed Google Business Profile too, so Google's "Open now" agrees.

- ~~**Store locator page**~~ — built 2026-09-30 as the Store Finder (`docs/store-finder/store-finder-spec.md`); the breadcrumbs link to it.
- **Email field:** confirm which Magento field holds it.
- **Services per store:** all three offer everything. If some stores don't (for example no roof top tent fitting), `services` becomes a per-store list.
- **Showroom data:** `onDisplay` needs a real source. The PDP's `ON_DISPLAY_STORES` is still demo data too.
- The PDP Showroom Finder's demo rows say "Open today until 5:30pm". Real hours are 5:00pm. They could read the same hours data.

---

## 9. Decisions log (2026-09-29)

| # | Question | Answer |
|---|---|---|
| 1 | Link store pages from the header, store slide-out, Click & Collect rows and nearby stores? | **Yes.** |
| 2 | Worked examples | **2–3 stores**: North Lakes, Moorebank, Castle Hill. |
| 3 | FAQ | **Store-specific answers only**, not universal. |
| 4 | "On display at this store" product row | **Yes.** |
| — | The live template | "We completely despise it": don't replicate it. |

---

## 10. Build list — built 2026-09-29

All built and Playwright-verified: 1440 + 390/360px, all three stores, open / closed / opens-tomorrow states via `?now=`, Make this my store carrying to the header on other pages, store links from a PDP's Click & Collect / Showroom rows and the Store slide-out, Castle Hill ↔ Moorebank nearby links, no horizontal overflow, zero console errors. The PDP Demo State panel is suppressed here (the page borrows `.decision-panel`). Not pushed.


1. ✅ `_shared/stores/`: the three stores' photos (from live, resized).
2. ✅ `shared.css` / `shared.js`: Section 7.
3. ✅ `prototypes/store/index.html`.
4. ✅ Index card, Site Admin list, `PAGE-GLOSSARY.md`.
5. ✅ Playwright: 1440 + 390px, all three stores, Make this my store, store links from a PDP and the slide-out, no overflow, zero console errors.
6. Later: `STORE-DEVELOPER-BRIEF.md` (text only).
