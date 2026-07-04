# Improvement Agent — Standing Run Instructions

This is the prompt the scheduled agent runs each cycle. It turns the site's own
analytics into **one** evidence-backed, scoped improvement PR per cycle. It is
the "brain"; [`scripts/analytics-snapshot.mjs`](../../scripts/analytics-snapshot.mjs)
is the "eyes"; the existing Azure Static Web Apps CI/CD is the "hands".

> **Runtime:** executed weekly by
> [`.github/workflows/improvement-agent.yml`](../../.github/workflows/improvement-agent.yml)
> (GitHub Actions cron, via `claude-code-action`). The workflow logs in to Azure
> with the existing OIDC federated identity, runs the snapshot against App
> Insights `appi-vows-prod-eus-001`, and opens a PR only — it never merges or
> deploys. A merge to `main` is what deploys (SWA), and that is a human action.

> **Read first, every run:** `docs/agent/improvement-agent-scope.md` (the hard
> allow/deny boundary) and `BRAND_GUIDELINES.md` (voice). This site is
> **English-only** — a copy change touches one language, no locale fan-out.

---

## Operating rules (non-negotiable)

- **Propose only.** Open a PR; never merge, never push to `main`, never
  force-push, never `gh pr merge`, never deploy.
- **One experiment per cycle.** Pick the single highest-impact leak. Do not
  batch. Attribution dies when changes stack.
- **Stay in scope.** Only edit surfaces in the Phase-1 allow-list. If the best
  idea is out of scope, write it up in the PR as a "deferred suggestion" — do not
  implement it.
- **Don't open a new PR** while the previous experiment's observation window is
  still open (check `docs/experiments/EXPERIMENTS.md`). Instead, post the current
  snapshot as a comment on that experiment's PR and stop.

---

## Cycle steps

### 1. Read the funnel
The workflow has already run the snapshot for you and written two files (paths
are given in the workflow prompt): a **7-day** and a **30-day** window. Read both.
If you need to run it yourself:

```bash
node scripts/analytics-snapshot.mjs --app appi-vows-prod-eus-001 \
  --resource-group mci-wedding-website --window 7
```

Key fields: `primary_leak`, `funnel[]` (`rate` vs `target`, `est_sessions_lost`,
`valid`), `deltas_vs_prior`, `regressions`, `engagement`, `targets`. If the
snapshot errored, or `primary_leak` is `null` **and** `regressions` is empty
(every stage at/above target), STOP and do nothing — do not open a PR.

The funnel stages (matching the workbook `funnel-tiles` / `funnel-rates`):

| Stage | Rate | Natural copy lever |
|---|---|---|
| Session → `/contact` viewed | `session_to_contact` | site-wide CTA labels / hero + section CTAs that route to `/contact` |
| `/contact` viewed → Form started | `contact_to_form` | contact-page eyebrow/heading/intro copy that gets a visitor to touch the first field |
| Form started → Enquiry submitted | `form_to_enquiry` | form field labels, submit button, trust/value microcopy (the standing **abandonment** leak) |
| Session → Enquiry (lead) | `session_to_lead` | overall — usually addressed via whichever sub-stage leaks most |

### 2. Decide the target
- If `regressions` is non-empty, a regression takes priority over a steady-state
  leak — something got worse; find out what shipped recently (`git log`).
- Otherwise act on `primary_leak` (ranked by `est_sessions_lost`).
- Ignore stages with `valid: false` (non-nested ratio — a measurement artefact,
  not a real leak).

### 3. Form a hypothesis
State it plainly, tied to a **named telemetry event** you'll watch
(`PageView` of `/contact`, `ContactFormStarted`, `CtaClick`, `EnquirySubmitted`).
Example: *"`form_to_enquiry` is 25% (target 35%), ~N sessions/week lost. The
submit CTA (`Send My Enquiry`) is effort-framed; reframing it around the benefit
plus a no-obligation reassurance should lift form→submit."*

### 4. Implement (inside the allow-list)
- Copy change → edit the string literal(s) in the file(s) named in
  `improvement-agent-scope.md`. Text content only; do not touch markup structure,
  attributes, handlers, telemetry calls, or logic.
- Remember the home-page process steps are **duplicated** (desktop + mobile) —
  edit both.
- Keep the diff minimal and on-brand.

### 5. Record the experiment
Append one row to `docs/experiments/EXPERIMENTS.md`: date, hypothesis, files,
**primary metric**, baseline value (from the snapshot), target, observation window
(default **14 days**), status `OPEN`. Put the **branch slug** (e.g. `agent/exp-…`)
in the PR column — NOT a PR number. The number isn't known until after the push,
and filling it in later means a second commit that needlessly re-triggers CI.
This row goes in the **same commit** as the copy change.

### 6. Open the PR
Branch: `agent/exp-<YYYY-MM-DD>-<short-slug>`. Make **exactly one commit** (copy
change + ledger row together), push it **once**, then open the PR. **Do NOT push
any further commits after `gh pr create`** — a second push fires another
`pull_request` event that races the Static Web Apps preview deploy.

```bash
git switch -c agent/exp-2026-07-10-form-submit-cta
git add -A && git commit -m "exp: <hypothesis one-liner> (copy)"
git push -u origin HEAD
gh pr create --base main --assignee nik-mci --title "exp: <one-liner>" --body-file <body>
# stop here — do not commit or push again on this branch
```

**The FIRST line of the PR body MUST be:**
`cc @nik-mci — new improvement-agent experiment for review.`
so GitHub notifies the maintainer (who reviews and merges on Fridays from the
GitHub mobile app).

**PR body shape (required):**

```
cc @nik-mci — new improvement-agent experiment for review.

## Evidence
<snapshot numbers — stage rate, target, est sessions lost, delta vs prior; cite 7d and 30d>

## Hypothesis
<what I think is wrong and why this change should help>

## Change
<files touched + rationale; confirm in-scope + on-brand>

## Primary metric to watch
<event / funnel rate> — baseline <value>, expect <direction/size>

## Observation window
<N days> (no second experiment until this closes)

## Rollback
Revert this PR — single clean revert, no follow-on.
```

Then **stop**. Do not open another PR this cycle.

---

## After merge (next cycle, when the window closes)
Re-run the snapshot for the post-merge window, compare the primary metric to
baseline, and fill in the ledger verdict (`WIN` / `FLAT` / `REGRESS` → revert).
Only then is the agent free to start the next experiment.

---

## Guardrail self-check before every PR
- [ ] Exactly one experiment.
- [ ] Diff entirely inside `improvement-agent-scope.md` allow-list (copy text only).
- [ ] On-brand per `BRAND_GUIDELINES.md`; no unkeepable promises.
- [ ] Home-page duplicated (desktop/mobile) copy updated in both places if touched.
- [ ] PR body starts with the `cc @nik-mci` line and has Evidence + Hypothesis +
      Primary metric + Window + Rollback.
- [ ] No experiment currently OPEN in its window.
- [ ] Exactly one commit; no further push after `gh pr create` (ledger PR column = branch slug).
- [ ] Not merging / deploying — proposing only.
