# Vows & Vedas — Azure Analytics Workbooks

Azure Monitor (Application Insights) workbooks for the Vows & Vedas site, plus
the telemetry that feeds them. Modeled on the GeTS Chatbot comprehensive
workbook, but tailored to the **whole site** rather than just the chatbot.

## Files

| File | Scope |
|---|---|
| `vows-vedas-comprehensive.workbook` | **Whole-site analytics** — traffic, pages, acquisition, full conversion funnel, CTA channels, enquiries, chatbot, tools, timing, errors. |
| `vows-vedas-analytics.workbook` | Enquiry-only deep dive (the original, built on `EnquirySubmitted`). Kept as a focused companion view. |

## Azure resource

- **Application Insights:** `appi-vows-prod-eus-001`
- **Resource group:** `mci-wedding-website`
- **Region:** East US (`eastus`)

## How telemetry flows

```
Browser (src/lib/clientTelemetry.js)
  → navigator.sendBeacon("/api/track")          [same-origin, key stays private]
    → src/app/api/track/route.js                [whitelists event names, clips props]
      → src/lib/telemetry.js  (trackEvent)      [App Insights REST ingestion]
        → customEvents table in appi-vows-prod-eus-001
```

The connection string is **server-side only** (`APPLICATIONINSIGHTS_CONNECTION_STRING`);
the browser never sees it. If the variable is unset, every `trackEvent` call is a
silent no-op — telemetry never breaks the site. `EnquirySubmitted` is emitted
directly by the contact API (server-side) and is intentionally **not** accepted
by `/api/track` so it cannot be forged from the client.

### Configuration

1. Set `APPLICATIONINSIGHTS_CONNECTION_STRING` in the app's environment
   (Portal → App Insights → Overview → Connection String).
2. The app identity needs the **Monitoring Metrics Publisher** role on
   `appi-vows-prod-eus-001` (already noted in `.env.example`).

## Event dictionary

All events land in `customEvents`; every event carries `sessionId`, `userId`,
and `path` custom dimensions. A shared per-tab `sessionId` (+ persistent
anonymous `userId`) ties the funnel together.

| Event | Fired from | Extra dimensions |
|---|---|---|
| `PageView` | every route change (`PageTracker.js`) | `referrerDomain` (external, entry only), `isEntry` |
| `CtaClick` | phone / WhatsApp / email links | `channel` (`phone`\|`whatsapp`\|`email`), `location` (`chatbot`\|`contact_page`) |
| `ChatbotOpened` | chatbot opens (`Chatbot.js`) | `sourcePagePath` |
| `ChatbotFirstMessage` | first user message per session | `sourcePagePath` |
| `ContactFormStarted` | first focus on the contact form | `sourcePagePath` |
| `EnquirySubmitted` | contact API (server-side) | `sourcePagePath`, `referrerUrl`, `destination`, `weddingDate`, `intentLevel`, `hasChatbotContext`, `budgetTier`, `citiesExplored`, `venuesViewed` |
| `HashtagGenerated` | hashtag tool | `count`, `vibe` (never the couple's names) |
| `ClientError` | uncaught JS error / promise rejection | `message` (≤200 chars), `source` |

**Privacy:** no names, emails, phone numbers, or free-text messages are sent as
telemetry — only structured, categorical fields. Error messages are hard-clipped.

## Importing / updating a workbook in Azure

1. Portal → **Application Insights** → `appi-vows-prod-eus-001` → **Workbooks**.
2. **+ New** → open the **Advanced Editor** (`</>` gear icon).
3. Paste the contents of the `.workbook` file, click **Apply**, then **Save**
   (Subscription/RG/region as above). Name it e.g. *Vows & Vedas — Whole-Site Analytics*.
4. To update later: open the workbook → **Edit** → Advanced Editor → paste the
   new JSON → Apply → Save. Keep this repo file as the source of truth.

## Notes / follow-ups

- **Footer** social/outbound links are not yet instrumented (Footer is a server
  component with no phone/WhatsApp/email CTAs; its "WhatsApp" link routes to
  `/contact`, already captured by `PageView`). Add an `OutboundLinkClick` event
  if outbound social tracking is wanted.
- Timing tiles are in **UTC**. Adjust the KQL (`hourofday(timestamp + 5h30m)`)
  if you want IST buckets.
- Data appears only after a build with the connection string is deployed and
  real traffic flows.
