# City Stores Page — Engineering Spec

Project: the city (metro area) store pages: the live `/roof-racks-brisbane`, `/roof-racks-sydney`, `/roof-racks-melbourne`, `/roof-racks-perth` and `/roof-racks-adelaide`. They sit between the Store Finder (`docs/store-finder/store-finder-spec.md`) and the individual store pages (`docs/store/store-spec.md`). The conventions are the same as those pages: a plain HTML/CSS/JS prototype, checked with Playwright, and pushed for Brenton's review on Vercel.

Raised by Graham on 2026-11-17 and agreed with Brenton the same day (spec.md §31). **All five are built (2026-11-17) and in review:** Brisbane & SEQ first, then Sydney, Melbourne & Geelong, Perth and Adelaide once Brenton approved the Brisbane design.

---

## 0. Goal & scope

**Live today.** Each city page has a hero image, about 300 words of copy and a list of store names, with no addresses, hours, phone numbers or map. **Nothing links to these pages.** Their store lists are typed in by hand, and they have drifted:
- Sydney still links an Arncliffe page from the sitemap; that store has closed permanently (Brenton, 2026-11-17).
- Melbourne says "9 Superstores" but lists 8 (Preston is missing).

**The new page.** It shows every store in the city with the same detail and map as the Store Finder, and its store list comes from the store data, so it can't drift. It also links both up (to the Store Finder) and down (to each store page).

**Cities (Brenton, 2026-11-17).** Brisbane, Sydney, Melbourne, Perth and Adelaide. Canberra and Hobart have one store each, so they get no city page; their store page is the page for that city.

**No footer city links (Brenton).** The Store Finder leads people to these pages.

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Header / breadcrumbs | Global; **Home › Store Finder › Brisbane & SEQ** | |
| 1.2 | **Hero** | `.plp-hero` + new `.city-hero-facts` | **H1:** "Roof Racks Galore Brisbane, Gold Coast & Sunshine Coast". **Intro:** the live lead line. **Facts:** "**8** superstores · **6 open now**", where the open count comes from each store's open status in its own time zone; if every store is closed, it shows "Closed now · Opens Mon 8:30am" instead. **Find My Nearest Store** is the one gold action: it uses the browser's location, sorts the cards nearest first, labels the first "Nearest store" and scrolls to the list. **Book a Fitting** (outline) goes to the Store Finder, like every booking link in Phase 1. **Photo:** a store front (North Lakes), not the live triptych, whose middle panel is a static map that the live map replaces. |
| 1.3 | **Stores: area tabs, list + map** | The Store Finder's `.sf-tabs`, `.sf-layout`, `.sf-card` and the shared `#showroomMap` | **Area tabs:** All stores 8 · Brisbane 5 · Gold Coast 2 · Sunshine Coast 1. **Cards:** grouped by area under H2s. Each card is the shared **store card** (`rrgStoreCardHTML`, shared.js), the same as the Store Finder's. **Map:** fitted to the city's stores, and the other pins stay on it. Clicking a card opens its pin; clicking a pin highlights its card. **Phones:** a List / Map toggle. No tabs for a city with one area. |
| 1.4 | **Services** | `.trust-row` | The store page's four items (Expert Fitting · Click & Collect · See It In Person · Advice & After-Sales), worded for the city ("pick up from any of our 8 South East Queensland stores"). |
| 1.5 | **Local copy + store photos** | `.store-local` + `.content-block` + new `.city-photo-grid` | The live copy, trimmed (H2 "Roof Racks, Bike Racks, Touring Gear & Professional Fitting"). The brand line follows the approved brands list: STEDI and Wedgetail are left out until their rebates are paid. Beside it, a 2×2 grid of the city's store photos, each labelled and linked to its store page. |
| 1.6 | Trust banner | `.vclp-trust-banner` | As the Store Finder. |
| 1.7 | **FAQ** | `.faq-section` | 5 questions written for the city (Section 3). Phase 1, like the store page FAQs. |
| 1.8 | Shop The Best Brands, footer | Global | |

---

## 2. Data

**Store list.** `RRG_STORE_CITIES` in shared.js has one record per city:
- `name` (the H1 part)
- `short` (the crumb and link label, e.g. "Brisbane & SEQ")
- `state`
- `url` (the live URL)
- `areas`: an ordered list of `{ name, stores: [store names] }`

Store details (address, phone, lat/lng) come from `RRG_STORE_NETWORK`.
- **Production:** each Magento store record gets a **city** field (plus an area within the city), and the page lists every store with that city. A new store then appears automatically.
- **Only cities in `RRG_STORE_CITIES` get links,** so a city's links appear across the site once its record is added.

**Copy.** `CITY_PAGES` in the page itself holds, per city:
- title and meta description (the live ones)
- `region` (e.g. "South East Queensland")
- intro, local heading and copy, and the brand line
- hero photo and store photos

In production this is the city page's CMS content; the store list and facts are not.

**Brisbane & SEQ:**

| Area | Stores |
|---|---|
| Brisbane | North Lakes, Kedron, East Brisbane, Rocklea, Springwood |
| Gold Coast | Gold Coast (Molendinar), Burleigh Heads |
| Sunshine Coast | Sunshine Coast (Warana) |

