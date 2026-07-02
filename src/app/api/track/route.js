import { trackEvent } from "@/lib/telemetry";

// Client telemetry ingestion. The browser (src/lib/clientTelemetry.js) POSTs
// small JSON payloads here via navigator.sendBeacon; we forward them to
// Application Insights using the server-side emitter, keeping the connection
// string off the client. Always responds 204 so a failed beacon is invisible.

// Only these client-emitted events are accepted. EnquirySubmitted is emitted
// directly by the contact API (server-side) and is intentionally NOT allowed
// here — the client cannot forge a submission.
const ALLOWED_EVENTS = new Set([
  "PageView",
  "CtaClick",
  "ChatbotOpened",
  "ChatbotFirstMessage",
  "ContactFormStarted",
  "HashtagGenerated",
  "ClientError",
]);

const MAX_PROPS = 20; // cap distinct custom dimensions per event

function clip(value, max) {
  if (value == null) return "";
  const s = typeof value === "string" ? value : String(value);
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req) {
  try {
    // sendBeacon may send as application/json or text/plain; parse defensively.
    const raw = await req.text();
    if (!raw) return new Response(null, { status: 204 });

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return new Response(null, { status: 204 });
    }

    const name = typeof body?.name === "string" ? body.name : "";
    if (!ALLOWED_EVENTS.has(name)) {
      return new Response(null, { status: 204 });
    }

    // Whitelist + clip properties. Everything becomes a short string; long
    // free-text (e.g. an error message) is truncated hard to avoid storing PII.
    const props = body && typeof body.properties === "object" && body.properties ? body.properties : {};
    const safeProps = {};
    let count = 0;
    for (const [k, v] of Object.entries(props)) {
      if (count >= MAX_PROPS) break;
      if (typeof k !== "string" || !k || k.length > 40) continue;
      safeProps[k] = clip(v, k === "message" ? 200 : 256);
      count += 1;
    }
    safeProps.sessionId = clip(body?.sessionId, 64);
    safeProps.userId = clip(body?.userId, 64);
    safeProps.path = clip(body?.path, 256);

    // Await so the ingestion POST completes before the serverless function is
    // frozen. trackEvent swallows its own errors and no-ops without a config.
    await trackEvent(name, safeProps);

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
