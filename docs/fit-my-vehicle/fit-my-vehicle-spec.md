# Fit My Vehicle — Engineering Spec

Project: the rebuilt `/fit-my-vehicle` page, the guide to finding a roof rack that fits. Companion to `docs/vlp/vlp-spec.md` (where its Fit Finder lands) and `docs/installation/installation-spec.md` (where its "We can fit it for you" section goes). Same conventions as the other templates.

Planning session: 2026-09-30. Decisions in Section 5 were answered by Brenton the same day.

---

## 0. Goal & scope

The live page has strong copy (roof types, load ratings, bars vs platforms, setups by use, 8 real FAQs) in a single red-headed text column under the home page's slider. The rebuild keeps the copy word for word and gives each topic its own visual block. It does **not** copy the live layout.

**In scope:** `prototypes/fit-my-vehicle/`; the header's "Fit My Vehicle" link now goes here.

---

## 1. Sections (top to bottom)

| # | Section | Build | Notes |
|---|---|---|---|
| 1.1 | Breadcrumbs | Home › Fit My Vehicle | |
| 1.2 | **Hero (contained)** | New `.page-hero` | H1 "Find the Right Roof Rack for Your Vehicle" + the live intro on the left, the live touring photo on the right (16:9, max 360px tall). |
| 1.2a | **Vehicle finder** (vehicle bar + Fit Finder merged) | `.fit-finder-widget[data-vehicle-finder]` | Full width under the hero. **No vehicle:** all fields in one row, the header drawer's Make → Model → Year/Body/Roof cascade; View Results sets the vehicle and lands on its VLP; "Shop without a vehicle" below. **Vehicle known:** photo, "Shopping for your Toyota Hilux?", the year/body/roof picked as read-only chips, **Shop for my Hilux** (→ VLP) and **Change vehicle** (resets to Make, "← Back to Hilux" undoes it). Light or dark (Site Admin → Design options). Merged 2026-09-30 (spec.md §16 item 7: never a vehicle bar above a blank Fit Finder). Since 2026-10-02 the shared widget (`<div data-widget="vehicle-finder" …>`, `rrgWidgetVehicleFinderHTML()` in `_shared/widgets.js`), not a per-page copy. See `PAGE-GLOSSARY.md` → Vehicle finder. |
| 1.4 | Trust row | `.trust-row` | Over 200,000 Racks Fitted · 35+ Fitment Centres (→ Store Finder) · Expert Fitting In-Store · Rack Fit Guarantee. |
| 1.5 | Why trust our fit advice | New `.split-media` | Live copy beside the live fitter photo, landscape and capped at 320px so the copy has no big gaps above and below (2026-09-30). |
| 1.6 | **What roof type does your vehicle have?** | New `.roof-types` | 6 compact cards, the diagram beside the copy, with RRG's own line-art diagrams from the live page (`_shared/fit-guide/roof-*.webp`) at their true proportions (the first pass stretched them vertically; fixed 2026-09-30). |
| 1.7 | **How much weight can your roof rack carry?** | New `.load-panels` + `.callout` | Static (parked) and dynamic (driving) side by side; "The lower number wins" pulled out as a callout. |
| 1.8 | Bars, legs, platforms & backbones | `.info-cards--4` | Legs / Bars / Platforms & Trays / **Backbones & Spines** (added 2026-09-30, §16 item 8; no tracks), each with a shop link. New line art (`_shared/fit-guide/part-*.svg`): the same roof in perspective each time with only that card's part in red (the old legs image showed a bar, and the platform didn't read as a platform). |
| 1.9 | Choosing the right setup | `.info-cards` + `.callout` | Weekend Adventurer (→ Awnings & Roof Top Tents, was Platforms: §16 item 9) / Tradie (→ Trade & Work) / Family (→ Roof Boxes) with photos and shop links. These are interim links until the use-case landing pages (§16 item 27) exist; the live "one mistake we see all the time" as a callout. |
| 1.10 | **We can fit it for you** | `.steps--photos` | Find Your Fit → Book In-Store → **Fitted & Checked** ("We fit it, load-check it and show you how it all works before you drive off": Graham asked what "tested" meant; wording approved 2026-09-30), each with a photo (§16 item 10). The photos are stand-ins from the prototype's own assets until lifestyle / UGC shots exist; **Book a Fitting** and **See Fitting Costs** go to the Installation page (`#book`, `#costs`). |
| 1.11 | FAQ | `.faq-section` | The live page's 8 questions and answers, plus `FAQPage` JSON-LD. |
| 1.12 | Brands, footer | | |

---

## 2. Header link (decision 1)

The header's **Fit My Vehicle** link (desktop nav and mobile menu) now goes to this page. It used to open the Fit My Vehicle drawer. The **utility-bar vehicle link** ("Your Vehicle: Toyota Hilux" / "Select Your Vehicle") and every in-page trigger still open the drawer, so changing vehicle stays one click anywhere (`initFitFinderTriggers()` in shared.js).

---

## 3. SEO

Indexed. `<title>` and meta description as live. One H1; `FAQPage` JSON-LD.

---

## 4. Open items

- **Shop links** (fitting kits, roof bars, platforms, trade & work, roof boxes) go to `#` in the prototype. They're real categories on the live site.
- **Step photos:** lifestyle or UGC shots needed (someone using the Fit Finder, walking into a store, out on the road).
- **Make list:** the prototype's Fit Finder knows Toyota and Ford (the two demo vehicles). Production uses the full live make list.

---

## 5. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 1 | Header "Fit My Vehicle" link | **Goes to this page.** |
| 4 | Hero style | **Contained.** |

(Decisions 2 and 3 are the Installation page's: see its spec.)

---

## 6. Build list — built 2026-09-30

Revised the same day after the design review (§16 items 7–10): vehicle finder merged, 4th part card and new line art, setup links, step photos. Playwright-verified 1440 + 390px, Change → Back, light + dark.


Built and Playwright-verified: 1440 + 390px, nav link from another page, Fit Finder → VLP, utility-bar link still opens the drawer, Book a Fitting / See Fitting Costs → Installation, no overflow, zero console errors. Not pushed.
