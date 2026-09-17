# Landing Page CRO Analysis
## Vehicle Category Landing Page — Ford Ranger Roof Racks
### File analyzed: `prototypes/vehicle-category-landing/index.html` (static prototype, not live traffic)
### Analysis Date: 2026-09-15

---

## Overall CRO Score: 59/100

## Page Type: Vehicle Fitment Landing Page (hybrid of SEO category page + Lead/Tool-Completion page)
This doesn't map cleanly onto the skill's standard page types — it's not selling one SKU (E-commerce Product) and it's not capturing an email (Lead Capture). Its real conversion event is **completing the Fit Finder** (Year/Body/Roof → "View Results"), which is meant to hand the visitor to a filtered product list. Benchmarks below borrow from **E-commerce Product** discovery flows and **Lead Capture** tool-completion rates as the closest analogues.

## Current Estimated Conversion Rate (Fit Finder completion): Not measurable yet
"View Results" currently stubs out with an alert — there is no real PLP/category page for it to hand off to (flagged in the page's own code comments). No real conversion rate exists until that page is built; treat this analysis as pre-launch QA, not a live-traffic teardown.

## Target Conversion Rate (Fit Finder completion, once live): 25-35%
Reasonable for a fitment tool with only 3 required fields on a page that's already filtered to one make/model (visitor intent is high by the time they land here from a "Ford Ranger Roof Racks" search).

---

## Section-by-Section Analysis

### 1. Hero Section [Score: 6/10]
**Findings:**
- H1 "Ford Ranger Roof Racks" is concise (4 words) and keyword-matched, but it's a label, not a benefit — it tells the visitor *what page this is*, not *what they get*.
- The paragraph under the H1 is doing subheadline duty but is 5 sentences of dense body copy (~75 words). It's genuinely well-written and specific (calls out generation, cab type, roof-rail type as the real fitment variables) but it reads as an FAQ answer, not a scannable subhead — most visitors won't read it before deciding whether to engage.
- Primary hero CTA text is **"Change Vehicle"** (`prototypes/vehicle-category-landing/index.html:211`). This is backwards: the visitor hasn't selected anything yet on this page — "Change" implies undoing a prior choice. Compounding this, the header utility bar directly above it reads **"Your Vehicle: Toyota Hilux"** (line 121) on a page whose entire premise is the Ford Ranger. A first-time visitor's first impression is the site telling them it thinks they drive a different vehicle. This is a trust-breaking inconsistency sitting directly above the fold, not a copy nitpick.
- Hero image is a real Ford Ranger studio cutout — strong, specific, not generic stock. Good.
- No trust indicators above the fold at all (no review score, no "35+ stores," no brand logos) — the only social proof on the page (Reviews.io 4.8/5) is buried mid-page in the trust banner (line 305).
- Full mega-menu, utility bar, search and cart all present — appropriate for an SEO/category-style landing page (visitors should be able to keep browsing), but it does mean the hero CTA has to work harder to stand out, which the current "Change Vehicle" label undermines further.

**Fixes (Priority: HIGH):**
- Rewrite the hero CTA from "Change Vehicle" to something outcome-focused and correctly scoped to a first-time visit, e.g. **"Find My Ranger's Fit"** or **"Show Me What Fits"**.
- Fix the "Your Vehicle: Toyota Hilux" session-state mismatch so it either reflects Ford Ranger on this page or is hidden — this is the single highest-impact fix on the page for trust, and it's a data-wiring fix, not a design one.
- Pull the Reviews.io 4.8/5 badge (currently line 305) up into the hero, next to or below the H1, so trust is visible in the first viewport.

### 2. Value Proposition [Score: 6/10]
**Findings:**
- **Useful:** Yes — genuinely solves a real, common confusion (which Ranger has rails, which doesn't).
- **Urgent:** No urgency device anywhere on the page (no stock/seasonal/pricing pressure) — reasonable for a fitment-education page, but the FAQ's "get in touch" and the body copy's "send us a photo" tip could be framed as reducing a real cost of waiting (ordering the wrong rack).
- **Unique:** Not addressed. Nothing on the page says why a visitor should fit their Ranger through Roof Racks Galore specifically vs. a generic retailer — no mention of Australian stock, warranty, or the 35+ store network until the footer/FAQ.
- **Ultra-specific:** Strong — generation names (PX Series), trim mentions (Wildtrak, XL/XLS), and roof-rail terminology are concrete, not vague.
- Scannability: this section is prose-only in the hero; the real scannable breakdown (bulleted roof-rail types) doesn't appear until the "What Roof Racks Fit My Ford Ranger?" section, well below the fold (line 287-293).

**Fixes (Priority: MEDIUM):**
- Move a condensed version of the 3-item roof-rail bullet list (raised rail / flush rail / bare roof) up near the hero or Fit Finder — right now the visitor is asked to choose "Roof Type" in the Fit Finder before the page has explained what those three types even mean.
- Add one differentiation line near the hero or trust banner (e.g., "Australia's largest roof rack range, fitted nationwide at 35+ stores") — the store count exists on the page already (footer, FAQ) but never does any persuasive work up top.

### 3. Social Proof [Score: 5/10]
**Findings:**
- Two types of proof present: the Reviews.io 4.8/5 badge (trust banner, line 305) and the Fitment Gallery of 16 real customer install photos (line 261-279) — a strong, high-persuasion proof type since it's real customer vehicles, not stock imagery.
- Both are under-leveraged: the reviews badge is small, mid-page, and not near any decision point (it sits in the trust banner, between the Fitment Gallery and the FAQ, not next to the Fit Finder).
- No named testimonials, no specific customer quotes, no case studies.
- "Shop The Best Brands" (line 364) is a supplier-logo strip, not customer social proof — it builds category credibility but shouldn't be counted as proof of RRG's own trustworthiness.
- The Fitment Gallery currently shows Toyota Hilux photos as a flagged placeholder (per the page's own code comments) since no real Ranger fitment photography exists yet — worth knowing this section's persuasive power is not yet real for this specific vehicle page.

**Fixes (Priority: MEDIUM):**
- Duplicate the Reviews.io badge (or a condensed version — stars + score only) into the hero, near the CTA, per the Hero fix above.
- Once real Ford Ranger fitment photos exist, prioritize replacing the Hilux placeholders here specifically — a "Ford Ranger Fits" gallery showing Hilux vehicles is a credibility risk if a sharp-eyed visitor notices, not just an honesty placeholder.

### 4. Features and Benefits [Score: 6/10]
**Findings:**
- The "What Roof Racks Fit My Ford Ranger?" section (line 284-296) does real feature→benefit translation: it explains *why* roof-rail type matters (mounting system, load rating) rather than just listing rail types.
- Good use of bold lead-ins in the bulleted list (raised / flush / bare) for scannability.
- No icons or visuals accompany this section — it's a plain text block, which is a missed opportunity given the concepts (raised rail vs. flush rail vs. bare roof) are inherently visual and hard to picture from text alone.
- Positioned below the Fitment Gallery and Fit Finder, i.e. after the primary conversion ask, not before it — a visitor who doesn't already know their roof type has to fill in the Fit Finder's "Roof Type" field blind, then scroll down to learn what the options mean.

**Fixes (Priority: MEDIUM):**
- Add a simple 3-icon or 3-photo visual (raised rail / flush rail / bare roof) either inline in this section or as a compact reference directly beside the Fit Finder's "Roof Type" dropdown, since that's the field visitors are most likely to get wrong.

### 5. Objection Handling [Score: 7/10]
**Findings:**
- The FAQ (line 321-359) is genuinely thorough: installation, load limits, sunroof clearance, DIY vs. professional fit, universal vs. vehicle-specific, fuel economy, maintenance — this covers the real objection space well.
- A strong risk-reducer already exists in the body copy — "send us a photo of your roofline before you order" (line 296) — but it's buried in a paragraph, not surfaced as a proper callout or CTA.
- No formal risk reversal (no returns/warranty messaging on this page itself — it's in the footer's "Warranty"/"Refund & Exchange" links only, one click away).
- No pricing shown, which is appropriate for a make/model page (not a single SKU).

**Fixes (Priority: MEDIUM):**
- Turn the "send us a photo of your roofline" line into a small callout box or mini-CTA (e.g., "Not sure if you have rails? Send us a photo — [Get a quick check]") rather than leaving it inside a paragraph most visitors will skim past.

### 6. Call-to-Action [Score: 5/10]
**Findings:**
- Four CTAs total: hero "Change Vehicle," Fit Finder "View Results" (disabled until all 3 fields chosen), trust banner "Book An Installation" and "Store Finder."
- "Change Vehicle" — see Hero section above; mislabeled for this context.
- "View Results" is functionally correct but generic — it describes the mechanism (see results), not the value (what fits your Ranger).
- No supporting microcopy anywhere near the Fit Finder (e.g., "Takes 10 seconds," "No account needed") to lower the perceived effort of a 3-field form.
- No CTA repeats after the FAQ or brand strip — the page ends on a supplier-logo strip and then straight into the footer, with no final nudge back to the Fit Finder for a visitor who scrolled all the way through the educational content and FAQ without converting.
- Button text is first-person-neutral throughout ("Book An Installation" rather than "Book My Installation") — a minor miss against the first-person-CTA best practice.

**Fixes (Priority: HIGH):**
- Rename "View Results" to something benefit-specific, e.g. **"Show My Ranger's Racks"**.
- Add a final CTA block after the FAQ (before the brand strip or footer) that re-invites the visitor back to the Fit Finder — currently anyone who reads through the educational content and FAQ without converting hits a dead end.
- Add one line of microcopy under the Fit Finder row (e.g., "Takes less than 30 seconds — no account needed").

### 7. Footer and Secondary Elements [Score: 6/10]
**Findings:**
- Solid, complete footer: contact info (phone + email), store finder, policy links, social/payment icons, copyright.
- No links leading away from the page's purpose in a damaging way — footer links are the expected legal/informational set.
- No final CTA near the footer specific to this page's conversion goal (see CTA section above — this is the same gap, called out at both the CTA and footer boundary since it's the actual "bottom of page" the checklist asks about).
- No sticky/mobile CTA bar tied to the Fit Finder — the site does have a general sticky header (`.rrg-sticky-header`) for branding/cart, but it doesn't carry the page's specific conversion action as the visitor scrolls past it.

**Fixes (Priority: LOW):**
- Consider a lightweight sticky "Jump to Fit Finder" affordance on mobile once the visitor has scrolled past the widget, given how much educational content sits below it.

---

## Copy Score: 54/100
| Dimension | Score | Notes |
|---|---|---|
| Clarity | 6/10 | Headline is clear on topic, but the hero CTA ("Change Vehicle") and the "Toyota Hilux" session mismatch actively confuse first-time intent. |
| Urgency | 3/10 | No urgency device anywhere on the page — acceptable for an educational fitment page, but nothing nudges a browsing visitor to act now. |
| Specificity | 8/10 | Strongest dimension — generation names, trim levels, roof-rail terminology, store count are all concrete, not vague marketing-speak. |
| Proof | 5/10 | Real proof exists (reviews badge, fitment photos) but is placed mid-page, not reinforced near any decision point. |
| Action Orientation | 5/10 | Multiple CTAs exist but are generically worded and don't repeat after the content/FAQ sections — no path back to conversion for a visitor who scrolls to the bottom. |

---

## Form Audit
The Fit Finder (`#fitFinder`, line 219-253) is the page's only form:

| Element | Finding |
|---|---|
| Field count | 3 real required fields (Year, Body Style, Roof Type) — Make/Model are pre-locked to Ford/Ranger with a single option each, so they're effectively decorative on this page. Within best practice (3-5 fields). |
| Labels | Fields use `aria-label` only, not visible on-screen labels — the placeholder text ("Year", "Body Style", "Roof Type") lives inside the `<select>` itself and disappears once a value is chosen. A visitor who picks "2022 Onwards" and later glances back at the row has no visible label reminding them that's the Year field, only the FAQ-style options below to infer it from field position. |
| Button text | "View Results" is functional but generic — see CTA section fix above. |
| Error handling | N/A — no invalid states possible, button is simply disabled until all 3 fields are set (`prototypes/vehicle-category-landing/index.html:498-505`). This is a clean, low-friction pattern. |
| Multi-step | Single-step, appropriate given only 3 fields. |
| Required vs. optional | All 3 are required, correctly with no optional fields to mark. |
| Field types | Native `<select>` elements throughout — correct choice for constrained option sets like this. |
| Auto-fill | N/A for select-only forms. |

**Fix (Priority: MEDIUM):** Add visible field labels above (or as persistent small text below) each select, not just `aria-label` — once a value is selected the visitor loses the only cue for what that dropdown represents, which matters on a 5-column row like this.

---

## Mobile Audit
| Check | Finding |
|---|---|
| CTA thumb-reachable | Fit Finder's submit button spans full width at both the 900px and 520px breakpoints (`.ff-row .btn{grid-column:1/-1}`) — good, easy to reach and tap. |
| Body text ≥16px | Body copy runs 14-15px (`.vclp-hero p`, `.vclp-content p/li` all `font-size:14.5px` or `15px`) — below the 16px minimum guideline. Minor, but worth a pass once real content is finalized. |
| Form usability | Selects are native `<select>` elements, which get the OS's own picker UI on mobile — good, no custom dropdown to fight with. Select font-size is 14px (`.ff-row select`), under the 16px threshold that prevents iOS Safari's auto-zoom-on-focus — worth bumping to 16px so tapping a field doesn't zoom the whole page. |
| Images resize | Hero image and Fitment Gallery use `object-fit`/responsive containers — no fixed-pixel-width images that would overflow. |
| No horizontal scroll | Layout uses `.wrap` containers and grid-to-single-column collapses at 900px/520px — nothing in the CSS suggests horizontal overflow risk. |
| Load speed on 4G | Not measurable from static code — flagged under Page Speed below. |
| Click-to-call | Present and correctly implemented (`tel:1300071264` links in the FAQ and footer). |
| Sticky CTA on scroll | Site has a general sticky header for branding/cart, not one carrying this page's specific Fit Finder CTA — see Footer section fix. |

---

## Page Speed Impact Assessment
No live performance trace is available for a static prototype file, so this is a structural read of the code, not a Lighthouse/CrUX result:

- Two Google Font families loaded via a render-blocking `<link rel="stylesheet">` (line 9) — `preconnect` hints are already in place (lines 7-8), which helps, but the fonts themselves aren't preloaded or using `font-display` control beyond whatever the Google Fonts URL defaults to.
- 4 separate external stylesheets (`shared.css`, `mega-menu.css`, `admin-panel.css`, `footer.css`) and 5 external scripts — reasonable for a component-library approach, but each is a separate request; bundling/minifying before this goes live is worth a pass.
- Scripts are all placed just before `</body>` (line 446-450) — correct placement, non-blocking.
- The Fitment Gallery pulls its 16 photos live from `roofracksgalore.com.au`'s production CDN (line 458-474) rather than local prototype assets — on the real page this is expected (real product data), but it does mean this section's load time depends on an external host.

Per the skill's benchmark table, if real-world load time lands in the 3-5 second range once this goes live with production assets, expect roughly a 20% conversion hit versus a sub-2-second load — worth a real Lighthouse pass once this is deployed rather than left as a code-read estimate.

---

## A/B Test Recommendations
1. If we change the hero CTA from "Change Vehicle" to "Find My Ranger's Fit," then Fit Finder engagement will increase, because the current label implies the visitor already has a vehicle selected, which creates hesitation for first-time visitors.
2. If we move the Reviews.io 4.8/5 badge from the mid-page trust banner into the hero, then hero-to-Fit-Finder scroll-through will increase, because trust signals above the fold reduce early bounce before visitors reach the tool.
3. If we rename "View Results" to "Show My Ranger's Racks," then Fit Finder completion rate will increase, because outcome-specific CTA copy outperforms generic action-only copy.
4. If we add a 3-icon visual (raised rail / flush rail / bare roof) beside the Fit Finder's Roof Type dropdown, then Fit Finder completion rate will increase, because visitors currently have to scroll past the widget to a lower section to understand what the roof-type options mean.
5. If we add a final CTA block after the FAQ inviting visitors back to the Fit Finder, then bottom-of-page conversion will increase, because visitors who read through the educational content currently hit the brand-logo strip and footer with no re-prompt to convert.
6. If we increase the Fit Finder select font-size from 14px to 16px, then mobile form completion will increase, because sub-16px inputs trigger iOS Safari's auto-zoom on focus, which disrupts the input flow on a 5-field row.
7. If we surface the "send us a photo of your roofline" risk-reducer as its own callout instead of leaving it inside a paragraph, then Fit Finder engagement from uncertain visitors will increase, because it directly answers the single objection the page itself calls out as the most common mistake.
8. If we add microcopy ("Takes 30 seconds — no account needed") beneath the Fit Finder row, then form starts will increase, because it lowers the perceived effort of a 3-field tool before the visitor commits to it.
9. If we test the hero subheadline as a shortened, scannable 1-sentence version against the current 5-sentence paragraph, then hero engagement will increase, because the current copy is well-written but reads as body content rather than a scannable hook.
10. If we add a one-line differentiator near the hero or trust banner ("Australia's largest roof rack range — fitted nationwide at 35+ stores"), then trust-banner-to-Fit-Finder conversion will increase, because the page currently never states why a visitor should choose Roof Racks Galore specifically.

---

## Heat Map Interpretation Guidance
- **Expected attention zone:** F-pattern for the hero (H1 → CTA scanned first, long paragraph likely skimmed, not read in full) shifting to a straightforward top-to-bottom scroll pattern through the Fit Finder, Fitment Gallery, content, trust banner, and FAQ.
- **Predicted scroll depth:** Visitors who engage with the Fit Finder near the top are likely to drop off immediately after completing it (currently a dead-end alert) rather than continuing to the educational content — the real content/FAQ sections are more likely to be reached by visitors who *didn't* convert on the Fit Finder and are still evaluating.
- **Click-probability zones:** The Fit Finder's "View Results" button and the trust banner's two CTAs are the highest-probability click zones given their visual weight (dark widget, full-bleed banner). The hero's "Change Vehicle" button competes for attention with the Fit Finder directly below it — likely to see lower click-through than expected given the confusing label plus its proximity to a second, clearer CTA doing the same job.
- **Rage-click risk:** The disabled "View Results" button (grey/50% opacity while any field is empty) is a mild rage-click risk if visitors try clicking it before finishing all 3 fields, since there's no inline message explaining why it's disabled — a `title` attribute or small helper text would reduce this.
- **Dead zones:** The "Shop The Best Brands" logo strip (line 364-377) is likely a low-attention scroll-through zone — supplier logos this late in the page, with no CTA of their own, are unlikely to drive action either way.

---

## Prioritized Fix List

### Quick Wins (implement this week)
1. Fix the "Your Vehicle: Toyota Hilux" header mismatch on the Ranger page — highest-impact trust fix, likely a data-wiring issue rather than a design change.
2. Rename hero CTA "Change Vehicle" → "Find My Ranger's Fit" (or similar outcome-focused copy).
3. Rename Fit Finder CTA "View Results" → "Show My Ranger's Racks".
4. Bump Fit Finder select `font-size` from 14px to 16px to stop iOS auto-zoom on focus.
5. Add microcopy under the Fit Finder row ("Takes 30 seconds — no account needed").

### Medium-Term (implement this month)
1. Pull the Reviews.io 4.8/5 badge into the hero, above the fold.
2. Add a 3-icon/photo visual for roof-rail types beside the Fit Finder's Roof Type field.
3. Turn the "send us a photo of your roofline" tip into a proper callout/mini-CTA.
4. Add a final CTA block after the FAQ, re-inviting visitors back to the Fit Finder.
5. Add visible field labels to the Fit Finder row (not `aria-label`-only).

### Strategic (implement this quarter)
1. Build the real category/PLP page the Fit Finder is meant to hand off to — every fix above only matters once "View Results" leads somewhere real instead of an alert.
2. Replace the Fitment Gallery's placeholder Hilux photos with real Ford Ranger fitment photography once available.
3. Run a real Lighthouse/performance pass once this is deployed with production assets (fonts, CDN images) rather than relying on this code-level read.

---

## Before/After Wireframe Suggestions

**Hero — Current:**
```
[H1: Ford Ranger Roof Racks]          [Ford Ranger photo]
[5-sentence paragraph...............]
[Change Vehicle]
```

**Hero — Recommended:**
```
[H1: Ford Ranger Roof Racks]          [Ford Ranger photo]
[★★★★★ 4.8/5 on Reviews.io · 35+ stores nationwide]
[1-sentence hook: no two Rangers fit the same rack —
 find yours in 30 seconds]
[Find My Ranger's Fit →]
```

**Fit Finder row — Current:**
```
[Make ▾][Model ▾][Year ▾][Body ▾][Roof ▾][View Results]
```

**Fit Finder row — Recommended:**
```
Year          Body Style      Roof Type  (?)
[Year ▾]      [Body ▾]        [Roof ▾]   [icon row: 3 roof types]
        [Show My Ranger's Racks →]
        Takes 30 seconds — no account needed
```

**Page end — Current:**
```
[FAQ accordion]
[Shop The Best Brands: logo strip]
[Footer]
```

**Page end — Recommended:**
```
[FAQ accordion]
[CTA band: "Ready to see what fits your Ranger?" → back to Fit Finder]
[Shop The Best Brands: logo strip]
[Footer]
```
