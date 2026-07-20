# Experiment Ledger

The attribution backbone for the autonomous improvement agent (and any human
running a funnel experiment). **One row per shipped experiment.** This is what
makes "did it work?" answerable: because concurrent changes confound A/B reads,
we run **one experiment at a time** and don't start the next until the current
one's observation window closes and gets a verdict.

See [`docs/agent/improvement-agent-prompt.md`](../agent/improvement-agent-prompt.md)
for how rows get created and closed, and
[`docs/agent/improvement-agent-scope.md`](../agent/improvement-agent-scope.md)
for what may be changed.

## Conventions
- **Status:** `OPEN` (window running) → `WIN` / `FLAT` / `REGRESS`.
  A `REGRESS` must be reverted; note the revert PR.
- **Primary metric:** a single named telemetry event or funnel rate (e.g.
  `EnquirySubmitted`, `ContactFormStarted`, the `form_to_enquiry` rate).
- **Window:** default 14 days. No new experiment opens while a row is `OPEN`.
- **Baseline / Result:** value of the primary metric (or its funnel rate) for the
  window before merge vs the equivalent window after — read via
  `node scripts/analytics-snapshot.mjs`.

## Ledger

| # | Date opened | Hypothesis (one line) | Files | Primary metric | Baseline | Target | Window | PR | Status | Result / verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-07-03 | Sticky nav CTA "Begin Your Journey" is abstract about what happens next; aligning it with the hero's proven "Plan Your Wedding" phrasing should reduce ambiguity and lift session→contact click-through | src/components/Navigation.js | session_to_contact rate | 0% (7d) / 0% (30d) | ≥12% | 14d | #7 | FLAT | Inconclusive - window ended early 2026-07-10 (day 7 of 14) to resume the loop; ~5-8 sessions too thin to read session_to_contact. |
| 2 | 2026-07-13 | Home page final-CTA button "Start Planning →" is abstract about what a click actually starts; reframing it as "Share Your Vision →" (echoing the contact page's own "Tell Us About Your Dream Day" framing) gives visitors who scroll to the bottom without converting a concrete, personal reason to click through, lifting session→contact click-through | src/app/page.js | session_to_contact rate | 13.77% (7d) / 13.77% (30d) | ≥15% | 14d | agent/exp-2026-07-13-final-cta-vision | OPEN | — |
| 3 | 2026-07-19 | form_to_enquiry regressed to 30% (7d, was 57% prior 7d) and sits at 44% (30d), both under the 55% target — no shipped logic change blocks submission, so this reads as last-step abandonment; the submit CTA "Send My Enquiry" is transactional/effort-framed, while the field right above it is already named "Tell Us Your Vision" — echoing that language on the button should feel like continuing a thought rather than filing a request, reducing hesitation at the final click | src/app/contact/page.js | form_to_enquiry rate | 30% (7d) / 44% (30d) | ≥45% | 14d | agent/exp-2026-07-19-form-submit-cta | OPEN | — |

<!--
Row template (copy, fill, remove the comment).
PR column = the branch slug (agent/exp-…), NOT a PR number — recording the number
would require a second commit that re-triggers CI (see improvement-agent-prompt.md §6):
| 1 | 2026-07-10 | Reframe Send My Enquiry CTA around benefit + no-obligation to lift form→submit | src/app/contact/page.js | form_to_enquiry rate | 25% (7d) / 27% (30d) | ≥35% | 14d | agent/exp-2026-07-10-form-submit-cta | OPEN | — |
-->
