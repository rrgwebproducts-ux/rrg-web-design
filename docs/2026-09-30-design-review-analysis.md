# Design review 2026-09-30: best-practice check and suggestions

Companion to `spec.md` §16 (item numbers match). For each item: what the meeting agreed, whether it holds up against the evidence, and a suggestion. Researched 2026-09-30 from Baymard, NN/g, Google Search Central, the ACCC and live retailer sites. Sources are at the end.

**Verdict key:**
- ✅ best practice
- ⚠️ right direction, needs a change
- ❌ against the evidence, rethink
- — no research needed (content, admin or internal decision)

## Summary: where the evidence disagrees with the meeting

| # | Agreed in the meeting | What the evidence says |
|---|---|---|
| 21 | Drop "RRP" from card prices | ❌ **Legal risk.** An unlabelled strikethrough reads as "our old price". The ACCC fined digiDirect ($99k, 21 Sep 2026), Emma Sleep ($15m) and Dell ($10m) for exactly this. Keep "RRP". |
| 2 | Prices visible only when a store is logged in | ❌ Behind a login, Google can't index them and customers can't see them. Keep the accordion **public**; it's fine for SEO. |
| 12 | "Coming soon" placeholder stores in UK/NZ | ⚠️ Fine as a demo state. In production, only list a store once the site is signed with a real month and suburb. |
| 19 | Stock tooltips on product cards | ⚠️ Hover doesn't exist on phones. Make it a tap target, keep the card to one line, and move the store list and warehouse detail to the PDP. |
| 7 | "Change vehicle" clears the Fit Finder | ⚠️ Merging is right. "Change" should reset to Make with an easy way back, not silently wipe. |
| 17 | No city-level pages | ⚠️ Mostly right. A Brisbane hub (5+ stores) is a legitimate page if it has real content. Revisit after launch. |
| — | *Not raised:* offer tiles auto-advance on mobile, hero autoplays | ❌ Baymard: never auto-rotate on mobile. Worth fixing alongside item 22. |
| — | *Not raised:* FAQPage schema on every page | Google switched FAQ rich results off completely in May 2026. Keep the FAQs for users, but stop citing FAQPage as an SEO win in the briefs. |

Everything else was agreed correctly.

---

## 16.1 Installation page

### 1. Remove the estimator ✅
- **Evidence:** NN/g found a simple price table beats a calculator. Where exact prices are complicated, it recommends showing representative cases. Scott's point (customers arguing with the estimate at the counter) is a real risk the research doesn't cover but supports.
- **Suggestion:** Delete `.estimator` and its sticky mobile total bar. Keep `FIT_PRICES` as the single data source for the price list.

### 2. Form first, prices in an accordion below ⚠️
- **Evidence:**
  - Price is the #1 thing users look for (NN/g). Hiding it sends people to competitors.
  - Google gives collapsed accordion content full ranking weight, as long as it's in the HTML.
  - A login-gated list is neither indexed nor seen.
  - Supercheap Auto and Halfords publish fitting prices. Tyrepower is quote-only.
  - Under Australian Consumer Law you don't have to publish service prices. Any price you do show must be GST-inclusive, and a "from $X" price must be genuinely available.
- **Suggestion:**
  - Form first, then a **public** "Current fitting charges" accordion, collapsed.
  - Add one line near the form heading: "Most roof rack fits start from $120. Your store confirms the final price after checking your vehicle." That answers "roughly how much?" without an itemised bill.
  - Leave out the internal fit codes, as now.
  - Hero: change "See Fitting Costs" to a quiet text link, or drop it so Book a Fitting is the one action.
  - Site-wide "See Fitting Costs" links: point them at the accordion (open on arrival) rather than removing them.
  - If Scott and Chris still want no public prices, the fallback is "from $120" plus "call your store", not a staff login.
- **Decide:** public accordion vs "from" line only.

### 3. Store card beside the form ✅
- **Evidence:** Store-locator guidance says to show a real Call button, directions, hours and a map. Tyrepower, ARB dealers and Discount Tire all pair the booking request with the store.
- **Suggestion:**
  - Replace the grey box with the Store Finder's `.sf-card`, plus a small map.
  - Two paths: **"Send a request"** (the form) and **"Prefer to talk? Call North Lakes"**.
  - This also answers your tracking question from the meeting: fire a GA4 event on `tel:` taps and on form submits, each tagged with the store. Taps aren't connected calls; for those you'd need Google Ads call forwarding or a call-tracking vendor later.

