// Lightweight client-side telemetry.
// Emits structured custom events to /api/track, which forwards them to
// Application Insights via the server-side emitter in src/lib/telemetry.js.
//
// Design notes:
//  - The App Insights connection string stays server-side only (no NEXT_PUBLIC
//    key exposed to the browser). The browser only ever POSTs to our own route.
//  - Every call is a safe no-op during SSR or if the beacon/fetch fails.
//    Telemetry must NEVER break the UI.
//  - Session + anonymous user IDs are generated here so PageView, CtaClick and
//    EnquirySubmitted can be joined into a single funnel in the workbook.

const SID_KEY = "vv_sid"; // per-tab session (sessionStorage)
const UID_KEY = "vv_uid"; // anonymous, persistent visitor (localStorage)

function uuid() {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through to manual generation */
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Anonymous, persistent visitor id. "" during SSR or if storage is blocked. */
export function getUserId() {
  if (typeof window === "undefined") return "";
  try {
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
      uid = uuid();
      localStorage.setItem(UID_KEY, uid);
    }
    return uid;
  } catch {
    return "";
  }
}

/** Per-tab session id, shared across PageView / CtaClick / Chatbot / Enquiry. */
export function getSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = uuid();
      sessionStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

/**
 * Emit a custom event. `name` must be one of the whitelisted names accepted by
 * /api/track (see that route); anything else is silently dropped server-side.
 */
export function trackClient(name, properties = {}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      name,
      sessionId: getSessionId(),
      userId: getUserId(),
      path: window.location ? window.location.pathname : "",
      properties: properties || {},
    };
    const body = JSON.stringify(payload);
    const url = "/api/track";

    // sendBeacon survives navigation (essential for tel:/mailto:/wa.me clicks
    // that unload the page). Same-origin, so no CORS preflight.
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }

    // Fallback for browsers without sendBeacon or if the queue was full.
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let telemetry throw into the UI.
  }
}
