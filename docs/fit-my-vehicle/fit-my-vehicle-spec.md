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
| 1.2a | **Fit Finder bar** | `.fit-finder-widget` (as on the VCLP) | Full width under the hero, all fields in one row: the header drawer's Make → Model → Year/Body/Roof cascade (`initInlineFitFinders()`). View Results sets the vehicle and lands on its VLP. Moved out of the hero on 2026-09-30 (Brenton: it didn't sit right squeezed into the hero, and didn't match the other pages). |
| 1.3 | Your vehicle bar | The home page's `.home-vehicle-bar` | Only while a vehicle is saved: "Shopping for your Toyota Hilux?" → its VLP / Change vehicle. |
| 1.4 | Trust row | `.trust-row` | Over 200,000 Racks Fitted · 35+ Fitment Centres (→ Store Finder) · Expert Fitting In-Store · Rack Fit Guarantee. |
| 1.5 | Why trust our fit advice | New `.split-media` | Live copy beside the live fitter photo, landscape and capped at 320px so the copy has no big gaps above and below (2026-09-30). |
| 1.6 | **What roof type does your vehicle have?** | New `.roof-types` | 6 compact cards, the diagram beside the copy, with RRG's own line-art diagrams from the live page (`_shared/fit-guide/roof-*.webp`) at their true proportions (the first pass stretched them vertically; fixed 2026-09-30). |
| 1.7 | **How much weight can your roof rack carry?** | New `.load-panels` + `.callout` | Static (parked) and dynamic (driving) side by side; "The lower number wins" pulled out as a callout. |
| 1.8 | Bars, legs, platforms & trays | New `.info-cards` | Legs / Bars / Platforms & Trays, each with the shop-by line art and a shop link. |
| 1.9 | Choosing the right setup | `.info-cards` + `.callout` | Weekend Adventurer / Tradie / Family with photos and shop links; the live "one mistake we see all the time" as a callout. |
| 1.10 | **We can fit it for you** | New `.steps` | Find Your Fit → Book In-Store → Fit It & Test It; **Book a Fitting** and **See Fitting Costs** go to the Installation page (`#book`, `#costs`). |
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

Built and Playwright-verified: 1440 + 390px, nav link from another page, Fit Finder → VLP, utility-bar link still opens the drawer, Book a Fitting / See Fitting Costs → Installation, no overflow, zero console errors. Not pushed.
