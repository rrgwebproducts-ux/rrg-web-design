# Store Finder — Engineering Spec

Project: the all-stores page, replacing the live `/locations` store locator. Companion to `docs/store/store-spec.md` (the individual store pages it links to). Same conventions: plain HTML/CSS/JS prototype, Playwright verification before sign-off, push only once approved.

Planning session: 2026-09-30. Decisions in Section 7 were answered by Brenton the same day.

---

## 0. Goal & scope

Let a shopper find their nearest store, see whether it's open, and get to it: directions, phone, or its store page. The live locator is a Google map, a postcode box and a state dropdown. Picking a state lists small cards that **don't link to the store pages**.

**In scope:** `prototypes/store-finder/`, links into it from across the site, and the shared open-now helpers it shares with the store page.

**Out of scope:** real postcode geocoding (backend), service filters (Section 7), per-store hours for stores without a record.

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Header / breadcrumbs | Global; Home › Store Finder | |
| 1.2 | **Search band** | New `.sf-search` | H1 "Find a Roof Racks Galore Store", the store count (region cascade), a postcode box + **Find Stores** (the one gold action) + **Use My Location** (outline). A status line reports the search ("Stores nearest 4000 (Queensland) · Clear") or an error. |
| 1.3 | **State tabs** | New `.sf-tab` | All stores · QLD · NSW · ACT · VIC · TAS · SA · WA, each with its count. Hidden while a search is sorting everything by distance. `?state=QLD` opens on a state (a store page's state breadcrumb links here). |
| 1.4 | **List + map** | New `.sf-layout` + the shared `#showroomMap` | List on the left, grouped by state when browsing and sorted nearest-first after a search. The map on the right stays in view while the list scrolls. **Clicking a card** zooms the map to its pin and opens it; **clicking a pin** highlights its card and scrolls it into view. Pin popups have "View store ›". Mobile: a List / Map toggle. |
| 1.5 | **Store card** | New `.sf-card` | Name (links to the store page), distance ("Nearest store" on the first result), open now / closed (the store's own time zone), address, today's hours, phone, **View Store**, Directions, **Make this my store** / "✓ Your store". |
| 1.6 | Trust banner, brands, footer | As the other pages | |

---

## 2. Search (decision 2)

- **Postcode — state-level in the prototype.** Any postcode resolves to its state (`postcodeToState()`), and that state's **anchor store** becomes the nearest; every other store then sorts by distance from it: QLD → North Lakes, NSW → Moorebank, ACT → Canberra, VIC → Preston, TAS → Hobart, SA → Adelaide City, WA → Osborne Park. NT has no store, so it shows Adelaide City first with "We don't have a store in the Northern Territory yet". Anything that isn't a 4-digit postcode gets "Enter a 4-digit Australian postcode." **Production** geocodes the postcode (or suburb) for real distances.
- **Use My Location** uses the browser's real position, so distances are real even in the prototype.
- `?postcode=4509` runs a search on load (for links from elsewhere, for example a postcode box on another page).

---

## 3. Regions

NZ and UK show their single store (Auckland / Bolton) with no search or tabs, the same as the rest of the site's region cascade. Switching region resets any search. `rrg-region-change` is a new event fired at the end of `applyRegion()`.

**UK and NZ keep a Store Finder** (2026-09-30 design review, spec.md §16 item 12, replacing "single store only"). Graham expects two more UK stores by December, so the rollout is future-proofed:
- Under the open store, an **"Opening soon"** group of non-clickable cards: name, city, an "Opening soon" chip and "We'll share the address and opening date here once it's confirmed". No store page, no map pin, no phone.
- **Demo placeholders only, none confirmed:** UK Leeds and Birmingham; NZ West (or South) Auckland and Christchurch (possibly a joint store with Dodges). They live in `REGION_COMING_SOON` (shared.js).
- Site Admin → Design options → **Show "opening soon" stores** turns them off, so the finder can be demoed with and without them.
- **Production rule:** list a store here only once its site is signed and the opening month is known. Give it a full card, page and pin once it opens. Google Business Profile allows a pre-opening listing up to a year ahead.
- **Header label** (§16 item 13): the nav's store link follows the open-store count. With 1 store it reads **"Visit Our Bolton Store"** / **"Visit Our Auckland Store"** and goes straight to that store (the Store Finder in the prototype, which has no NZ/UK store page); with 2 or more it reads **"Store Finder"**. It flips automatically when the second store opens. `rrgStoreNavLink()` in shared.js covers the desktop nav and the mobile menu.
- Fixed at the same time: the UK/NZ map was fitted to Australia on load (`sfFitMap()` checked the region before it was applied).
- Still open: the H1 reads "Find a Roof Racks Galore Store" in the UK (should use The Roof Box Company).

---

## 4. Links into the Store Finder

- Header nav **Store Finder** (desktop and the mobile menu).
- Header **Find A Store** (shown when no store is saved).
- Footer **Click here to find your closest store**.
- Store page breadcrumbs: **Store Finder** and the **state** (`?state=`).
- The Store slide-out's new **Open the Store Finder map ›** link.

The nav/footer links are matched by text in `shared.js` (like the "Fit My Vehicle" nav link), so no template needs a markup change.

### Store page links (decision 1)

Every AU store links to a store page. The prototype has 11 built. **Every other store links to North Lakes' page as a placeholder** (Brenton: building every live store page would be overkill). This applies site-wide (`rrgStorePageHref()`): the finder's cards and pins, store rows, the header. On a store page, a nearby card whose placeholder would point back at that same page shows Directions instead.

---

## 5. Shared code

The open-now logic moved from the store page into `shared.js` so both pages use one copy: `RRG_STANDARD_HOURS`, `RRG_DAYS`, `RRG_STATE_TZ`, `RRG_STATE_ABBR`, `rrgStoreOpenStatus()`, `rrgStoreNow()` (with `?now=sat-10:00` for review), `rrgFmtTime()`, `rrgKmBetween()`. Map pins now carry their store name and fire `rrg-store-pin` when clicked.

**Hours:** stores without their own record use the standard hours shown on every live store page checked (Mon–Fri 8:30–5, Sat 8:30–12:30, Sun closed). Confirm per store in production.

---

## 6. SEO

Indexed, keeping the live `<title>` ("Store Locations, Expert Fitters & Click & Collect | Roof Racks Galore"). JSON-LD `ItemList` of every store as an `AutoPartsStore` with its production page URL, address, phone and position. With the linked cards, that gives Google a proper path to every store page.

---

## 7. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 1 | Build the other 19 live store pages so every card links? | **No, overkill.** Unbuilt stores link to North Lakes as a placeholder. |
| 2 | Postcode search | **State-level.** A postcode in a state makes that state's anchor store the nearest (QLD → North Lakes, NSW → Moorebank, …). |
| 3 | Service filters | **Leave out.** All stores offer everything. |

---

## 8. Build list — built 2026-09-30

All built and Playwright-verified: 1440 + 390px, browse / state tabs / `?state=`, postcode search (QLD, NSW, invalid), card ↔ pin highlighting with the "View store" popup, mobile List / Map toggle, UK single store and back to AU, links in from the nav, footer and Store slide-out, no horizontal overflow, zero console errors. Not pushed.

Later: `STORE-FINDER-DEVELOPER-BRIEF.md` (text only).
