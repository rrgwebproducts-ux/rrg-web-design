# Installation page: going live in the Magento CMS

Replaces the content of the live page **https://www.roofracksgalore.com.au/roof-rack-installation-and-fitting-costs**.

- **The file to paste:** [installation-cms.html](installation-cms.html). It is the whole page body in one file: styles, content, structured data and one small script.
- **Where it comes from:** it is built from `prototypes/installation/index.html`. Tested 2026-10-26 inside a saved copy of the live page with the live marcwatts theme CSS. Every element's computed style matched the prototype at 1440px. Nothing overflowed at 390px.

---

## 1. Steps

1. **Upload the 3 images** in Section 3 to `pub/media/wysiwyg/installation/`. The file names must stay exactly as they are.
2. In **Content → Pages → Roof Rack Installation**:
   - **Content Heading:** clear it. The page's H1 is now inside the hero. If this field is left filled in, the page gets two H1s.
   - **Content:** click **Show / Hide Editor** so the WYSIWYG editor is off, delete the old content, and paste the whole of `installation-cms.html`. The WYSIWYG editor can strip the `<script>` blocks, so keep it off whenever you save this page.
   - **Search Engine Optimisation:** leave the URL key, Meta Title and Meta Description as they are (Section 2).
3. Save, then check the live page:
   - "See fitting charges" opens the price list.
   - All 9 tiles show a photo, not the RRG placeholder logo.
   - Run the page through Google's Rich Results Test. It should find **Service** and **FAQ**.

**Rollback:** the old Content is saved in [live-backup-2026-10-26.html](live-backup-2026-10-26.html). Paste it back with the editor hidden, and put **Roof Rack Installation, Fitting, Service and Repairs** back in Content Heading.

---

## 2. SEO: what's kept, what changed

The old page ranks on its URL, title, H1, keyword list and price table. Every one of those is kept or carried over. Semrush had no API units on 2026-10-26, so I couldn't pull which terms this URL ranks for. Instead, every term on the old page is kept on the new one.

| Signal | Live page | New page |
|---|---|---|
| URL / canonical | `/roof-rack-installation-and-fitting-costs` | **Unchanged.** It's the same CMS page, so no redirect is needed. |
| Meta title | Roof Rack Installation Costs \| Expert Fitting Services - Roof Racks Galore | **Unchanged** (page settings, not the content). |
| Meta description | "…Rack Fit Guarantee at 30+ stores across Australia. Get a perfect fit today!" | **Unchanged.** Optional: the footer now says 36 locations, so "30+" could become "35+". |
| H1 | Roof Rack Installation, Fitting, Service and Repairs | **Same words**, now in the hero. One H1 only once Content Heading is cleared. |
| Keyword H2 | Roof Racks \| Kayak Carriers \| Bike Racks \| Luggage Box \| Roof Tray and Platforms \| Commercial Van Fitouts \| Rear Door Ladders \| Van Ladder Racks \| Accessories | The H2 is now "What We Fit". All 9 terms are written into the hero copy, and most are also tile titles that link to their categories. |
| Intro copy | "complicated and risky… damage, leaking and rust… thinner sheet metal… over 30 years… industry leading experts… Roof Racks & Bike Racks… best choice… roof rack installs… warranty" | **Kept**, reworded only for readability. The `/warranty` link is kept. |
| Fit time copy | "30mins… through to 8 hours… contact your local store" (→ `/locations/`) | **Kept** in the "How long does it take?" callout, still linking to `/locations`. |
| Price heading | Roof Rack and Accessory Installation & Fitting Rates (H3) | **Same words**, now an H2. |
| Price table | 32 rows, visible | **All 32 prices kept, unchanged.** Grouped, and inside a collapsed `<details>`. It is still in the HTML, so Google indexes it. The internal SKU column is gone; nobody searches for those codes. |
| Hero image | `rack-fitting-roof-racks-galore-hero.jpg`, alt "Roof Racks Galore Fitting Service" | **The same file and the same alt text.** It's cropped with CSS to hide the old logos, so there's no new upload. |
| Structured data | Organization only (site-wide, from the theme) | **Added (2026-10-26):** Organization, WebPage, BreadcrumbList, Service (all 31 priced rates as Offers in AUD, plus the 8 "What we fit" services with their category links) and FAQPage (7 questions, incl. "How much does roof rack installation cost?" with real prices). All linked by `@id`. 0 errors / 0 warnings on validator.schema.org. |
| Internal links | `/warranty`, `/locations/` | Those two, plus `/fit-my-vehicle`, 8 category pages, `/price-guarantee` and `/returns`. |
| Content | About 250 words + table | About 900 words + table + 6 FAQs. |

**Keep in mind:**
- **Collapsed prices:** the price list now starts collapsed (team decision, spec.md §16 item 2). Google indexes collapsed content and gives it full weight on mobile-first indexing. If rankings for "installation cost" terms dip after launch, opening it by default is a one-word change: add `open` to `<details class="price-accordion" id="costs">`.
- **Editing FAQs or prices:** the structured data copies the FAQ text and every price. If you change either on the page, ask Claude to rebuild the file so the schema matches, or edit the JSON-LD block at the bottom by hand.

---

## 3. Images

**Already live and reused (no upload):**

| Where | Live file |
|---|---|
| Hero | `/pub/media/wysiwyg/rack-fitting-roof-racks-galore-hero.jpg` |
| Bike Racks tile | `/pub/media/wysiwyg/category/general/bg-bike-rack.png` |
| Kayak & SUP Carriers tile | `/pub/media/wysiwyg/category/general/bg-kayak.jpg` |
| Awnings & Roof Top Tents tile | `/pub/media/wysiwyg/category/general/bg-rooftop-tent.jpg` |
| Accessories tile | `/pub/media/wysiwyg/category/general/bg-basket.jpg` |

