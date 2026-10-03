# Sale Website Takeover — spec

**Status:** built 2026-10-02 (Rack Friday as the worked example), awaiting review.
**Owner:** Brenton Cooley. **Branding source:** Figma "RRG Campaign Templates" › *Rack Friday & Cyber Monday Sale 2026* (node 2949-363).

## 1. What it is

When a big sale is on, the whole site takes on the campaign's colours, so that **no page can be reached without seeing that a sale is on**. It's a colour takeover, not a new layout or theme: the page structure stays exactly the same.

- **One switch:** Site Admin → Promotions & design → **Sale on (<campaign name>)**.
  - Saved as `rrgSaleOn`. It is **off by default**.
  - Flipping it reloads the page, so every part of every page is redrawn in the new state.
- **AU and NZ only.** The UK (The Roof Box Company) never gets the takeover and keeps its own navy/green skin, even with the switch on.
- **For Magento:** a single scheduled campaign setting (on/off + which campaign). It adds `campaign-on` and `data-campaign="<id>"` to `<body>`. Marketing switches it by date with no deploy.

## 2. What changes (decisions agreed with Brenton, 2026-10-02)

| Surface | No sale | Sale on |
|---|---|---|
| **Favicon** | RRG favicon | Lime 12-point "SALE" burst (Figma › FAV ICONS WIP) |
| **Campaign strip** (new) | — | Black bar above the header on every page except checkout. Shows the campaign title (italic, lime), the offer and terms, a **live countdown** to the end of the sale, and "Shop the sale →". The whole strip is a link. It scrolls away and is never sticky. On mobile it's just the title + countdown. |
| **Utility bar** | Red, white text | **Lime, black text** |
| **Main nav** | "Clearance" | **The sale replaces Clearance** in the same slot, because a sale takes priority over clearance (Brenton, 2026-10-02). The button uses the Figma toolbar-button style (lime italic on black) and a short label (`navLabel`: "Rack Friday", or just "Sale"). It's sized so the nav stays as wide as with Clearance, and the search box never drops to a second row: the header is a single row at the same widths with the sale on or off. |
| **Mega-menu banner** | Store Finder promo (fallback) | The campaign banner (Figma node 3072-3886) |
| **Add to Cart / primary buttons** (`.btn-cta`) | Gold | **Lime, black text** |
| **PDP sale tag** | **None.** With no sale event there's no seasonal tag, just the Save band on the photo. | The campaign tag (Figma node 3075-641), beside the price on desktop and over the photo on mobile. It only shows when the product is actually discounted. |
| **Product cards** (every card type, every page) | Red "SAVE X%" corner band | The Save band turns lime, and the campaign tag sits in the photo's top-right. **Discounted products only:** a full-price card never gets a tag. |
| **Home hero** | 4 evergreen slides | The campaign slide (Rack Friday banner) goes first |
| **Cart / checkout / mini-cart savings line** | "You're saving" in green | "Rack Friday savings", highlighted lime |
| **Footer** | Charcoal | Black, with a 6px lime top stripe and lime headings |
| **Checkout** | — | Favicon, lime buttons and the savings line only. No strip, because checkout stays distraction-free. |

**Stays red on purpose (to be reviewed):** text links, outline-red secondary buttons, sale prices, tab underlines, the mega menu's red column heads, the search button, the cart badge and the logo's "G". Brenton wants to see the takeover as built before deciding whether any of these change.

**Why lime can't be a single token swap** (unlike the UK skin's navy): lime text on white is unreadable, and `--rrg-red` is used for text all over the site. Lime is therefore only ever used as a background (with black text) or as a mark on black, and `campaign.css` overrides each surface one by one. `--rrg-cta` is not overridden either, because it also colours review stars and badges.

## 3. Takeover items: what changes for each sale

Every item the takeover touches, what a new sale needs to supply for it, and where that lives. **Settings** are keys in `RRG_CAMPAIGN` (`prototypes/_shared/campaign.js`). Everything marked **Automatic** follows the settings and colours, with no work per sale.