### 4. Rewrite the FAQs ✅ (schema caveat)
- **Evidence:** Google stopped showing FAQ rich results entirely in May 2026, and dropped the Search Console report in June. The FAQs still help users, and the markup does no harm.
- **Suggestion:**
  - Sources: Crisp transcripts, Graham's NZ questions, store phone questions and Search Console queries.
  - Starter list:
    - How long does it take?
    - Can I wait in store or watch?
    - Can you fit a rack I bought elsewhere?
    - Do you fit accessories?
    - Do I need to drop the car off?
    - What if my vehicle needs extra work?
  - Drop the priced `Offer`s from the `Service` JSON-LD.
  - Separately, update the developer briefs so FAQPage isn't sold as a rich-result feature.

### 5. Avenue booking engine —
Keep the form's destination one config value (store email today), so moving to Avenue later is a backend change, not a redesign.

### 6. Order confirmation pushes fitting ✅
- **Evidence:** Baymard lists cross-sells as a legitimate use of the confirmation page. The strongest pattern (Halfords, Best Buy, Discount Tire) offers fitting **before** payment.
- **Suggestion:** When you design checkout:
  - offer fitting in the cart
  - add a "Book fitting at [store]" card on the confirmation page, prefilled with the order's products and store
  - include the same card in the confirmation email.

## 16.2 Fit My Vehicle page

### 7. Merge the vehicle bar and the Fit Finder ✅ / ⚠️
- **Evidence:** Supercheap, Repco and Halfords all show the known vehicle in one control with change and clear options. No major retailer shows the vehicle in a bar above an empty selector. That duplicates the vehicle and suggests the site forgot it.
- **Suggestion:** One component.
  - **Known vehicle:** vehicle photo, "Shopping for your Toyota Hilux", fields prefilled (read-only style), **Shop for my Hilux** as the primary action, and **Change vehicle** as a link.
  - **Change vehicle:** resets to Make with focus there and a "← Back to Hilux" undo, rather than wiping silently.
  - Add Repco's **"Shop without a vehicle"** link.
  - **Colour:** a light panel suits the vehicle photo. If you want the dark band, put the photo on a light inset card inside it.
  - Build it once and reuse it on home, FMV, VCLP and blog (Marc question in item 33).

### 8. Add Backbones/Spines, fix the line art —
Four cards fit. Note the current section has **3** cards (Legs / Bars / Platforms & Trays), so this makes 4. Redraw the legs and platform art.

### 9. Setup card links ⚠️
- **Evidence:** A link should deliver what its label promises. Weekend Adventurer → Platforms doesn't.
- **Interim suggestion (until item 27):**
  - Weekend Adventurer → Awnings & Roof Top Tents
  - Tradie → Trade & Work / ladder racks
  - Family → Roof Boxes

### 10. Step photos and "tested" wording —
Photos are a good idea: staged is fine now, real UGC later. For the wording, "Fit It & Test It" is unclear. Try **"Fitted & Checked"** with the line "We fit it, load-check it and show you how it all works before you drive off", if that's true in store. Check with Scott.

### 11. UGC loop ✅ (with rules)
- **Evidence:**
  - Google bans "review gating" (asking only happy customers) and incentivised reviews.
  - The ACCC says not to show only positive reviews without saying so.
  - 62% of shoppers are more likely to buy after seeing customer photos (Bazaarvoice).
- **Suggestion:** Send every customer the review SMS within about 24 hours. Send a separate photo request later, with consent to publish (offer to blur number plates).

## 16.3 Store Finder

### 12. UK/NZ "coming soon" stores ⚠️
- **Evidence:**
  - Google Business Profile allows a pre-opening listing up to a year ahead, visible 90 days before opening.
  - Google's spam policy treats location pages that just funnel to one page as doorways.
  - No UX research directly supports showing unconfirmed placeholder stores.