**You need to upload (no usable live image), 4 files:** from [upload/](upload/) to `pub/media/wysiwyg/installation/`. The live `bg-roof-box.webp` is only 176×176px, and the live site has no roller shutter or van/ladder photo apart from a sale banner with text on it.

| File | Tile |
|---|---|
| `roof-racks.webp` | Roof Racks & Platforms (Brenton, 2026-10-26: the live platform photo only shows accessories) |
| `roof-boxes.webp` | Roof Boxes |
| `roller-shutters.webp` | Roller Shutters |
| `trade-work.webp` | Van Fit-Outs & Ladder Racks |

**Cloudflare caches images for a year, placeholder included.** If an image URL is requested before the file exists, Cloudflare and browsers keep the placeholder. That happened to all three here on 2026-10-26, which is why the links carry `?v=2`. When you replace an image, or a URL was hit too early, bump the `?v=` number in the `src` (or purge that URL in Cloudflare).

**Also uploaded:** `bike-racks.webp` (157 KB) replaces the live 2 MB `bg-bike-rack.png` on the Bike Racks tile.

---

## 4. Built for the current live site

| Feature | How the CMS content handles it on today's live site |
|---|---|
| **Book a Fitting** (hero, "Something else?" tile, How It Works, callout) | Plain links to `/locations`. The live Store Finder doesn't remember a chosen store or read `?store=`, so the links carry no store. |
| **Store remembered between pages** | Not used. The prototype's "Your Nearest Store" and saved-store logic is theme work for later. |
| **Trust bar** | The Home prototype's trust bar is a theme widget that the live site doesn't have yet, so it's in the CMS content as plain HTML. The Reviews.io item reads "Rated Excellent on Reviews.io" (static); the prototype's live star rating needs the theme. Links: `/price-guarantee`, `/returns` (the live 90-Day Exchange page), Reviews.io. |
| **Fit My Vehicle** | Links to the live `/fit-my-vehicle`. |
| **Category tiles** | All link to live category URLs (each checked, HTTP 200). The Van Fit-Outs tile goes to `/roof-racks/roof-rack-accessories/trade-and-work-solutions`. |
| **Opening the price list** | A 20-line inline script, no libraries, independent of the theme's JS. Without it, the links still scroll to the closed list. |
| **Styles** | Scoped to `#rrg-install`, so they can't leak into the header, footer or other pages. They also outrank the theme's CMS rules, which centre H1s in red and change line heights. They use the theme's own Barlow Condensed and Lato. |
| **Prototype-only parts left out** | Breadcrumbs, the brands strip and the Site Admin panel. They belong to the theme, not the CMS. |
| **NZ / UK** | This file is the AU page. NZ/UK store views would need their own copy without the AU prices. |

---

## 5. NZ version (roofracksgalore.co.nz)

- **The file to paste:** [installation-cms-nz.html](installation-cms-nz.html), into the NZ store view's page `/roof-rack-installation-and-fitting-costs`.
- **Rollback copy:** [live-backup-nz-2026-10-26.html](live-backup-nz-2026-10-26.html).
- **Testing:** done 2026-10-26 inside a saved copy of the live NZ page. One H1, no prices, all 9 images load, nothing overflows at 390px.

**Same as AU:** the design, the styles, the What We Fit tiles and How It Works. The images come from the shared media library, so there's nothing to upload for NZ.

**NZ-specific:**
- **No prices anywhere.** The AU feature tile's "$120 / $280" line is replaced, and its button goes to the cost section instead of a price list.
- **The live NZ copy is kept word for word:**
  - H1 "Roof Rack Installation & Fitting Services NZ";
  - subtitle and intro;
  - "Why Choose…" and "Important Information" cards;
  - "Roof Rack Installation Cost NZ" with its Simple / Standard / Complex tiers;
  - the "Book Your Roof Rack Installation Today" CTA;
  - all 5 FAQs (incl. Auckland) and their FAQPage schema.
- **One new H2:** "Professional Roof Rack Fitting" sits above the rest of the intro copy.
- **Trust bar:** NZ has no `/price-guarantee` (its page is `/price-guarentee`) and no Reviews.io link, so the items are:
  - Over 30 Years of Fitting Experience;
  - Auckland Fitting Centre (→ `/locations`);
  - Price Guarantee (→ `/price-guarentee`);
  - 90 Day Exchange (→ `/returns`).
- **Links:** Book a Fitting and every store link go to the NZ Store Locator, `/locations`.
- **Page settings:** NZ's Content Heading is already empty; leave it empty. Also leave its meta title and description ("Roof Rack Installation NZ | Roof Rack Fitting & Costs Auckland…") as they are.
- **No script:** the cost section isn't collapsed, so it's not needed.
- **Structured data (2026-10-26):** Organization (the NZ site had none), the Auckland store as an AutoPartsStore (195A Wairau Road, Wairau Valley, Auckland 0627, +64 9 481 1910, Mon–Fri 8:30–5, Sat 8:30–12:30, map coordinates), WebPage, BreadcrumbList, Service (provided by the Auckland store, area New Zealand, the 8 "What we fit" services; no prices) and FAQPage (the 5 NZ FAQs). 0 errors / 0 warnings on validator.schema.org.

## 6. Rebuilding this file

`installation-cms.html` is generated from the prototype. If the prototype changes, rebuild it rather than editing both by hand. Ask Claude to "rebuild the Installation CMS file". It:
1. extracts the prototype's `<main>`;
2. maps the prototype links and images to their live URLs;
3. scopes the matching rules from `shared.css` and `plp.css` to `#rrg-install`;
4. re-runs the live-theme comparison test.