All 8 stores, matching the live page.

The other cities use the live pages' own area groupings (crawled 2026-11-17):

| City (`?city=`) | Areas → stores | Differences from the live page |
|---|---|---|
| Sydney (`sydney`), 7 | Northern Sydney: Warriewood, Castle Hill · Western Sydney: Silverwater · South Western Sydney: Moorebank, Smeaton Grange · Southern Sydney: Miranda, Matraville | None. Arncliffe has closed permanently (Brenton); its page is still in the live sitemap. |
| Melbourne & Geelong (`melbourne`), 9 | Northern Melbourne: Epping, Preston · Eastern Melbourne: Mitcham · Western Melbourne: Hoppers Crossing, Maidstone · South Eastern Melbourne: Hallam, Moorabbin, Frankston · Geelong: Geelong | **Preston added.** The live page says 9 stores but lists 8. Live calls the last group "Regional Victoria". |
| Perth (`perth`), 6 | Northern Perth: Joondalup, Malaga · Central Perth: Osborne Park · Eastern Perth: Welshpool · Southern Perth: Rockingham, Cockburn | None. **Cockburn (Yangebup)** opened Nov 2026 and was added to the store network from its live page `/roof-racks-galore-cockburn-store`: 10/49 Simper Drive, Yangebup WA 6164, (08) 9566 1922, cockburn@roofracksgalore.com.au, standard hours. The pin is the live locator's. It has no store photos yet. |
| Adelaide (`adelaide`), 4 | Central Adelaide: Adelaide City · Northern Adelaide: Edinburgh, Pooraka · Southern Adelaide: Lonsdale | None. The H1 keeps the live "Adelaide Metro"; the crumb and links say "Adelaide". |

**Shared copy.** The fitting paragraph and the brand line are shared by every city (`CITY_FITTING_COPY`, `CITY_BRANDS`). Each city has its own lead line (the live one), range paragraph, hero photo and four store photos, taken from the stores' live galleries and saved as .webp in `_shared/stores/`.

---

## 3. FAQ

The store lists and hours are generated from the data, so they can't drift.
1. **Where are your stores in {region}?** Each area's stores, with the suburb where it differs from the store name.
2. **What are your store opening hours?** The standard hours (`RRG_STANDARD_HOURS`), closed Sundays and public holidays. Each store page has its own week, including holidays.
3. **Can I get a roof rack fitted in {areas}?** Yes, at every store (from the live copy).
4. **Can I order online and pick up in store?** Click & Collect.
5. **Which brands do your stores carry?** The approved brand line.

---

## 4. Links (the internal links Graham asked for)

- **Store Finder:** each state heading in the list links to its city page ("Queensland … Brisbane & SEQ stores ›"). The heading shows whenever the list is grouped by state, so the link appears both under All stores and on the QLD tab. New shared `.sf-group-head`.
- **Store page breadcrumbs:** **Home › Store Finder › Brisbane & SEQ › North Lakes.** The city replaces the state crumb (Brenton, 2026-11-17). A store in no city (Canberra, Hobart) keeps the state crumb, which opens the Store Finder on that state.
- **Store page "Other Stores Near {store}":** an **All Brisbane & SEQ stores ›** link beside the heading.
- **City page:** each card's name, View Store and photo link to the store page; the crumb links up to the Store Finder.
- Not in the footer (Brenton).

---

## 5. SEO

- **URLs:** keep the live URLs (`/roof-racks-brisbane`, …) and their titles and meta descriptions; the prototype uses `?city=`. Indexed.
- **JSON-LD:**
  - an `ItemList` of the city's stores, each an `AutoPartsStore` with its URL, phone, address and geo;
  - a `BreadcrumbList`;
  - an `FAQPage`.

---

## 6. Components

- **New shared, in shared.js:**
  - `RRG_STORE_CITIES`, `rrgStoreCity(name)`, `rrgStoreCityHref(slug)`;
  - `rrgStoreCardHTML(st, { km, nearest, active })`: the Store Finder's card, moved out of the page so both pages use one card;
  - `rrgAuStoreList()`;
  - `rrgWhenStoreMap(fn)` and `rrgOpenStorePin(name)`: map sync, moved out of the Store Finder.
- **New CSS:** `.sf-group-head` (state or area heading with a link), `.city-hero-facts`, `.city-hero-media`, `.city-photo-grid` / `.city-photo`.
- **Component Library:** new `city-stores` and `city-photo-grid`. The store card, breadcrumbs, category hero, trust row, local copy, content block, trust banner, FAQ and brands strip are now also used on `store-city`.

---

## 7. Open

- **For Graham:**
  - **Live Arncliffe page:** the store has closed permanently, but its page is still in the live sitemap. It should be redirected (to the Sydney page) and dropped from the sitemap.
  - **Live Melbourne page:** it lists 8 stores under "9"; Preston is missing.
  - **Cockburn photos:** the live store page has none yet, so it isn't in the Perth photo grid.
- **Store photos:** the prototype only has photos for the stores it has pages for. Production uses each store record's images.