- **Suggestion:**
  - Build Leeds/Birmingham and West or South Auckland/Christchurch as **non-clickable "Opening soon" cards**, with no store page and no pin.
  - Add a Site Admin toggle, so the finder can be demoed with them (Graham's goal) and without them.
  - Production rule for the brief: list a store only once its opening is confirmed (site signed, month known), and switch to the full finder at 2+ open stores.
  - Label them demo placeholders, since the locations aren't confirmed.

### 13. Header label in single-store regions ✅ (research favours Graham)
- **Evidence:** In a one-store region, a direct link to that store beats a finder with one result.
- **Suggestion:** The label follows the open-store count: 1 store = "Visit Our Bolton Store" linking straight to the store page; 2+ = "Store Finder". It flips automatically when the second store opens.

## 16.4 Store page

### 14. Public holiday state ✅
- **Evidence:** Google supports holiday hours in LocalBusiness markup (`specialOpeningHoursSpecification`; closed = 00:00–00:00). Hours that don't match Google Business Profile break Google's "Open now".
- **Suggestion:**
  - Demo one day as "Closed · Public holiday" in soft red.
  - Add a small **"Upcoming holiday hours"** line above the table for the next 2–3 holidays, including state ones like Ekka.
  - Emit `specialOpeningHoursSpecification`.
  - Ask Marc (item 33) whether the cPanel hours can feed Google Business Profile too, so there's one source of truth.

### 15. Google rating per store ✅ (two rules)
- **Evidence:**
  - Since 2019, Google won't show review stars for reviews on your own LocalBusiness pages, so don't add `AggregateRating` markup.
  - Places API reviews must show Google attribution (logo, author name and photo). Content can't be edited and caching is limited.
  - 74% of shoppers look for reviews from the last 3 months (BrightLocal 2026).
- **Suggestion:** Show "★ 4.8 · 312 Google reviews" in the store panel, and a row of the **newest** 3–5 reviews (not hand-picked) with "Read all on Google".

### 16. "On display" wording ⚠️
- **Evidence:** Retailers present this as curated display categories with a route into everything the store carries (Best Buy, Bunnings).
- **Suggestion:** Heading "See it in person at North Lakes", with the line "Plus hundreds more racks, fittings and accessories in store — ask the team." Add a **"Shop what's in stock at North Lakes"** link to the PLP with the Availability filter set to this store. Drive the row from a real per-store "on display" flag, not stock level.

### 17. No "Meet the team", no city pages ⚠️
- **Meet the team:** research rates it well for trust. Staff reluctance is a valid reason not to. A store or team photo (no names) in the gallery gets most of the benefit.
- **City pages:** Brenton's cannibalisation concern is fair for thin pages. The evidence (Best Buy's state/city/store, Whitespark) supports a city hub **only** where a metro has 3+ stores **and** the page has real content: a map, a comparison of stores and services, and fitting availability. Brisbane (North Lakes, Kedron, East Brisbane, Rocklea, Springwood) and Sydney qualify.
- **Suggestion:** Keep the decision for launch. The Store Finder's `?state=` view already acts as the state hub. Revisit Brisbane and Sydney hubs post-launch using Search Console data.

## 16.5 Stock status

### 18. Keep store name, drop km ✅
- **Evidence:** Home Depot, Best Buy and Bunnings show the store name on the card and no distance. Distance belongs in the store picker, measured from the shopper's postcode.
- **Suggestion:** As agreed. The linked store name also doubles as "change store".

### 19. Tooltips ⚠️
- **Evidence:** NN/g: tooltips don't work on touchscreens, and task-critical information must never live only in a tooltip. Bunnings keeps the card to one line and puts "other stores" on the product page.
- **Suggestion:**
  - **Cards:** one line plus a small tappable **ⓘ** (its own tap target, separate from the card link). It opens a short popover on hover or tap: "Kedron is about 18km from your store (North Lakes). Also in stock at Rocklea."
  - **PDP:** the full list of nearby stores and "Ships from our Brisbane warehouse · usually 2–4 days" go in the Delivery / Click & Collect block, where people actually decide.
  - **Phase 1:** the ⓘ says "Stock shown is our online warehouse. Contact [your store] to check shelf stock", linking to the store page or the Store Finder.

### 20. More visible "Set your store" ✅
- **Evidence:** Best Buy prompts shoppers to set a local store for accurate availability. Baymard: attributes shown on cards should be filterable. The Availability facet from 14.1 already covers the filter side.
- **Suggestion:** One slim line above the results grid when no store is set: "📍 Set your store to see what's in stock near you". Dismissible, and hidden once a store is set.

