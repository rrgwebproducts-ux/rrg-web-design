# Buying Guide — Engineering Spec

Project: a new **Buying Guide** template, first used for the rebuilt `/bike-racks-info` page ("How to Choose the Best Bike Rack for Your Vehicle"). Same conventions as the other templates (shared header/footer/widgets, `shared.css` typography, Component Library first).

Planning session: 2026-10-06. Brenton answered the Section 8 decisions the same day, and it was built the same day (Section 9).

---

## 0. Goal & scope

The live page has good, recently rewritten copy (6 topics, 15 FAQs, state-by-state plate rules), but it's one long stack of icon grids and paragraphs. Hitch and Tow Ball repeat the same 5 bullets, and nothing tells a reader what *they* should buy.

The rebuild keeps **all of the live content**. It restructures it so the reader leaves knowing which rack they need:

1. **Answer first.** A 3-question **Bike Rack Finder** at the top gives a personal recommendation, and the rest of the page explains it.
2. **Three clear steps.** The live topics become a numbered path: *Your bikes → Your vehicle → How it holds the bike*, then *Before you buy*.
3. **Compare at a glance.** One comparison table of every mounting style.
4. **Shop from where you are.** Every option links to the filtered bike rack range, so learning flows straight into shopping.

**In scope:** `prototypes/buying-guide/` (Bike Racks content). Sections are built as reusable blocks so the same template can later carry the other live guides (`/cargo-info`, `/water-snow-info`, `/awnings-roof-top-tents-info`). Those aren't in this build.

---

## 1. What the live page ranks for (Semrush AU, 2026-10-06)

| Keyword | Pos | Volume/mo |
|---|---|---|
| vehicle bicycle racks | 10 | 6,600 |
| bike rack for vehicle | 12 | 4,400 |
| auto bike rack | 16 | 4,400 |
| automobile bike racks | 10 | 3,600 |
| bike rack car | 9 | 2,400 |
| car bike rack | 6 | 1,900 |
| bike rack for car | 8 | 1,600 |
| bike roof holder | 6 | 1,300 |
| bike rack | 30 | 12,100 |

It ranks as a **category guide** for head terms, not just for "buying guide" searches. So:

- **Keep the URL** `/bike-racks-info`, the H1, and the `<title>`.
- **Keep the content depth.** Nothing gets cut, and nothing is hidden behind JS-loaded content. Accordions and tabs keep their text in the HTML.
- Popular question searches (*are bike racks legal / safe / universal / covered by insurance*, *are roof bike racks safe*, *can a bike rack cover your licence plate*) are already live FAQs. They stay, word for word.

---

## 2. Sections (top to bottom)

