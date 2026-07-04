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
| — | — | _(no experiments yet — the first cycle will append here)_ | — | — | — | — | — | — | — | — |

<!--
Row template (copy, fill, remove the comment).
PR column = the branch slug (agent/exp-…), NOT a PR number — recording the number
would require a second commit that re-triggers CI (see improvement-agent-prompt.md §6):
| 1 | 2026-07-10 | Reframe Send My Enquiry CTA around benefit + no-obligation to lift form→submit | src/app/contact/page.js | form_to_enquiry rate | 25% (7d) / 27% (30d) | ≥35% | 14d | agent/exp-2026-07-10-form-submit-cta | OPEN | — |
-->