## 16.6 Product cards

### 21. Drop "RRP" ❌
- **Evidence:**
  - ACCC: an unlabelled strikethrough implies the business's own previous price.
  - An RRP comparison is misleading unless the product actually sold at RRP recently, for a reasonable period.
  - Recent penalties: digiDirect ($99k + undertaking, 21 Sep 2026), Emma Sleep ($15m, Apr 2026), HSK United ($79k, Jun 2026), Dell ($10m).
  - Misleading pricing is an ACCC priority for 2026–27.
  - Graham confirmed RRG doesn't keep "was" price history, so a bare strikethrough can't be backed up.
- **Suggestion:** **Keep "RRP"** on cards. To win the width back, make "RRP" smaller and lighter (e.g. 11px grey caps) rather than removing it, or wrap the RRP under the price on narrow cards.
  - Take it back to Graham with the ACCC cases; it's his call, but the risk is real.
  - Worth a quick legal check that the RRPs themselves hold up.

## 16.7 Home page

### 22. Categories above the fold ✅
- **Evidence:**
  - Baymard: the home page should show the main categories (59% of sites fall short).
  - NN/g: about 57% of viewing time is above the fold.
  - Carousels get about 1% clicks, mostly on slide 1 (Notre Dame).
  - No controlled research on where the trust bar goes.
- **Suggestion:**
  - As agreed: offer tiles about 20% shorter, then categories, then the trust row.
  - Keep one compact proof line near the top (e.g. inside the hero Fit Finder panel: "Since 1989 · 35+ fitting centres · ★4.8").
  - **Also:** Baymard says never auto-rotate on mobile, but the offer tiles currently auto-advance every 4s on ≤900px and the hero autoplays every 6s. Suggest manual swipe only on mobile, and no autoplay on the hero, or a much slower one.

### 23. Fit Finder hero layout —
Layout fix: the last field goes full width, or View Results goes in the right column.

### 24. Fitment gallery carousel ✅
- **Evidence:** Real photos of vehicles like theirs prove fitment in a way stock images can't (Bazaarvoice: 80% prefer real photos).
- **Suggestion:** Reuse the PDP fitment gallery component across all vehicles. Make each photo link to that vehicle's VLP, so it's browsable and not only decoration.

### 25. Reviews carousel ✅
- **Evidence:** 5 reviews make a purchase 270% more likely, and 380% more for higher-priced items (Spiegel). Buying likelihood peaks at 4.0–4.7★, and all-5★ profiles lose trust.
- **Suggestion:** A manually scrolled row of recent reviews, not auto-rotating and not filtered to 5★. It could replace the Reviews.io badge in the trust band.

### 26. See item 7.

## 16.8 New templates and future work

### 27. Use-case landing pages ✅
- **Evidence:**
  - Baymard: themed browsing is "a powerful tool for users who aren't product domain experts".
  - Thule's activity pages are real landing pages; Rhino-Rack links straight to collections.
  - Google Ads' landing-page experience rewards a close match to the ad.
- **Suggestion:**
  - One light template: hero, a short intro, 3–5 category tiles, the Fit Finder (vehicle first), a curated product row and one guide link.
  - Name pages by **activity** ("Touring & Camping", "Bike Carrying", "Trade & Work"), since people search for those, and keep persona copy in the hero.
  - Where you can't write unique content, link to a filtered collection rather than publishing a thin page.

### 28. "Looking for a complete roof rack?" on component pages ✅
- **Evidence:** Baymard: users arrive on product pages from outside search, and they leave when the item isn't right. It recommends showing compatible products on component pages.
- **Suggestion:** One line under the PDP title, "This is one part of a roof rack system. Looking for a complete rack? Find yours by vehicle →", opening the Fit Finder. Add a "Works with" row of the matching components.

### 29. Adventure-type filter —
It's a product-attribute filter (e.g. "Off-road rated"). Needs data first; park.

### 30. Brand, blog, checkout —
Checkout carries item 6. Suggested order: checkout (revenue), then brand pages, then blog.

### 31. Index page tidy —
Split `prototypes/index.html` into **Page designs** and **Tools & briefs** tabs.

