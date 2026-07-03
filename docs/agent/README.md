# The analytics → improvement loop

An autonomous, human-gated loop that turns the site's own Application Insights
analytics into small, evidence-backed copy experiments — one PR per week, which
you review and merge from the GitHub mobile app on Fridays.

It is a port of the system running on the GeTS chatbot, adapted for Vows & Vedas
(Azure Static Web Apps + App Insights `customEvents`, English-only inline copy).

## The four parts

| Part | File | Role |
|---|---|---|
| **Eyes** | [`scripts/analytics-snapshot.mjs`](../../scripts/analytics-snapshot.mjs) | Reads the funnel from App Insights (KQL) → one JSON blob (leak, targets, deltas, regressions). Read-only. |
| **Brain** | [`improvement-agent-prompt.md`](improvement-agent-prompt.md) + [`improvement-agent-scope.md`](improvement-agent-scope.md) | Standing instructions + the hard allow/deny boundary. |
| **Hands** | [`.github/workflows/improvement-agent.yml`](../../.github/workflows/improvement-agent.yml) | Weekly cron. Runs the snapshot, then Claude, which opens ONE PR. Never merges/deploys. |
| **Gate** | [`.github/workflows/claude-code-review.yml`](../../.github/workflows/claude-code-review.yml) + [`claude.yml`](../../.github/workflows/claude.yml) + **you** | Independent AI review on every PR + `@claude` responder. You merge on Fridays. |
| **Ledger** | [`docs/experiments/EXPERIMENTS.md`](../experiments/EXPERIMENTS.md) | One row per experiment. `OPEN` → `WIN`/`FLAT`/`REGRESS`. Enforces one-at-a-time. |

The weekly flow: **cron fires (Fri 06:00 UTC) → snapshot reads the funnel → Claude
picks the biggest leak → opens ONE scoped copy PR (`cc @nik-mci`) → the reviewer
workflow comments on it → you read it on GitHub mobile and merge (or close) → SWA
auto-deploys from `main` → next week the loop reads whether the metric moved and
records the verdict.**

---

## Activation runbook (one-time)

Nothing runs until these are done. Steps 1–3 are on **you** (need Azure/GitHub
admin); the code (this repo) is already in place once merged to `main`.

### 1. Install the Claude GitHub App + save the OAuth token
From this repo's directory:

```bash
claude /install-github-app
```

This installs the Claude GitHub App (Contents read + Issues/PRs write) and saves
the **`CLAUDE_CODE_OAUTH_TOKEN`** repo secret used by all three Claude workflows.
No Anthropic API key is stored. If it opens an auto-generated PR adding its own
sample workflows, **close it** — the workflows in this repo supersede it.

### 2. Let the deploy identity read App Insights
The snapshot runs under the **existing** OIDC federated identity
(`AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_SUBSCRIPTION_ID` — already set for
the SWA deploy). That service principal needs read+query on the App Insights
component. If it already has **Contributor** on `mci-wedding-website`, querying
works out of the box. Otherwise grant least-privilege:

```bash
# App (client) id of the deploy service principal = the AZURE_CLIENT_ID secret
az role assignment create \
  --assignee <AZURE_CLIENT_ID> \
  --role "Monitoring Reader" \
  --scope "$(az resource show -g mci-wedding-website \
             --resource-type microsoft.insights/components \
             -n appi-vows-prod-eus-001 --query id -o tsv)"
```

Also confirm the OIDC **federated credential** on that app registration allows the
scheduled run — scheduled workflows run on `main`, so it needs a subject for
`repo:<org>/<repo>:ref:refs/heads/main` (the push-to-main deploy already uses
this, so it is usually already present).

### 3. Merge this to `main`
The scheduled workflow only runs from the default branch. Open a PR
`mci-nik → main` and merge. After that the cron is live.

### 4. (First run) calibrate targets
Trigger the workflow manually (Actions → *Improvement Agent (weekly)* → *Run
workflow*, or `gh workflow run improvement-agent.yml`). Read the snapshot it logs,
then tune the **seed** `TARGETS` in `scripts/analytics-snapshot.mjs` to realistic
numbers for actual traffic and commit them. Until calibrated, the "leak" ranking
is only as good as the seed targets.

---

## Guardrails (why this is safe)

- **Propose-only.** The agent opens PRs; it cannot merge, push to `main`, or
  deploy. Branch protection + your review are unaffected.
- **Copy-only Phase 1.** The worst a bad suggestion can do is a `git revert` — no
  logic, telemetry, infra, or secret is in the agent's allow-list
  (`improvement-agent-scope.md`).
- **One at a time.** The ledger blocks a second experiment until the first gets a
  verdict, so every change is individually attributable.
- **Independent review.** `claude-code-review.yml` comments on the agent's own PRs
  — the author is never the only check.

## Governance notes (MCI)
- **Data egress:** the review + agent send repo code to Anthropic for processing.
  Same posture as the GeTS chatbot loop; note in `docs/compliance/` if a formal
  §18 record is required. **ZDR** orgs must use this self-hosted Action (not the
  managed Code Review service) — which is what this is.
- **Cost:** small copy diffs → low per-run cost. One scheduled run/week + one
  review per PR.