| # | Item | Per sale, supply… | Where it's set | Current (Rack Friday) |
|---|---|---|---|---|
| 1 | **On/off switch** | Nothing. Turn it on when the sale starts and off when it ends. In Magento this would be a scheduled start/end date. | Site Admin → *Sale on (…)*. The label shows the campaign's `name`. | Off by default |
| 2 | **Campaign colours** | 1 accent colour (a background with black text on top), a slightly darker hover shade of it, and the "ink" colour (normally black) | `campaign.css` → one `body[data-campaign="<id>"]{…}` line | `#D8FF1E` / `#C2EB00` / `#000` |
| 3 | **Campaign id** | A short lowercase id with no spaces | `id`. It must match the colour line (2) and the hero slide (11). | `rack-friday` |
| 4 | **Favicon** | Square icon, readable at 16×16 and 32×32 | `favicon` → `.ico` containing 16, 32 and 48px sizes, in `_shared/campaign/` | Lime "SALE" burst (`favicon-sale.ico`) |
| 5 | **Campaign strip: title** | Campaign name as it should read in the strip | `title` (also used for the mega-menu banner and tag alt text, and the nav button's screen-reader label) | "Rack Friday Sale" |
| 6 | **Campaign strip: offer + terms** | One short offer line, plus a short terms line (the terms are hidden below 1100px) | `offer`, `terms` | "Up to 50% off racks, platforms & more" · "In-store + online" |
| 7 | **Countdown** | Sale end date and time **with timezone** | `ends` (e.g. `2026-11-29T23:59:59+10:00`). The countdown hides itself once that time has passed. | 29 Nov 2026, 11:59pm Brisbane |
| 8 | **Sale landing link** | URL of the sale page | `href`. Used by the strip, nav button and mega-menu banner. | `#` (no sale page yet) |
| 9 | **Header nav button** (replaces "Clearance" while the sale is on) | **Short** label, about the width of the word "Clearance" (e.g. the sale name, or just "Sale"). Longer labels can push the search box onto a second row. | `navLabel` | "Rack Friday" |
| 10 | **Mega-menu banner** | Banner image, **828×184** (2× the slot). Text kept away from the left and right edges. | `megaMenuBanner` → `_shared/campaign/<id>-mega-menu.webp` | `rack-friday-mega-menu.webp` |
| 11 | **Home hero slide** | Flat finished banner, **2464×828**, all text baked into the image. Letterboxed in the slide colour on narrower screens. | `home/index.html`: the first slide carries `data-campaign-slide="<id>"`, `style="--slide-fill:<bg colour>"` and the image/alt/link. It only shows while that campaign is on. | `home-hero/rack-friday-desktop.webp` |
| 12 | **Sale tag** (product pages + every discounted product card) | Tag graphic on a **transparent background**, about **380px wide** (it shows at 52–86px wide). It needs to read on white product photos. | `saleTag` → `_shared/campaign/<id>-tag.webp` | "Rack Friday" tag (`rack-friday-tag.webp`) |
| 13 | **Cart / checkout / mini-cart savings line** | Nothing | **Automatic:** reads "`<name>` savings" | "Rack Friday savings" |
| 14 | **Utility bar** | Nothing | **Automatic** (accent colour) | Lime, black text |
| 15 | **Add to Cart + primary buttons** | Nothing | **Automatic** (accent colour) | Lime, black text |
| 16 | **"Save X%" band on cards and product photos** | Nothing | **Automatic** (accent colour) | Lime, black text |
| 17 | **Footer** | Nothing | **Automatic** (ink colour + accent stripe and headings) | Black, lime stripe + headings |
| 18 | **Strip / nav button / countdown styling** | Nothing | **Automatic** (accent on ink) | Lime on black |
| 19 | **Sale name used in copy** | Short sale name | `name` (savings line, admin label) | "Rack Friday" |

**Never changes per sale:** the UK never gets a takeover, checkout never shows the strip, and tags only ever go on products that are actually discounted.

## 4. Running the next sale: checklist

1. **Brief the designer** for the assets in items 4, 10, 11 and 12, at the sizes above. The Figma file *RRG Campaign Templates* has a page per campaign; Rack Friday's is node 2949-363, and its frames are the reference for what each asset looks like.
2. **Pick the colours** (item 2). If the accent is light (lime, cyan, yellow), black text goes on it. A dark accent would need white "ink" text instead, so check the strip, buttons and footer still read.
3. **Export the assets** into `prototypes/_shared/campaign/` as `<id>-tag.webp`, `<id>-mega-menu.webp` and the favicon `.ico`, and the hero into `prototypes/_shared/home-hero/`.
4. **Update `RRG_CAMPAIGN`** in `campaign.js`: `id`, `name`, `title`, `navLabel`, `offer`, `terms`, `ends`, `href` and the three image paths.
5. **Add the colour line** in `campaign.css`: `body[data-campaign="<id>"]{--campaign-accent:…;--campaign-accent-hover:…;--campaign-ink:…;}`. Leave the old campaign's line in, since it does no harm.
6. **Swap the home hero's first slide** (item 11): image, alt text, link, `--slide-fill` and `data-campaign-slide="<id>"`.
7. **Check it:**
   - Site Admin → *Sale on*.
   - Look at the Component Library's "Sale on" variants (`prototypes/components/`).
   - Click through Home, a PLP, a product page, the cart and checkout at desktop and phone width.
   - Make sure the header stays on one row between about 1150px and 1300px wide.
   - Switch the region to UK: there should be no takeover.
8. **On the day:** switch it on. **After the sale:** switch it off. Clearance returns to the nav, the Store Finder banner returns to the mega menu, the campaign slide disappears and tags disappear from product pages.

**Ready-made in Figma for Cyber Monday** (Electric Cyan `#00E5FF` + black): cyan "SALE" favicon burst, Cyber Monday tag, "Cyber Monday Sale On Now" banner and hero art. Items 4, 10 and 12 are still marked WIP there.

## 5. Build

| File | What |
|---|---|
| `prototypes/_shared/campaign.js` | `RRG_CAMPAIGN` config (below), `rrgSaleOn()` / `rrgCampaignActive()` / `rrgSetSaleOn()`, strip + nav-link HTML, countdown, favicon/tag swap, hero-slide pruning, `rrgSavingsLabel()`. Loaded on every page after `session-state.js`, before `widgets.js`. |
| `prototypes/_shared/campaign.css` | The whole skin, scoped to `body.campaign-on` and `body[data-campaign="…"]`. Loaded after `footer.css`. |
| `prototypes/_shared/campaign/` | Campaign assets: `favicon-sale.ico`, `rack-friday-tag.webp`, `rack-friday-mega-menu.webp` |
| `widgets.js` | Header widget draws the strip (before `.rrg-header-shell`) and the nav link |
| `mega-menu.js` | Banner follows `rrgCampaignActive()` (replaces the old "Clearance sale banner" toggle) |
| `shared.js` | `applyRegionBrand()` re-applies the campaign on every region change (UK switches it off) |
| `home/index.html` | Rack Friday slide marked `data-campaign-slide="rack-friday"` |

**Per-campaign config** is everything that changes from one sale to the next:

```js
const RRG_CAMPAIGN = {
  id: 'rack-friday', name: 'Rack Friday', title: 'Rack Friday Sale', navLabel: 'Rack Friday',
  offer: 'Up to 50% off racks, platforms & more', terms: 'In-store + online',
  ends: '2026-11-29T23:59:59+10:00',   // countdown target, Brisbane time
  href: '#', favicon: '…', saleTag: '…', megaMenuBanner: '…',
};
```

The colours go in a `body[data-campaign="<id>"]` block in `campaign.css`: `--campaign-accent`, `--campaign-accent-hover` and `--campaign-ink`.

Step-by-step for a new sale: Section 4.

## 6. Component Library

- **New entry:** *Sale Campaign Strip + Countdown*.
- **"Sale on" variants added to:** Utility Bar, Main Header & Nav, Mega Menu (replaces the old banner on/off pair), Footer, Price Block, Add to Cart, Product Card, Home Hero, Cart Summary.
- **Registry change:** the `S.saleOff` preset is replaced by `S.sale` (`rrgSaleOn: 'true'`).

## 7. Open / next

1. **Red brand bits:** keep them, or let lime/black take over some of them? (Section 2)
2. **Final Figma assets:** the favicon, toolbar button and sale tags are still marked WIP in Figma. The current exports get swapped for the finals when they're signed off.
3. **Hero creative:** it still reads "XX% OFF", a placeholder in the artwork itself.
4. **Countdown pre-sale state:** the strip currently always counts down to the end. It could say "Starts in…" before 1 Nov.
5. **PLP / search merch tile:** could carry a campaign creative, but needs a tile-sized asset.
6. **Cyber Monday:** a second campaign config (30 Nov), if wanted as its own one-day skin.
7. **Developer brief:** add a Sale Takeover section at final handover. Screenshots are held until then, per the standing rule.