## 16.9 Actions outside the designs —
- **32. Loom:** use chapters, one per page, so people can jump to their area. Record after items 1–3, 7, 21 and 22 land, so the video doesn't show the estimator.
- **33. Marc:** scheduled go-lives are doable either with a scheduled merge (GitHub Actions cron) or date-driven content like the Sea Otter page. For a campaign swap, date-driven content is the safer option.
- **34–36:** no design work.

---

## Sources
- **Carousels:**
  - https://erikrunyon.com/2013/01/carousel-interaction-stats/
  - https://baymard.com/blog/homepage-carousel
  - https://www.nngroup.com/articles/auto-forwarding/
- **Home page and above the fold:**
  - https://baymard.com/blog/ecommerce-navigation-best-practice
  - https://www.nngroup.com/articles/homepage-real-estate-allocation/
  - https://www.nngroup.com/articles/scrolling-and-attention/
- **Showing prices:**
  - https://www.nngroup.com/articles/show-price/
  - https://www.nngroup.com/articles/show-prices-for-common-scenarios/
- **Accordion content and SEO:** https://www.searchenginejournal.com/googles-mueller-on-myth-of-hidden-tab-content/358724/
- **ACL pricing:**
  - https://www.accc.gov.au/consumers/pricing/price-displays
  - https://www.accc.gov.au/publications/advertising-and-selling-guide/advertising-and-selling-guide/pricing/two-price-comparison-advertising
- **ACCC cases:**
  - https://www.accc.gov.au/media-release/digidirect-pays-penalties-and-admits-to-making-misleading-strikethrough-discount-claims
  - https://www.accc.gov.au/media-release/10m-penalty-for-dell-australia-for-misleading-representations-about-discount-prices-of-computer-monitors
- **Fitting services:**
  - https://www.supercheapauto.com.au/in-store-fitment-services/battery-fitment
  - https://www.halfords.com/motoring/services/halfords-roof-bar-fitting-service.html
  - https://www.discounttire.com/buy-and-book
- **FAQ rich results:**
  - https://developers.google.com/search/docs/appearance/structured-data/faqpage
  - https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- **Order confirmation:** https://baymard.com/blog/order-confirmation-page
- **Call tracking:** https://www.ruleranalytics.com/blog/phone-call-tracking/track-phone-calls-google-analytics/
- **Tooltips:** https://www.nngroup.com/articles/tooltip-guidelines/
- **Filters for card info:** https://baymard.com/blog/have-filters-for-list-item-info
- **Store availability:**
  - https://www.bunnings.com.au/bunnings-product-finder
  - https://www.bestbuy.com/site/help-topics/product-availability/pcmcat204400050030.c?id=pcmcat204400050030
- **Google Business Profile pre-opening:**
  - https://support.google.com/business/answer/9174409
  - https://www.brightlocal.com/blog/google-my-business-opening-soon-case-study/
- **Doorway pages:** https://developers.google.com/search/docs/essentials/spam-policies
- **Store hours markup:**
  - https://developers.google.com/search/docs/appearance/structured-data/local-business
  - https://schema.org/specialOpeningHoursSpecification
- **Review stars and review display:**
  - https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
  - https://developers.google.com/maps/documentation/places/web-service/policies
- **Local search:**
  - https://www.brightlocal.com/research/local-consumer-review-survey/
  - https://whitespark.ca/local-search-ranking-factors/
  - https://www.bunnings.com.au/stores/qld
- **Reviews and UGC:**
  - https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/
  - https://www.bazaarvoice.com/blog/user-generated-content-statistics-to-know/
  - https://www.accc.gov.au/business/advertising-and-promotions/online-reviews-for-product-and-services
- **Vehicle selectors:**
  - https://baymard.com/blog/automotive-parts-ux-benchmark-2026
  - https://www.supercheapauto.com.au/services/my-garage
  - https://www.repco.com.au/rego-search
- **Activity pages:**
  - https://baymard.com/blog/mobile-ecommerce-search-and-navigation
  - https://www.thule.com/en-us/activities/camping-and-van-life
  - https://www.rhinorack.com/en-au/products/shop-by-activity
- **Component pages:** https://baymard.com/blog/product-page-suggestions

**Caveats:**
- Baymard's detailed vehicle-selector and store-stock guidelines are paywalled; the verdicts use their free articles.
- The Emma Sleep and HSK United details come from news coverage, not ACCC releases.
- The Halfords prices came from search snippets.
- None of this is legal advice.
