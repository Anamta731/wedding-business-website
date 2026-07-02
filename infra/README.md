# Infrastructure — Vows & Vedas monitoring

Bicep for the analytics dashboard backend. Deploying [monitoring.bicep](monitoring.bicep)
creates everything the dashboard needs **except** the connection-string wiring
(step 2) and the code deploy (step 3).

## What `monitoring.bicep` provisions

| Resource | Name | Notes |
|---|---|---|
| Log Analytics workspace | `law-vows-prod-eus-001` | East US, 90-day retention |
| Application Insights | `appi-vows-prod-eus-001` | workspace-based; the name the app's `APPLICATIONINSIGHTS_CONNECTION_STRING` targets |
| Workbook | *Vows & Vedas — Whole-Site Analytics* | deployed from `workbook/vows-vedas-comprehensive.workbook` |
| Workbook | *Vows & Vedas — Enquiry Analytics* | deployed from `workbook/vows-vedas-analytics.workbook` |

All resources carry the 7 mandatory MCI tags (mirroring the `mci-wedding-website` RG).

## Prerequisites

- Azure CLI logged in to the **mci-prod-0004-IndAI Solutions** subscription
  (`az account show`), with rights to create resources in `mci-wedding-website`.
- Contributor on the RG (via PIM per MCI RBAC).

## Step 1 — Deploy the Bicep

```bash
# Optional: preview the changes first
az deployment group what-if -g mci-wedding-website -f infra/monitoring.bicep

# Deploy
az deployment group create -g mci-wedding-website -f infra/monitoring.bicep
```

To override tags/region, pass parameters, e.g. `-p location=eastus`.

## Step 2 — Wire the connection string into the Static Web App

The site host is the Static Web App `wedding-website-mci`. The telemetry code
(`src/lib/telemetry.js`, `src/app/api/track/route.js`) reads
`APPLICATIONINSIGHTS_CONNECTION_STRING` server-side.

```bash
# Read the connection string from the freshly created resource
CS=$(az resource show -g mci-wedding-website \
      --resource-type microsoft.insights/components \
      -n appi-vows-prod-eus-001 \
      --query properties.ConnectionString -o tsv)

# Set it on the Static Web App (server-side app setting)
az staticwebapp appsettings set -n wedding-website-mci -g mci-wedding-website \
  --setting-names "APPLICATIONINSIGHTS_CONNECTION_STRING=$CS"
```

> Do **not** create a `NEXT_PUBLIC_` variant — the key must stay server-side.

## Step 3 — Deploy the instrumentation code

The whole-site events (`PageView`, `CtaClick`, `ChatbotOpened`, …) live on
`mci-nik`. Production deploys from `main`, so open a PR **`mci-nik → main`** and
merge (coordinate with `mci-anam` — it touches `workbook/` and the contact API).
The pre-existing `EnquirySubmitted` event is already on `main`, so it starts
flowing as soon as step 2 is done, even before the merge.

## Step 4 — Verify

After a deploy + a few page loads, run in App Insights → Logs (latency ~1–3 min):

```kql
customEvents | where timestamp > ago(1h) | summarize count() by name | order by count_ desc
```

Then open **Workbooks → Vows & Vedas — Whole-Site Analytics** (deployed by step 1).

## Governance notes (per the MCI DevOps conventions)

- **Region:** East US is AME/non-EUR. This is consistent with the app's existing
  non-EUR resources (a pre-existing, app-wide data-residency posture), not a new
  exception introduced here. If IT MCI requires a formal §18 record, scope it to
  the wedding workload as a whole.
- **Central LAW / Sentinel:** App Insights data lands in the dedicated
  `law-vows-prod-eus-001`. To also forward diagnostics to the central security
  workspace (`law-mci-sec-001`), request its resource id from IT MCI and add a
  `Microsoft.Insights/diagnosticSettings` resource here.
- **Private ingestion:** ingestion is public, which suits this Online (public
  website) workload. Locking it down would require an Azure Monitor Private Link
  Scope (AMPLS) — a separate hardening task.
