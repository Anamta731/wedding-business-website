/**
 * Phase 0 — pure conversation-doc builder (site writes, copilot reads).
 *
 * Doc shape (PLAN §3 / DECISIONS D-030): camelCase; `id === sessionId` and pk = /sessionId so the
 * copilot's `getConversationsContainer` reader can point-read by sessionId. The site uses snake_case
 * `session_id` on the wire — callers map it to `sessionId` here (the snake→camel rule, D-030).
 *
 * Pure + node-testable (no Cosmos/Next imports). The route does the read-merge-upsert I/O.
 */
export const MAX_TURNS = 200; // bound doc size (defensive; ~one visit's chat)

/**
 * Retention (copilot register D-056 / Q-BIZ-10, Nik 2026-07-30): a conversation that never converted is
 * purged 180 days after its last message; one that fired or was linked to a lead is kept indefinitely.
 * The container already carries `defaultTtl: -1`, so per-item TTL only needed values written.
 * Disclosed in the published privacy policy §2 ("saving full chat conversations … so our team can
 * follow up on your enquiry more effectively") — this enacts it, it does not extend it.
 */
export const RETENTION_TTL_SECONDS = 180 * 24 * 60 * 60; // 15_552_000
export const TTL_KEEP_FOREVER = -1;

/**
 * Per-item `ttl` for a conversation doc. Recomputed on EVERY upsert (not carried from `base`) so a
 * session that converts mid-chat flips to keep-forever on its next turn.
 *
 * NOTE the gap this cannot close, and why /api/lead-notify must set `ttl` too: if the lead fires on the
 * FINAL turn there is no subsequent persistTurn upsert, so the doc would keep its 180-day clock despite
 * having converted. lead-notify is the only writer that can fix that case (D-056 §4).
 *
 * A conversation LINKED to a copilot lead (rather than auto-fired) cannot be exempted here at all — the
 * copilot has Data Reader only on this database, so it snapshots the transcript onto the lead instead
 * and treats this doc as a cache that may vanish (D-056 §5).
 */
export function retentionTtl({ leadFired = false, status = "active" } = {}) {
  return leadFired || status === "converted" ? TTL_KEEP_FOREVER : RETENTION_TTL_SECONDS;
}

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_RUN_RE = /\+?\s*\d(?:[\s.-]*\d){9,14}/g;

/**
 * Split the lead form's single free-text "Phone / Email" field into parts, so the conversation doc
 * carries a machine-readable contact the copilot can match a lead against. Live prod docs had ALL
 * contact fields null despite `leadFired: true`, which broke conversation↔lead matching entirely.
 *
 * Conservative: Indian mobiles only (10 digits starting 6-9, optional +91/0091/091/leading-0), and the
 * ORIGINAL string is preserved as `raw` so a mis-split never loses what the visitor actually typed.
 */
export function parseLeadContact(contact) {
  const s = contact == null ? "" : String(contact);
  const raw = s.trim() || null;
  const email = s.match(EMAIL_RE)?.[0]?.toLowerCase() ?? null;

  let phone = null;
  for (const m of s.matchAll(PHONE_RUN_RE)) {
    const d = m[0].replace(/\D/g, "");
    const bare = d.length === 10 ? d
      : d.length === 11 && d.startsWith("0") ? d.slice(1)
      : d.length === 12 && d.startsWith("91") ? d.slice(2)
      : d.length === 13 && d.startsWith("091") ? d.slice(3)
      : d.length === 14 && d.startsWith("0091") ? d.slice(4)
      : null;
    if (bare && /^[6-9]\d{9}$/.test(bare)) { phone = bare; break; }
  }
  return { email, phone, raw };
}

/**
 * Merge a completed turn into an existing conversation doc (or create a fresh one).
 * @param {object|null} existing  the current Cosmos doc, or null if none yet
 * @param {object} turn
 * @param {string} turn.sessionId          REQUIRED — becomes id + partition key
 * @param {string|null} [turn.userId]
 * @param {string|null} [turn.email]
 * @param {string} [turn.userText]         the user's message this turn
 * @param {string} [turn.assistantText]    the assistant reply this turn
 * @param {object} [turn.intent]           accumulated intent (persisted as-is; blob)
 * @param {string} turn.nowIso            ISO timestamp (injected for deterministic tests)
 * @returns {object} the doc to upsert
 */
export function buildConversationDoc(existing, {
  sessionId, userId = null, email = null, userText, assistantText, intent, nowIso,
}) {
  if (!sessionId) throw new Error("buildConversationDoc: sessionId is required");

  const base = existing && typeof existing === "object" ? existing : null;
  const leadFired = base?.leadFired || false;
  const status = base?.status || "active";
  const messages = base && Array.isArray(base.messages) ? base.messages.slice() : [];
  if (userText) messages.push({ role: "user", content: String(userText), ts: nowIso });
  if (assistantText) messages.push({ role: "assistant", content: String(assistantText), ts: nowIso });

  // Cap defensively — keep the most recent MAX_TURNS messages.
  const capped = messages.length > MAX_TURNS ? messages.slice(messages.length - MAX_TURNS) : messages;

  return {
    id: sessionId,          // id === sessionId (D-030)
    sessionId,              // partition key
    userId: userId ?? base?.userId ?? null,
    email: email ?? base?.email ?? null,
    startedAt: base?.startedAt || nowIso,
    lastMessageAt: nowIso,
    turnCount: capped.length,
    messages: capped,
    accumulatedIntent: intent ?? base?.accumulatedIntent ?? {},
    leadFired,
    status,
    // Retention ENABLED (Q-BIZ-10 resolved → D-056): 180 days for a non-converted session, keep-forever
    // once it fires/converts. Deliberately RECOMPUTED rather than carried from `base?.ttl`, so a session
    // that converts mid-chat flips on its next turn. See retentionTtl() for the case it cannot cover.
    ttl: retentionTtl({ leadFired, status }),
  };
}
