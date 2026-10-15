# Header & Mega Menu — Developer Brief

**For Marc.** The build sheet for **Rack Friday Phase 1** (2026-10-15): every element, where every link goes, and what changes it. (The older long-form brief was retired on 2026-10-15; it's in git history if needed.)

**Prototype:** `prototypes/header/index.html` (header + footer only). In **Site Admin**, keep **Build Phase = Phase 1**: everything you can see is in scope. Phase 2 features hide themselves.

---

## A1. Ground rules

1. **Staging first.** Everything goes to staging for us to QA before it goes live.
2. **Phase 1 only.** If Site Admin's Build Phase 1 doesn't show it, don't build it yet.
3. **The mega menu is a reskin.** Same Level 1 / 2 / 3 categories as the live site, nothing moved or renamed. We restructure after Christmas.
4. **No trust signals in the header.** The live header's review count above the logo, the "200,000+ fitted!" line, the USP row and the **Support** button are all dropped on purpose. Trust now sits in a thin bar at the top of the Home page and on the product pages (not part of this brief).
5. **Regions in Phase 1: AU and NZ.** The UK isn't in the region menu yet.
6. **No new Magento data in Phase 1.** The mega menu promo tiles are HTML blocks we fill in ourselves (A5). Everything else uses data the site already has.

---

## A2. Utility bar (top strip)

| Element | Shows | Link / action | Changes with |
|---|---|---|---|
| Nearest store | "Your Nearest Store: **North Lakes**" | `/locations?store=north-lakes`: the locations page with that store picked | **No store saved:** reads "**Find A Store**" → `/locations` |
| Vehicle | "Your Vehicle: **Toyota Hilux**" (mobile: just "Toyota Hilux") | Opens the **Fit Finder drawer** (A8) | **No vehicle:** "Select Your Vehicle" |
| Call Us | phone icon + "Call Us" | `tel:` link. AU `1300 071 264`, NZ `09 481 1910` | Region |
| Region | flag + "Australia" ▾ | Menu: Australia / New Zealand. Picking the other region opens **the same page on the other domain** (`.com.au` ↔ `.co.nz`), reusing the live site's "you're on the wrong region" logic | — |
| Account | Customer's **first name** | `/customer/account` | **Logged out:** "Log In" → `/customer/account/login` |

- **The saved store** is the one the shopper picks in the PDP's Click & Collect widget. The site already remembers it; it just needs connecting to the header. If `/locations` can't pre-select a store from the URL for launch, link to plain `/locations`.
- **Mobile:** the bar shows the store and vehicle only. Call Us moves into the header as a phone icon (A6).

---

## A3. Main header

| Element | Link / action | Notes |
|---|---|---|
| Logo | `/` | |
| **Products** | Opens the mega menu (A4), **on click**, not hover | Desktop only. On mobile the hamburger opens the menu (A6). |
| Store Finder | `/locations` | NZ (one store): reads "Visit Our Auckland Store" → that store |
| Fit My Vehicle | `/fit-my-vehicle` | The live page, unchanged. Its "View results" works exactly as it does today. |
| Clearance | `/overstock-clearance` | **AU only:** hidden in NZ, and the links after it shift left. **During a sale** the sale's button takes its place (see `docs/campaign/campaign-spec.md`). |
| **Services ▾** | Dropdown, A3.1 | New. Replaces the old "Fitting" link. |
| Search box | Typeahead, A7. Enter → search results | |
| Cart | Mini cart / `/checkout/cart` | Badge = item count |
| Phone icon (mobile only) | `tel:` the region's number | Left of the cart, in the main header and the sticky header. Hidden on desktop. |

### A3.1 Services dropdown

Desktop: opens on hover, or on click/tap (keyboard: Enter opens, Esc closes). Mobile: a "Services ›" row in the menu that opens its own screen with a back arrow.

| Item | Link |
|---|---|
| Fitting & Installation | `/roof-rack-installation-and-fitting-costs/` |
| Shipping & Delivery | `/delivery` |
| Price Guarantee | `/price-guarantee` |
| Support | `https://roofracksgalore.crisp.help/en/` (new tab) |
| Contact Us | `/contact-us` |

NZ: the same items, linking to the NZ site's equivalent pages. Marc, please flag any that don't exist on `.co.nz`.

---

## A4. Mega menu (desktop)

- **Click "Products"** to open; click it again, click outside or click the dark backdrop to close.
- **Level 1** (left column): the live site's categories, each with its icon; "Shop By Brand" last, in yellow.
- **Level 2:** hovering a Level 1 row shows its groupings as "Shop {name}" rows + "View All". **Level 3:** hovering a Level 2 row shows its links in 2 columns + "View All {name}".
- **Banner** (top of Level 1), never blank:

| Situation | Banner | Link |
|---|---|---|
| Sale running (AU/NZ) | That sale's banner | The sale page |
| No sale, **AU** | Overstock Clearance (the live `wysiwyg/navigation-website-trust-main-default/overstock-clearance.png`) | `/overstock-clearance` |
| No sale, **NZ** | Store Finder promo | `/locations` |

- **Promo tile** at the bottom of Level 2 and Level 3: see A5.

---

## A5. Promo tile: an HTML block we edit ourselves

A red (or brand-coloured) tile pinned to the bottom of a Level 2 or Level 3 column. **The whole tile is one link.** The product photo is a transparent PNG anchored bottom-left that pokes up above the tile. The heading and subheading are live text, never baked into the image.

**Phase 1 (build this):** each category gets **one HTML block** that we fill in ourselves in Magento admin, with no code change. Marc only has to:

1. Give every category somewhere to hold its block (e.g. a CMS block named `mega-promo-{category_id}`, or an HTML field on the category; Marc's choice, as long as we can edit it in admin).
2. Output that block at the bottom of the column: a **Level 1** category's block under its **Level 2** list, a **Level 2** grouping's block under its **Level 3** list. Level 3 never inherits Level 2's.
3. **Empty or missing block = no tile**, no placeholder.
4. Ship the tile's CSS (`.mega-menu-promo` in `prototypes/_shared/mega-menu.css`), including the reserved space so the photo doesn't cover the "View All" row.

What we'll paste into a block (change the link, colour, image, subheading and heading):

```html
<a class="mega-menu-promo" href="/rhino-rack-low-profile-roof-top-tent" style="background:#0a4c97">
  <span class="mega-menu-promo-img"><img src="/media/wysiwyg/menu/rhino-rtt.png" alt=""></span>
  <span class="mega-menu-promo-text">
    <span class="mega-menu-promo-eyebrow">Now In Stock</span>
    <strong>Rhino Rack Low Profile Roof Top Tent</strong>
  </span>
</a>
```

Leave out `style="background:…"` for the standard RRG red. Flat colour only, no background images (page weight).

**Phase 2 (not now):** the same tile becomes structured category fields (image, heading, subheading, link, colour) so Brenton can set every category's tile from one spreadsheet import before a sale.

---

## A6. Mobile menu (≤900px)

The hamburger opens a full-screen menu with its own logo, account, vehicle, close button and search box.

1. **Root screen:** the banner (same rules as A4), the categories, then Store Finder, Fit My Vehicle, Clearance (AU only; the sale link during a sale), **Services ›** and **Call Us** (the region's number on the right, `tel:` link).
2. Tap a category → its "Shop {name}" rows + View All + its promo tile. Tap a row → its links + View All + that row's promo tile.
3. Every inner screen has a back arrow and a close button. Close works from any depth.

**Header on mobile:** hamburger left, logo centred, then a **phone icon** and the cart on the right. Call Us is one of the most-used mobile header links on the live site (Clarity), so it stays one tap away; the menu's Call Us row is a backup. Keep the logo centred (it shrinks a little on small phones).

**Sticky header:** once the page scrolls past the search box, a slim bar (hamburger, logo, phone icon, cart) sticks to the top.

---

## A7. Search typeahead

**Empty box, focused:** recent searches (per shopper), popular searches, useful pages, suggested products. **Typing:** "Search for '{query}'", matching searches, brands and pages on the left, matching products on the right, View All Results. **Enter** → search results for the query. In production all of it comes from Algolia (query suggestions + product, page and brand indexes), not hand-kept lists.

---

## A8. Fit Finder drawer

Slides in from the right whenever "Your Vehicle / Select Your Vehicle" is clicked. Make → Model → Year → Body → Roof, then **Set My Vehicle** saves the session vehicle and closes the drawer; the header and every fitment message on the page update.

**Phase 1:** after setting the vehicle from the header, do what the live site does today. Sending the shopper to the new vehicle landing page (VLP) is **Phase 2**; the prototype already shows that, so ignore that part.

---

## A9. Not in Phase 1

- UK region (and its green/UK skin)
- Sending vehicle results to the VLP (A8)
- "Set as my store" on the locations page
- Restructuring the mega menu categories (after Christmas)
- Promo tile as structured category fields + spreadsheet import (A5; Phase 1 uses an HTML block)

## A10. Open questions

None right now.
