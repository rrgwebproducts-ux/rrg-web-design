---
description: Show the outstanding PDP backlog from spec.md, let Brenton pick an item, then plan and get sign-off before building anything.
---

This command can start a brand-new chat with no other context loaded — assume nothing is known yet and (re)establish it from the project files below before doing anything else.

## Step 1 — Surface what's outstanding

Read `spec.md` in full, not just Section 10 — outstanding backlog items live in more than one section (e.g. Section 10's own A/B/C/D subsections, and later backlogs such as Section 12's dev-brief review list; treat every numbered/lettered backlog-style list in the file as in scope, not just the first one found). Build a numbered list of every item still marked **⬜** (skip anything ✅ or otherwise marked done, and skip 🤔/💬-flagged items that are explicitly "needs a separate discussion, not scoped yet" rather than pickable work — list those separately if present, don't fold them into the numbered pick-list). Keep each item's own existing number from spec.md, don't renumber — if two sections both use small numbers (e.g. two "item 3"s), prefix with the section so the list stays unambiguous (e.g. "10.A-3", "12-3"). For each, give a one-line plain-English summary (what it is, not the full spec.md wording).

Present that list to Brenton and ask which item he wants to pick up this session. If the combined list is short enough (≤4 items), you may offer it via `AskUserQuestion`; otherwise just list it in text and ask directly which one.

Don't include anything outside spec.md's own backlog-style lists unless Brenton explicitly asks for it (e.g. Section 7's data gaps are a different kind of outstanding item, not part of "the backlog," unless a section elsewhere explicitly numbers them as backlog items).

## Step 2 — Re-ground yourself in that specific item

Once a number is picked, before proposing anything:
- Re-read that item's full text in spec.md — it's often denser than the one-line summary (design context, prior decisions, cross-references).
- Check `docs/PAGE-GLOSSARY.md` for the correct name of anything it touches.
- Check whether `docs/pdp/DEVELOPER-BRIEF.md` already documents the surrounding area (relevant if this item touches something already handed over).
- Skim this project's memory files for standing preferences relevant to this specific item (component/layout conventions, prior client feedback on the same widget, etc.) — don't re-ask something already answered in an earlier session.

## Step 3 — Plan, don't build yet

Call `EnterPlanMode`. While in plan mode:
- Use `AskUserQuestion` to clarify whatever this specific item genuinely needs clarified. **Always include, explicitly, every session, no exceptions:** does this item have region-specific requirements or differences (AU/NZ/UK) — given the ongoing Region Selector work in spec.md Section 10.D, most widget-level work now has a real chance of touching this, and it's easy to miss if not asked directly. Ask this even if the item looks obviously region-agnostic — let Brenton rule it out rather than assuming.
- Also ask about anything else genuinely ambiguous about the item itself — open questions already flagged in spec.md (Section 4, Section 7), unclear scope, a design/structural decision with real trade-offs. Don't ask about things spec.md already answers.
- Once clarified, draft the actual plan — approach, which files/templates are touched, any design decisions and why, and whether the region-selector cascade (if relevant) needs new hooks added to `applyRegion()` per the pattern in `docs/pdp/DEVELOPER-BRIEF.md` Section 4.
- Call `ExitPlanMode` to present the plan for approval.

**Do not write or edit any project file before `ExitPlanMode` is approved.** If Brenton asks for changes to the plan, revise and re-present it — don't start building on an unconfirmed plan.

## Step 4 — Build

Only after explicit sign-off: implement it, following this project's established conventions (plain HTML/CSS/JS in `prototypes/`, the shared component library in `prototypes/_shared/`, the Demo State Panel pattern for previewable states, real scraped/sourced data over placeholders wherever possible). Update spec.md's own status marker for that item (⬜→✅) and its build-status log (Section 9) the way every prior session has, using Playwright to verify the change actually works before calling it done.

**Do not touch `docs/pdp/DEVELOPER-BRIEF.md` or push to git as part of this** — both are gated on Brenton's separate, explicit sign-off (see this project's own memory on both), which is a different approval step from the plan approval in Step 3.
