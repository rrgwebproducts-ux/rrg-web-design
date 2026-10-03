# Sale Website Takeover — spec

**Status:** built 2026-10-02 (Rack Friday as the worked example); Christmas Sale added 2026-10-04 as the second campaign. Awaiting review.

**Campaigns built:**

| Campaign | Colours | Assets | Copy / dates |
|---|---|---|---|
| **Rack Friday** (`rack-friday`) | Electric Lime `#D8FF1E` + black (light main colour, black text) | From Figma (favicon, tag, banner still WIP there); hero is the draft banner | Real: 1–29 Nov 2026, up to 50% off |
| **Christmas Sale** (`christmas`) | Festive green `#0E5A36` (white text) on the utility bar, buttons and cards; the strip and nav sale button in RRG red with a gold title; gold-on-black footer | **Drafts** made in the campaign style (2026-10-04), as there's no Figma creative yet, including a logo wearing a Santa hat. Replace them using the checklist (Section 4). | **Placeholder:** "Up to XX% off — gifts for every adventure", ends 24 Dec 2026 |
**Owner:** Brenton Cooley. **Branding source:** Figma "RRG Campaign Templates" › *Rack Friday & Cyber Monday Sale 2026* (node 2949-363).

## 1. What it is

When a big sale is on, the whole site takes on the campaign's colours, so that **no page can be reached without seeing that a sale is on**. It's a colour takeover, not a new layout or theme: the page structure stays exactly the same.

- **One control:** Site Admin → Promotions & design → **Sale takeover: Off / Rack Friday Sale / Christmas Sale**. There's one option per entry in `RRG_CAMPAIGNS`, added automatically.
  - Saved as `rrgSale` (the campaign id, or empty for off). It is **off by default**. The old `rrgSaleOn = true` setting from 2026-10-02 still reads as Rack Friday.
  - Changing it reloads the page, so every part of every page is redrawn in the new state.
- **AU and NZ only.** The UK (The Roof Box Company) never gets the takeover and keeps its own navy/green skin, even with the switch on.
- **For Magento:** a single scheduled campaign setting (which campaign, or none, by date). It adds `campaign-on` and `data-campaign="<id>"` to `<body>`. Marketing switches it by date with no deploy.

## 2. What changes (decisions agreed with Brenton, 2026-10-02)

Shown for Rack Friday (lime/black). Every campaign changes the same surfaces in its own colours; Christmas uses green with white text, an RRG-red strip and nav button, and a gold-on-black footer (Section 3, colour roles).

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

Every item the takeover touches, what a new sale needs to supply for it, and where that lives. **Settings** are keys in the campaign's entry in `RRG_CAMPAIGNS` (`prototypes/_shared/campaign.js`). Everything marked **Automatic** follows the settings and colours, with no work per sale.

