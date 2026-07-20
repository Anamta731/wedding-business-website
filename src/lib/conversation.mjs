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
    leadFired: base?.leadFired || false,
    status: base?.status || "active",
    // Retention hook only — NOT enabled yet (Q-BIZ-10 open). -1 = never expires; a future
    // positive value + container defaultTtl:-1 would enable per-item TTL. TODO(Q-BIZ-10).
    ttl: base?.ttl ?? -1,
  };
}