| # | Section | Build | Live content used |
|---|---|---|---|
| 2.1 | Breadcrumbs | Home › Bike Racks › Bike Rack Buying Guide | — |
| 2.2 | **Hero (contained)** | `.page-hero`: H1 on the left; on the right, the **Bike Rack Finder** card (2.3). Under the H1: a 2–3 line "short answer" (the live intro), an "Updated Oct 2026 · Checked by our fitting team" line, and the read time. | H1 + intro, as live |
| 2.3 | **Bike Rack Finder** | New widget `bike-rack-finder`. 3 quick questions, one at a time, as big tappable chips: **How many bikes?** (1–6) · **Any of these?** (eBike, Carbon, Kids', Fat/XXL, Step-through, None — multi-select) · **What does your vehicle have?** (Tow bar, Roof bars, Rear spare wheel, Ute tub, None of these). **Result:** "Best for you: Tow ball or hitch platform rack, wheel hold", with 2–3 "why" lines pulled from the live rules (e.g. *eBikes are 25–35kg — waist-height loading only*), **Shop these racks (N)** → filtered bike rack PLP, and **Show me why** → scrolls to the matching card below, which gets a "Your match" highlight. On mobile it sits under the H1. | Rules come only from live copy (Section 3) |
| 2.4 | **On this page** bar | Sticky chapter bar under the header: **1 Your bikes · 2 Your vehicle · 3 Bike hold · Before you buy · Number plates · FAQs**. Highlights the current section as you scroll, with a thin progress line. A chip scroller on mobile. | Replaces the live jump-link list |
| 2.5 | **Compare mounting styles** | Real `<table>`: Tow hitch / Tow ball / Roof / Spare wheel / Rear door / Ute tub / Suction × *Max bikes · eBikes · Needs · Boot access · Best for*. Sticky first column with horizontal scroll on mobile. Each row links to its card in step 2. | Facts from step 2 only; unknown cells: see decision 4 |
| 2.6 | **Step 1 · Your bikes: how many?** | Numbered step header. 1–6 bike tiles (live icons) → filtered PLP. "Mix and match" callout: *two on the roof, four on a tow hitch*. | Live "Number of Bikes" |
| 2.7 | **Step 1 · Your bikes: what type?** | 8 bike-type cards (live icons), each with a **verdict chip** so it can be scanned: Road / MTB / BMX → *Most racks*; eBike → *Tow hitch or tow ball only*; Carbon → *Wheel hold only*; Fat/XXL → *Wide-tray racks only*; Kids' → *Platform hitch best*; Step-through → *Wheel hold or frame adapter*. The live sentence sits underneath. | Live "Types of Bikes", word for word |
| 2.8 | **Step 2 · Your vehicle: where it attaches** | 7 mounting cards (live image, "Carries up to N bikes" badge, ✓ pros / ! watch-outs, a **Needs:** chip such as *Tow bar* / *Roof bars* / *Rear spare wheel*, and **Shop [style] racks** → PLP). Hitch and Tow Ball keep separate cards (they're separate PLP filters), but the shared bullets aren't repeated (decision 2). The roof-platform note ("fitting bikes to Roof Platforms is complex… call 1300 071 264") is a callout on the Roof card. | Live "How Bike Rack Attaches to Vehicle" |
| 2.9 | **Step 3 · How the bike is held** | 8 hold-style cards (live images) in a compact grid. A **Carbon-safe** badge on Wheel Hold and Platform Wheel Hold; a **Tow hitch required** badge on Vertical Hanging. Each → its PLP filter (Tailgate Hang → the live Prorack tailgate pad product). | Live "How Bike Attaches to Bike Rack" |
| 2.10 | **Before you buy** | A 5-item checklist (icon, bold title, live paragraph): combined roof load · tow bar rating · towing a trailer? · keep it secure · what affects the price. | Live "Before You Buy", word for word |
| 2.11 | **Number plates & the law** | Split block: on the left the rule plus a **Quick check** callout; on the right the state list (NSW → myPlates, ACT → Access Canberra, Other states). "A handwritten plate isn't legal" stays. | Live section, word for word |
| 2.12 | **Straight advice + get it fitted** | Dark trust band: *Straight Advice, Not Just a Sale* copy, then **Call 1300 071 264** · **Chat** · **Find a store** · **Get it fitted** (→ Installation). Secondary buttons are `.btn-outline`. | Live "Straight Advice" + "Let Us Help" |
| 2.13 | Brands | Shared brand logo row, 9 logos → brand bike rack PLPs. | Live "Our Brands" (intro line kept) |
| 2.14 | **FAQs** | Shared `.faq-section`, all 15 live Q&As word for word, grouped into 3 tabs-free subheads: *Choosing* · *Safety & your car* · *Legal & insurance*. `FAQPage` JSON-LD. | Live FAQ |
| 2.15 | More buying guides | 3 cards: Roof racks (→ Fit My Vehicle), Roof boxes, Awnings & Roof Top Tents (live `-info` URLs). | — |
| 2.16 | Footer | Shared | — |

**Mobile:** a sticky bottom **Find my bike rack** button appears once the Finder has scrolled away (the same IntersectionObserver pattern as the PDP sticky bar) and scrolls back up to it. It's hidden once the reader has a result, which replaces it with **Shop my match (N)**.

**Engagement:** short blocks, a verdict on every card, a step number on every section, a "Your match" highlight that ties the page to the reader's answers, and the sticky progress bar. Every section has a plain-English answer line under its H2.

---

## 3. Finder logic (from live copy only — no new advice)

| Rule | Source |
|---|---|
| eBike selected → hitch or tow ball only, platform style; roof excluded | Types of Bikes + FAQ 1 |
| Carbon selected → wheel hold / platform wheel hold | Types of Bikes + FAQ 5 |
| Fat/XXL → wide-tray (platform) racks | Types of Bikes + FAQ 8 |
| Kids' mixed with adults → platform tow hitch | Types of Bikes |
| Step-through → wheel hold or frame adapter | Types of Bikes |
| Bike count over the style's max → drop that style (Roof 4, Spare wheel 2, Rear door 3, Ute tub 5, Suction 3, Hitch/Tow ball 6) | Step 2 cards |
| Tow bar → hitch / tow ball first ("best long-term investment") | Intro + FAQ 6 |
| Roof bars only → roof mounted (unless eBike) | Step 2 |
| None of these → suction or rear door, plus "talk to us" | Step 2 |
| eBike with no tow bar → no rack shown: "You'll need a tow bar", with Call / Get it fitted | Derived from the eBike rule |

The result always links to the PLP with the matching filters (attachment style + number of bikes + bike attachment style), so the count matches the range.

---

## 4. SEO / AEO / GEO

- **URL, H1, `<title>`, meta description:** as live (Section 1).
- **One H1.** H2 per section, written the way people search: "How many bikes do you need to carry?", "Which bike rack fits your vehicle?", "Do you need a number plate for a bike rack?".
- **Answer-first:** every H2 opens with a 1–2 sentence direct answer, so Google AI Overviews and LLMs can quote it.
- **Structured data:** `Article` (headline, `dateModified`, `author` = Roof Racks Galore fitting team, publisher) + `BreadcrumbList` + `FAQPage` (15 Qs, unchanged).
- **Comparison table** as real HTML, a format AI answers like to quote.
- **Expertise signals:** "Checked by our fitting team" with the date, the fitted count (decision 3), and the store count.
- **Internal links:** every card links to its PLP filter, plus the brand PLPs, Installation and the other guides.
- **Speed:** live images lazy-load below the fold, and the Finder is plain JS with no library.

---

## 5. Reuse

| Block | Status |
|---|---|
| Header, footer, breadcrumbs, `.page-hero`, `.faq-section`, `.callout`, trust band, brand row | Shared, already exists |
| `bike-rack-finder` | **New widget**, added to `widgets.js` + Component Library registry. Written generic (question config + rules) so the Roof Box guide can reuse it. |
| `guide-toc` (sticky chapter bar), `guide-step` (numbered step header), `compare-table`, `option-card` (image + verdict + needs + shop) | **New**, in `shared.css`, added to the registry |

---

## 6. Prototype mechanics

- Images are hotlinked from the live `/pub/media/wysiwyg/bike-rack-image/` (as the home page does), and get copied local if they're too small or slow.
- PLP links go to the prototype PLP (`prototypes/plp/`); filters are added to the query string for production.
- The index page and Site Admin → All templates both list the new template.

---

## 7. Open items

- **Photos:** the live images are line icons and product shots. Real lifestyle shots (bikes on a hitch rack, loading an eBike) would lift it. They're stand-ins until then.
- **Bike Rack Wizard:** the live mega menu mentions a "Bike Rack Wizard" on `/bike-racks`. If the Finder is approved, it could replace that too (one tool, two places).

---

## 8. Decisions log (2026-10-06)

| # | Question | Answer |
|---|---|---|
| 1 | Build the interactive Bike Rack Finder? | **Yes.** |
| 2 | Hitch and Tow Ball have identical live copy | **Two cards in one "Tow bar racks" group.** The shared bullets appear once; each card says how it attaches. |
| 3 | Fitted count: 200,000 or 300,000? | **200,000**, everywhere (intro, step 2, advice band, FAQ). |
| 4 | Cells the live page doesn't cover (eBikes/carbon on spare wheel, rear door, ute tub, suction) | **"Ask us".** The Finder never recommends those combinations either. |
| 5 | Scope | **Bike Racks only** for now, built as the template. |

---

## 9. Build notes — built 2026-10-06

- **Files:** `prototypes/buying-guide/index.html`; Buying Guide block in `_shared/shared.css`; `_shared/buying-guide.js` (Finder logic, On this page bar, mobile button); `rrgWidgetBikeRackFinderHTML()` in `_shared/widgets.js`; the live line-art images copied to `_shared/bike-guide/`.
- **Registry:** 10 new Component Library entries (Bike Rack Finder with 6 states, On this page bar, comparison table, step header, count tiles, type cards, option cards, hold cards, checklist, advice band); `buying-guide` added to the usedOn lists of breadcrumbs, trust row, brands strip, FAQ, page hero, info cards and callout. Listed on the template index and in Site Admin → All templates.
- **Layout changes from Section 2:**
  - Roof is a full-width card between the tow bar group and the other four, so the cards fill their grid.
  - The FAQs are grouped under 3 subheads (Choosing / Safety and your car / Legal and insurance).
  - The trust row uses 90 Day Exchange in place of Rack Fit Guarantee, which is roof rack specific.
  - "Shop these racks" shows no count: the prototype PLP has no real filters.
- **Copy:**
  - The live text is kept word for word, except: the fitted count is 200,000 everywhere (decision 3), and the em dashes are swapped for colons or full stops.
  - Brand intro is now "all tested by our install team" (live: "tested by our team of 300,000+ install experts").
  - The new copy is the Finder's results, the answer lines under each H2, the comparison table, and one line each on how hitch and tow ball racks attach.
- **SEO:**
  - The FAQs are static HTML.
  - The `FAQPage` JSON-LD is built from that markup in the prototype. **Production should render it server-side.**
  - `Article` + `BreadcrumbList` JSON-LD are in the `<head>`.
- **Links:** shop links go to the prototype PLP with the filters in the query string (`?attachment=`, `?bikes=`, `?hold=`, `?type=`, `?brand=`). The prototype PLP ignores them, so production must map them to the real Magento filter URLs. The Roof Box and Awnings guide cards go to their live `-info` pages.
- **Not done:** no link to the guide from the Bike Racks mega menu or the PLP yet (the live mega menu has one).
