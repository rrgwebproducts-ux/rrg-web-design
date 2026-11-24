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
  - **Cockburn photos:** the live store page has none yet. The rework example uses its Google Business Profile storefront photo (Section 8).
- **Store photos:** the prototype only has photos for the stores it has pages for. Production uses each store record's images.

---

## 8. Rework plan: fitting and local advice, not a second Store Finder (Marc → Brenton, 2026-11-24). EXAMPLE BUILT FOR COMPARISON

**Example built 2026-11-24 (Brenton: a separate page to send Marc and Graham beside the current one):** `prototypes/store-city-v2/?city=perth`. The current page (`prototypes/store-city/`) is untouched.
- Perth is complete: the nationwide bar, a hero led by fitting, the fitting services row, the Fit Finder, Marc's 13 questions with answers, 16 real WA fitments from Rackit (`_shared/fitments/perth/`, 480×360 .webp), store cards in a grid with no map, and the 3-question store FAQ.
  - WA question 4 is reworded to "…the Swan River, Margaret River or the Coral Coast" (vehicles can't go to Rottnest).
- The other cities render on the same page without the advice and gallery sections until their lists are signed off.
- **Changes from 8.1:**
  - The store cards are one grid with the area name above each card. Headings per area left half-empty rows.
  - The services row comes before the Fit Finder.
  - The advice is two independent columns, so opening one answer doesn't push the other column down.
- **Shared widget change (8.2):** done in `shared.js`. A Fitment Gallery photo with `vehicle` / `rack` / `store` shows its own record: no extra-angle thumbs, a "Fitted at {store}" link and "Shop Racks For This Vehicle". The Vehicle-Specific product page was checked and is unchanged.
- The new CSS is page-scoped in the example; it moves to shared.css when the rework is approved.

**Marc's reply (Slack, 2026-11-24):** "new perth page is great, i think that's the kind of stuff we need". He thinks the fitments are fine (Magento has location data). He asked for two changes, made the same day:
- **Stores moved up,** to straight after the fitting services row, before the Fit Finder.
- **Store photo on each card,** so visitors get a feel for their local store. The shared store card takes a new optional `photo` (`{ src, alt }`, or `'placeholder'`). The photo sits full-bleed at 16:9 at the top of the card and links to the store page. The Store Finder doesn't pass it, so its cards are unchanged (checked: 36 cards, no photos).
  - Rockingham and Cockburn have no photos on their live pages (only an old "25 stores" banner). Their card photos come from their **Google Business Profiles**: storefront shots the stores uploaded themselves, not customer photos (Brenton, 2026-11-24). They're saved as `rockingham-outside.webp` (1200×900) and `cockburn-outside.webp` (640×480, the largest Google has). The logo panel (`photo: 'placeholder'`) stays as the fallback for any store with no photo.
  - **For production:** those two photos should go into the stores' own galleries, so their live store pages get them too.
  - The local copy's 2×2 store photo grid is gone (the photos are on the cards now); the copy runs on its own.

**Marc's feedback (Slack, 2026-11-24).** He's happy with the Store Finder (`/locations`), but the city pages need more work:
- **It looks like the Store Finder.** It has the same map, area tabs and cards, so it reads as a filtered copy of `/locations`.
- **It can read as "RRG is only in Perth."** Someone who lands on it from another state sees six stores on a map and nothing about the other 30.
- **Lead with fitting.** He wants the page built around fittings, local experts and the Fit Finder, and focused on the region, with questions written for local conditions (his WA list is in 8.3).

**Brenton's decisions (2026-11-24):**
- **All five city pages** get the rework: Brisbane & SEQ, Sydney, Melbourne & Geelong, Perth, Adelaide. These are the only multi-store region pages on the live site (sitemap checked 2026-11-24). `/roof-racks-gold-coast`, `-sunshine-coast`, `-canberra`, `-adelaide-city`, `-pooraka`, `-hoppers-crossing` and `-wellington` are single-store pages.
- **No map.** The Store Finder is the only page with the store map.
- **A "we're nationwide" call to action at the top.** It shows the other stores and the other cities.
- **We write the answers to the local questions.** Marc's WA questions are fine as they are. The other four cities need their own lists (8.3).

### 8.1 New section order

| # | Section | Change | Build |
|---|---|---|---|
| 1 | Breadcrumbs | No change (Home › Store Finder › {City}) | Global |
| 2 | **Nationwide bar** (new) | A slim bar above the hero: "**6** Perth stores · **30** more across Australia", then links to the other four cities and **All 36 stores ›** (Store Finder). Counts come from `RRG_STORE_NETWORK` / `RRG_STORE_CITIES`, so they can't drift. On phones the city links scroll sideways. | New `.city-network-bar` |
| 3 | **Hero** | The H1, title and meta stay the live ones (SEO). The intro is rewritten to lead with fitting and local know-how. Facts: "6 superstores · N open now · **4,600+ WA fitments**", where the last is the state's Rackit fitment count. Buttons: **Book a Fitting** (gold) and **Find My Nearest Store** (outline; still sorts the store cards, with no map). | Category Hero (existing) |
| 4 | **Fit Finder** (new on this page) | The shared inline vehicle finder: "Find racks that fit your vehicle". Submits to the VPLP, as on the MCLP. | `data-widget="vehicle-finder"` (existing) |
| 5 | **Fitting services row** | Reworded to lead with fitting: Expert Fitting at every {City} store · See Fitting Costs (→ Installation `#costs`) · Click & Collect · Advice & After-Sales. | `.trust-row` (existing) |
| 6 | **Local advice** (new content) | 10–13 questions per city about local trips and conditions (8.3). Every answer ends with one link to the matching category. Accordion, first item open, two columns on desktop. Included in the `FAQPage` JSON-LD. | `.faq-section` (existing), plus a `.city-advice` 2-column modifier |
| 7 | **Fitment Gallery: recently fitted in {City}** | Real fitments from that city's stores, from Rackit (photo, vehicle, rack, store). Count = the city's stores' fitments. | Fitment Gallery (existing). **Needs a widget change:** see 8.2 |
| 8 | **Stores, compact** | Store cards in a grid, grouped under area headings, with "All 36 stores ›" at the end. **No map, no List/Map toggle, no area tabs.** The Leaflet and markercluster scripts come off the page. | Store Card (`rrgStoreCardHTML`, existing) |
| 9 | Local copy + store photos | No change | Existing |
| 10 | Trust banner | No change | Existing |
| 11 | **Store FAQ, shortened** | Cut to the 3 practical questions: where are the stores, opening hours, Click & Collect. The fitting and brands questions are dropped because the advice section and the copy now cover them. | `.faq-section` (existing) |
| 12 | Shop The Best Brands, footer | No change | Global |

**What comes off the page:** the map, the List/Map toggle, the area tabs and Leaflet. Nothing else on the site uses the city page's map code, and the Store Finder keeps its own.

### 8.2 Component changes (Component Library first)

- **Fitment Gallery, per-photo details.** Today the detail view reads the vehicle and rack components off the page (a PDP concept), so on a city page it would show the city H1 and an empty component list. The change is backwards-compatible: when a photo record has `vehicle`, `rack` and `store`, the detail view shows those, and the button reads "Shop Racks For This Vehicle" instead of "Back to Product". Pages without them are unchanged.
  - Change it in the Component Library first, then check every page it's used on (VS, VCLP, VPLP, MCLP, VLP).
- **Nationwide bar.** A new Component Library entry (stores group), used on the city pages only.
- **Store Card.** No change. It's just laid out in a grid instead of beside a map.
- **Data:** the prototype takes about 16 real fitments per city from the Rackit gallery (filtered by the city's stores), saved like `MCLP_PHOTOS`. **Production:** the page queries Rackit by store list (Marc's integration). The count is the real total for those stores.

### 8.3 Local advice questions

The answers get written when this is built. They're practical, brand-neutral where possible, and never invent regulations or exact load numbers (they say "check your vehicle's and rack's rating"). Each one links to a category. **They go to each state's store team to sanity-check before launch.**

**Perth / WA (Marc's list, 2026-11-24)**
1. What roof rack setup holds up best on the Gibb River Road and other corrugated WA tracks?
2. How do I protect my roof rack and gear from red dust on outback trips?
3. What's the best way to carry extra fuel and water jerry cans on a roof rack for remote WA travel?
4. What's the best way to carry a kayak or SUP to Rottnest ferries, Margaret River or the Coral Coast? *(To check: vehicles can't go to Rottnest. Suggest "…to the Swan River, Margaret River or the Coral Coast".)*
5. What roof rack setup works for carrying surfboards to Margaret River and the South West?
6. How do I mount a rooftop tent for camping trips to Esperance and Cape Le Grand?
7. What roof rack is best for carrying a recovery kit, Maxtrax and a shovel for beach driving at Lancelin or Yeagarup?
8. How should I set up a roof rack for the strong crosswinds on the Brand and North West Coastal Highways?
9. What roof rack setup suits FIFO workers driving between Perth and the Pilbara or Goldfields?
10. How much weight can I safely carry on my roof for off-road driving compared with highway driving?
11. Which awnings and roof rack accessories cope best with WA's heat and UV?
12. What roof rack setup works for towing a caravan or camper trailer up the coast?
13. How do I stop gear on my roof rack rattling loose on long gravel roads in the Kimberley?

**Brisbane & SEQ (draft, for Marc/Graham to approve)**
1. What roof rack setup suits beach driving on K'gari (Fraser Island), Moreton Island and Bribie?
2. How do I stop salt and sand corroding my roof rack after a beach trip?
3. What's the best setup for a Cape York trip on the Peninsula Development Road and Old Telegraph Track?
4. How do I carry surfboards to Noosa, the Sunshine Coast or the Gold Coast breaks?
5. What's the best way to carry a kayak or SUP to the Noosa Everglades, Pumicestone Passage or Moreton Bay?
6. Which bike rack suits mountain biking at Mt Coot-tha, Daisy Hill or Nerang?
7. How do I mount a rooftop tent for camping trips to Girraween, Carnarvon Gorge or the Scenic Rim?
8. Which awnings cope best with Queensland's summer storms, heat and UV?
9. How much weight can I safely carry on my roof off-road compared with on the highway?
10. What roof rack setup works when I'm towing a caravan up the coast?
11. What ladder and tradie roof rack setups suit work utes around Brisbane?

**Sydney (draft)**
1. Will a roof box or roof rack fit in my apartment or shopping centre car park? *(Height clearance is a real Sydney problem.)*
2. What's the best way to carry skis and snowboards to Thredbo and Perisher?
3. How do I carry surfboards to the Northern Beaches, Cronulla or the South Coast?
4. What's the best way to carry a kayak or SUP to Pittwater, the Hawkesbury or Port Hacking?
5. Which bike rack suits mountain biking in the Blue Mountains, Old Joes or Manly Dam?
6. What roof rack setup suits beach driving at Stockton Beach?
7. How do I set up a roof rack for 4WD tracks in the Watagans, Barrington Tops or the Blue Mountains?
8. How do I mount a rooftop tent for weekends in the Blue Mountains or the Hunter?
9. What ladder and tradie roof rack setups suit work utes and vans in Sydney?
10. How much weight can I safely carry on my roof off-road compared with on the highway?
11. How do I keep my roof rack quiet at motorway speeds?

**Melbourne & Geelong (draft)**
1. What roof rack setup suits Victoria's High Country tracks around Dargo, Craig's Hut and the Bogong High Plains?
2. What's the best way to carry skis and snowboards to Mt Buller, Falls Creek and Mt Hotham?
3. How do I carry surfboards to Bells Beach, Torquay and the Great Ocean Road?
4. Which bike rack suits mountain biking at Forrest, the You Yangs, Lysterfield or Mt Buller?
5. What's the best way to carry a kayak or SUP on Port Phillip, the Gippsland Lakes or Lake Eildon?
6. How do I mount a rooftop tent for camping at Wilsons Prom, the Grampians or the High Country?
7. Which awnings and covers cope best with Victoria's cold, wet and windy weather?
8. How do I set up a roof rack for strong winds along the coast and on the Westgate?
9. How much weight can I safely carry on my roof off-road compared with on the highway?
10. What roof rack setup works when I'm towing a caravan or camper trailer?
11. What ladder and tradie roof rack setups suit work utes and vans in Melbourne?

**Adelaide (draft)**
1. What roof rack setup holds up on the Oodnadatta, Birdsville and Strzelecki tracks?
2. How do I protect my gear from bulldust on outback SA trips?
3. What roof rack setup suits a Flinders Ranges trip?
4. What's the best way to carry jerry cans and water on a roof rack for remote SA and Nullarbor travel?
5. How do I carry fishing rods and gear to the Yorke and Eyre Peninsulas?
6. What's the best way to carry a kayak or SUP to the Fleurieu Peninsula or Port Noarlunga?
7. Which bike rack suits mountain biking in the Adelaide Hills, Fox Creek or Eagle MTB Park?
8. How do I mount a rooftop tent for trips to Kangaroo Island, the Coorong or the Flinders?
9. Which awnings cope best with South Australia's heat and UV?
10. How much weight can I safely carry on my roof off-road compared with on the highway?
11. What roof rack setup works when I'm towing a caravan across the Nullarbor?

### 8.4 SEO

- The URLs, titles, meta descriptions and H1s stay the live ones.
- The `FAQPage` JSON-LD gets the local advice plus the 3 store questions.
- The `ItemList` of stores and the `BreadcrumbList` stay.
- The advice gives each city page unique, local content. Today the five pages share most of their copy.

### 8.5 Build order (once the plan is agreed)

1. Component Library: the Fitment Gallery per-photo details and the Nationwide bar; check every page each one is used on.
2. **Perth first**, using Marc's questions: the new layout, the answers, real WA Rackit fitments. Push it for review.
3. Once Perth is approved, Brisbane, Sydney, Melbourne and Adelaide: question lists signed off, then answers written, plus each city's Rackit fitments.
4. Update the Component Library's usedOn lists, PAGE-GLOSSARY and the Store Finder/store-page link notes (the links don't change).

### 8.6 Open

- **Who checks the answers:** each state's store manager, or Scott?
- **Marc's Rottnest question:** reword it (8.3, WA 4)?
- **The draft question lists for the other four cities:** Marc and Graham to approve or add to them.
- **The Rackit feed in production:** confirm with Marc that the city page can query fitments by store list.