| # | Item | Per sale, supply… | Where it's set | Current (Rack Friday) |
|---|---|---|---|---|
| 1 | **Which sale is running** | Nothing. Pick the campaign when the sale starts and set it back to Off when it ends. In Magento this would be a scheduled start/end date. | Site Admin → *Sale takeover*. The dropdown lists every campaign by its `title`. | Off by default |
| 2 | **Campaign colours** | 6 colour roles (see the table below): main colour, its hover shade and its text colour, a dark surface colour, and a highlight colour and its text colour | `campaign.css` → one `body[data-campaign="<id>"]{…}` line | Rack Friday: lime / lime / black · Christmas: green / gold / black |
| 3 | **Campaign id** | A short lowercase id with no spaces | `id` (and the entry's key in `RRG_CAMPAIGNS`). It must match the colour line (2), the hero slide (11) and the asset file names. | `rack-friday`, `christmas` |
| 4 | **Favicon** | Square icon, readable at 16×16 and 32×32 | `favicon` → `_shared/campaign/<id>-favicon.ico`, containing 16, 32 and 48px sizes | Lime "SALE" burst · gold "SALE" burst |
| 5 | **Campaign strip: title** | Campaign name as it should read in the strip | `title` (also the Site Admin dropdown option, the mega-menu banner and tag alt text, and the nav button's screen-reader label) | "Rack Friday Sale" · "Christmas Sale" |
| 6 | **Campaign strip: offer + terms** | One short offer line, plus a short terms line (the terms are hidden below 1100px) | `offer`, `terms` | "Up to 50% off racks, platforms & more" · "Up to XX% off — gifts for every adventure" (both "In-store + online") |
| 7 | **Countdown** | Sale end date and time **with timezone** | `ends` (e.g. `2026-11-29T23:59:59+10:00`). The countdown hides itself once that time has passed. | 29 Nov · 24 Dec 2026, 11:59pm Brisbane |
| 8 | **Sale landing link** | URL of the sale page | `href`. Used by the strip, nav button and mega-menu banner. | `#` (no sale page yet) |
| 9 | **Header nav button + mobile menu row** (replace "Clearance" while the sale is on) | **Short** label, about the width of the word "Clearance" (e.g. the sale name, or just "Sale"). Longer labels can push the search box onto a second row. | `navLabel` | "Rack Friday" · "Xmas Sale" |
| 10 | **Mega-menu banner** | Banner image, **828×184** (2× the slot). Text kept away from the left and right edges. | `megaMenuBanner` → `_shared/campaign/<id>-mega-menu.webp` | `rack-friday-mega-menu.webp` · `christmas-mega-menu.webp` |
| 11 | **Home hero slide** | Flat finished banner, **2464×828**, all text baked into the image. Letterboxed in the slide colour on narrower screens. | `home/index.html`: one slide per campaign at the top of the hero. Each carries `data-campaign-slide="<id>"`, `style="--slide-fill:<edge colour>"` and the image, alt text and link. Only the running campaign's slide is kept. Make the image's left and right edges the fill colour, so it letterboxes without a seam. | `home-hero/rack-friday-desktop.webp` · `home-hero/christmas-desktop.webp` |
| 12 | **Sale tag** (product pages + every discounted product card) | Tag graphic on a **transparent background**, about **380px wide** (it shows at 52–86px wide). It needs to read on white product photos. | `saleTag` → `_shared/campaign/<id>-tag.webp` | "Rack Friday" tag · "Xmas Sale" tag |
| 13 | **Cart / checkout / mini-cart savings line** | Nothing | **Automatic:** reads "`<name>` savings" | "Rack Friday savings" · "Christmas savings" |
| 14 | **Utility bar** | Nothing | **Automatic** (main colour + its text colour) | Lime / black text · green / white text |
| 15 | **Add to Cart + primary buttons** | Nothing | **Automatic** (main colour + its text colour, hover shade) | Lime / black · green / white |
| 16 | **"Save X%" band on cards and product photos** | Nothing | **Automatic** (main colour + its text colour) | Lime / black · green / white |
| 17 | **Footer** | Nothing | **Automatic** (dark surface + highlight stripe and headings) | Black + lime · black + gold |
| 18 | **Strip / nav button / countdown styling** | Nothing | **Automatic** (highlight on the dark surface) | Lime on black · gold on black |
| 19 | **Sale name used in copy** | Short sale name | `name` (savings line) | "Rack Friday" · "Christmas" |
| 20 | **Campaign logo** *(optional)* | The normal logo with a seasonal touch (Christmas: a Santa hat on the "G"), as a transparent PNG at **2× (720px wide)**. It's **the same width as the normal logo**, with any extra height only **above** the wordmark. | `logo` → `_shared/campaign/<id>-logo.png`, plus `logoOverflow`: the extra height above the wordmark ÷ the wordmark's height (e.g. `14 / 58`). Shows in the header, sticky mobile header and mobile menu; never the footer or checkout. Leave it out to keep the normal logo. | — · Santa-hat logo (draft) |

**The 6 colour roles** (item 2), set as one line in `campaign.css`:

| Role | Used for | Rack Friday | Christmas |
|---|---|---|---|
| `--campaign-accent` | Main colour: utility bar, Add to Cart, Save band, savings line | `#D8FF1E` lime | `#0E5A36` green |
| `--campaign-accent-hover` | Button hover, a shade darker | `#C2EB00` | `#0A4428` |
| `--campaign-on-accent` | Text on the main colour: black on a light colour, white on a dark one | `#000` | `#fff` |
| `--campaign-dark` | Dark surfaces: campaign strip, nav sale button, footer | `#000` | `#000` |
| `--campaign-highlight` | Marks on the dark surfaces: strip title and CTA, countdown, nav button text, footer stripe and headings | `#D8FF1E` lime | `#F2C14E` gold |
| `--campaign-on-highlight` | Text on the highlight (the countdown boxes) | `#000` | `#000` |
| *Optional:* `--campaign-strip` | Campaign strip + nav sale button background. Leave it out to use `--campaign-dark`. | *(black)* | `var(--rrg-red)` RRG red |
| *Optional:* `--campaign-strip-title` | Strip title. Leave it out to use `--campaign-highlight`. | *(lime)* | `#F2C14E` gold |
| *Optional:* `--campaign-strip-link` | Strip "Shop the sale" + nav button text. Leave it out to use `--campaign-highlight`. | *(lime)* | `#fff` |
| *Optional:* `--campaign-strip-muted` | Strip terms + "Ends in" label. Leave it out to use the site's muted grey. | *(grey)* | `#F8D9DE` pale pink |

**Never changes per sale:** the UK never gets a takeover, checkout never shows the strip, and tags only ever go on products that are actually discounted.

## 4. Running the next sale: checklist

1. **Brief the designer** for the assets in items 4, 10, 11 and 12 (and 20 if the sale gets a logo touch), at the sizes above. The Figma file *RRG Campaign Templates* has a page per campaign; Rack Friday's is node 2949-363, and its frames are the reference for what each asset looks like.
2. **Pick the 6 colours** (item 2). A light main colour (lime, cyan, yellow) takes black text; a dark one (green, navy) takes white. The highlight needs to stand out on the dark surface.
3. **Export the assets:**
   - Into `prototypes/_shared/campaign/`: `<id>-favicon.ico`, `<id>-tag.webp`, `<id>-mega-menu.webp` and, optionally, `<id>-logo.png`.
   - The hero: `prototypes/_shared/home-hero/<id>-desktop.webp`.
4. **Add an entry to `RRG_CAMPAIGNS`** in `campaign.js` (copy an existing one).
   - Fill in `id`, `name`, `title`, `navLabel`, `offer`, `terms`, `ends`, `href` and the three image paths (plus `logo` + `logoOverflow` if there's a campaign logo).
   - It appears in the Site Admin dropdown automatically.
5. **Add the colour line** in `campaign.css`: `body[data-campaign="<id>"]{…}` with all 6 roles (copy an existing line).
6. **Add a home hero slide** (item 11) at the top of the hero, next to the other campaign slides. It needs the image, alt text, link, `--slide-fill` and `data-campaign-slide="<id>"`.
   - Past campaigns can stay in place, since they never show unless picked. Remove them and their assets once they won't run again.
7. **Check it:**
   - Site Admin → *Sale takeover* → the new campaign.
   - Add a preset and variants for the new campaign to the Component Library (`prototypes/components/registry.js`; copy the Christmas ones, `S.xmas`), and check them.
   - Click through Home, a PLP, a product page, the cart and checkout at desktop and phone width.
   - Make sure the header stays on one row between about 1150px and 1300px wide, and (with a campaign logo) that the logo doesn't move the wordmark or make the header taller.
   - Switch the region to UK: there should be no takeover.
8. **On the day:** pick the campaign. **After the sale:** set it back to Off. Clearance returns to the nav, the Store Finder banner returns to the mega menu, the campaign slide disappears and tags disappear from product pages.

**Ready-made in Figma for Cyber Monday** (Electric Cyan `#00E5FF` + black): cyan "SALE" favicon burst, Cyber Monday tag, "Cyber Monday Sale On Now" banner and hero art. Items 4, 10 and 12 are still marked WIP there.

## 5. Build

| File | What |
|---|---|
| `prototypes/_shared/campaign.js` | `RRG_CAMPAIGNS` (one entry per sale, below) and `RRG_CAMPAIGN` (the running one, or null), `rrgSaleId()` / `rrgSaleOn()` / `rrgCampaignActive()` / `rrgSetSale(id)`, strip + nav-link HTML, countdown, favicon/tag swap, hero-slide pruning, `rrgSavingsLabel()`. Loaded on every page after `session-state.js`, before `widgets.js`. |
| `prototypes/_shared/campaign.css` | The whole skin, scoped to `body.campaign-on`, plus one colour line per campaign (`body[data-campaign="…"]`). Loaded after `footer.css`. |
| `prototypes/_shared/campaign/` | Campaign assets: `<id>-favicon.ico`, `<id>-tag.webp` and `<id>-mega-menu.webp` for each campaign |
| `admin-panel.js` | The *Sale takeover* dropdown, built from `RRG_CAMPAIGNS` |
| `widgets.js` | Header widget draws the strip (before `.rrg-header-shell`) and the nav link |
| `mega-menu.js` | Banner follows `rrgCampaignActive()` (replaces the old "Clearance sale banner" toggle) |
| `shared.js` | `applyRegionBrand()` re-applies the campaign on every region change (UK switches it off) |
| `home/index.html` | One slide per campaign, marked `data-campaign-slide="<id>"` |

**Per-campaign config** is everything that changes from one sale to the next, one entry per sale:

```js
const RRG_CAMPAIGNS = {
  'rack-friday': { id: 'rack-friday', name: 'Rack Friday', title: 'Rack Friday Sale', navLabel: 'Rack Friday',
    offer: 'Up to 50% off racks, platforms & more', terms: 'In-store + online',
    ends: '2026-11-29T23:59:59+10:00',   // countdown target, Brisbane time
    href: '#', favicon: '…', saleTag: '…', megaMenuBanner: '…' },
  'christmas': { … },
};
```

Each campaign's colours are one `body[data-campaign="<id>"]` line in `campaign.css` (the 6 roles, Section 3).

Step-by-step for a new sale: Section 4.

## 6. Component Library

- **New entry:** *Sale Campaign Strip + Countdown*.
- **Rack Friday and Christmas variants on:** Campaign Strip, Utility Bar, Main Header & Nav, Mega Menu (replaces the old banner on/off pair), Footer, Price Block, Add to Cart, Product Card, Home Hero, Cart Summary.
- **Registry presets:** `S.sale` (`rrgSale: 'rack-friday'`) and `S.xmas` (`rrgSale: 'christmas'`), replacing the old `S.saleOff`.

## 7. Open / next

1. **Red brand bits:** keep them, or let lime/black take over some of them? (Section 2)
2. **Final Figma assets:** the favicon, toolbar button and sale tags are still marked WIP in Figma. The current exports get swapped for the finals when they're signed off.
3. **Hero creative:** it still reads "XX% OFF", a placeholder in the artwork itself.
4. **Countdown pre-sale state:** the strip currently always counts down to the end. It could say "Starts in…" before 1 Nov.
5. **PLP / search merch tile:** could carry a campaign creative, but needs a tile-sized asset.
6. **Cyber Monday:** another campaign entry (30 Nov), if wanted as its own one-day skin.
7. **Developer brief:** add a Sale Takeover section at final handover. Screenshots are held until then, per the standing rule.
8. **Christmas finals:** designer creative for the tag, mega-menu banner, hero, favicon and Santa-hat logo (the current ones are drafts), plus the real offer line, percentage and dates. The logo is a change to the brand mark, so it needs brand sign-off.
