# Sale Website Takeover — spec

**Status:** built 2026-10-02 (Rack Friday as the worked example), awaiting review.
**Owner:** Brenton Cooley. **Branding source:** Figma "RRG Campaign Templates" › *Rack Friday & Cyber Monday Sale 2026* (node 2949-363).

## 1. What it is

When a big sale is on, the whole site takes on the campaign's colours, so that **no page can be reached without seeing that a sale is on**. It's a colour takeover, not a new layout or theme: the page structure stays exactly the same.

- **One switch:** Site Admin → Promotions & design → **Sale on (Rack Friday)**.
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

## 3. Build

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
  id: 'rack-friday', name: 'Rack Friday', title: 'Rack Friday Sale',
  offer: 'Up to 50% off racks, platforms & more', terms: 'In-store + online',
  ends: '2026-11-29T23:59:59+10:00',   // countdown target, Brisbane time
  href: '#', favicon: '…', saleTag: '…', megaMenuBanner: '…',
};
```

The colours go in a `body[data-campaign="<id>"]` block in `campaign.css`: `--campaign-accent`, `--campaign-accent-hover` and `--campaign-ink`.

**Adding the next campaign** (e.g. Cyber Monday, Electric Cyan `#00E5FF` per the Figma Colours frame) takes three steps:
1. Swap the config.
2. Add its colour block.
3. Drop its tag, banner and favicon in `_shared/campaign/` (the Figma has the cyan "SALE" burst, Cyber Monday tag and banner ready).

## 4. Component Library

- **New entry:** *Sale Campaign Strip + Countdown*.
- **"Sale on" variants added to:** Utility Bar, Main Header & Nav, Mega Menu (replaces the old banner on/off pair), Footer, Price Block, Add to Cart, Product Card, Home Hero, Cart Summary.
- **Registry change:** the `S.saleOff` preset is replaced by `S.sale` (`rrgSaleOn: 'true'`).

## 5. Open / next

1. **Red brand bits:** keep them, or let lime/black take over some of them? (Section 2)
2. **Final Figma assets:** the favicon, toolbar button and sale tags are still marked WIP in Figma. The current exports get swapped for the finals when they're signed off.
3. **Hero creative:** it still reads "XX% OFF", a placeholder in the artwork itself.
4. **Countdown pre-sale state:** the strip currently always counts down to the end. It could say "Starts in…" before 1 Nov.
5. **PLP / search merch tile:** could carry a campaign creative, but needs a tile-sized asset.
6. **Cyber Monday:** a second campaign config (30 Nov), if wanted as its own one-day skin.
7. **Developer brief:** add a Sale Takeover section at final handover. Screenshots are held until then, per the standing rule.
