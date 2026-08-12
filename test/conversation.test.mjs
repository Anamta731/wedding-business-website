import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildConversationDoc, MAX_TURNS, RETENTION_TTL_SECONDS, TTL_KEEP_FOREVER,
  retentionTtl, parseLeadContact,
} from "../src/lib/conversation.mjs";

const NOW = "2026-07-16T10:00:00.000Z";
const LATER = "2026-07-16T10:05:00.000Z";

test("fresh doc: id===sessionId (pk), turn appended, intent persisted", () => {
  const d = buildConversationDoc(null, {
    sessionId: "vv_abc", userId: "u1", userText: "Goa wedding?", assistantText: "Goa is lovely!",
    intent: { intent_level: "medium", cities: ["Goa"] }, nowIso: NOW,
  });
  assert.equal(d.id, "vv_abc");
  assert.equal(d.sessionId, "vv_abc"); // snake→camel mapping done by caller; id === sessionId === pk (D-030)
  assert.equal(d.userId, "u1");
  assert.equal(d.messages.length, 2);
  assert.deepEqual(d.messages.map((m) => m.role), ["user", "assistant"]);
  assert.equal(d.turnCount, 2);
  assert.deepEqual(d.accumulatedIntent, { intent_level: "medium", cities: ["Goa"] });
  assert.equal(d.leadFired, false);
  assert.equal(d.status, "active");
  assert.equal(d.startedAt, NOW);
  assert.equal(d.lastMessageAt, NOW);
  assert.equal(d.ttl, RETENTION_TTL_SECONDS); // D-056: non-converted → 180-day purge
});

test("merge appends to existing; startedAt preserved, intent + lastMessageAt refreshed, flags kept", () => {
  const existing = buildConversationDoc(null, { sessionId: "s", userText: "hi", assistantText: "hello", intent: { intent_level: "low" }, nowIso: NOW });
  existing.leadFired = true; // simulate a prior lead-notify stamp
  const merged = buildConversationDoc(existing, { sessionId: "s", userText: "Goa?", assistantText: "Yes", intent: { intent_level: "high", cities: ["Goa"] }, nowIso: LATER });
  assert.equal(merged.messages.length, 4);
  assert.equal(merged.turnCount, 4);
  assert.equal(merged.startedAt, NOW);        // preserved
  assert.equal(merged.lastMessageAt, LATER);  // refreshed
  assert.deepEqual(merged.accumulatedIntent, { intent_level: "high", cities: ["Goa"] }); // refreshed
  assert.equal(merged.leadFired, true);       // preserved
});

test("static-FAQ style turn (assistant only text, no new intent) still persists user+assistant", () => {
  const d = buildConversationDoc(null, { sessionId: "s", userText: "what's your minimum budget?", assistantText: "From ₹8L…", nowIso: NOW });
  assert.equal(d.messages.length, 2);
  assert.deepEqual(d.accumulatedIntent, {}); // no intent supplied → empty blob
});

test("empty assistantText appends only the user turn (hard-error path)", () => {
  const d = buildConversationDoc(null, { sessionId: "s", userText: "hello", assistantText: "", nowIso: NOW });
  assert.equal(d.messages.length, 1);
  assert.equal(d.messages[0].role, "user");
});

test("messages capped at MAX_TURNS (most recent kept)", () => {
  const existing = { id: "s", sessionId: "s", startedAt: NOW, messages: Array.from({ length: MAX_TURNS }, (_, i) => ({ role: "user", content: `m${i}`, ts: NOW })) };
  const d = buildConversationDoc(existing, { sessionId: "s", userText: "newest", assistantText: "reply", nowIso: LATER });
  assert.equal(d.messages.length, MAX_TURNS);
  assert.equal(d.messages[d.messages.length - 1].content, "reply"); // newest retained
  assert.equal(d.messages[d.messages.length - 2].content, "newest");
});

test("carries userId/email forward when not re-supplied", () => {
  const existing = buildConversationDoc(null, { sessionId: "s", userId: "u9", email: "a@b.co", userText: "hi", assistantText: "ok", nowIso: NOW });
  const merged = buildConversationDoc(existing, { sessionId: "s", userText: "again", assistantText: "sure", nowIso: LATER });
  assert.equal(merged.userId, "u9");
  assert.equal(merged.email, "a@b.co");
});

test("throws without sessionId", () => {
  assert.throws(() => buildConversationDoc(null, { userText: "x", nowIso: NOW }));
});

// ── Retention (copilot register D-056 / Q-BIZ-10) ─────────────────────────────

test("retentionTtl: 180 days unless the session converted", () => {
  assert.equal(RETENTION_TTL_SECONDS, 15552000);
  assert.equal(retentionTtl({}), RETENTION_TTL_SECONDS);
  assert.equal(retentionTtl({ leadFired: false, status: "active" }), RETENTION_TTL_SECONDS);
  assert.equal(retentionTtl({ leadFired: true }), TTL_KEEP_FOREVER);
  assert.equal(retentionTtl({ status: "converted" }), TTL_KEEP_FOREVER);
  assert.equal(retentionTtl(), RETENTION_TTL_SECONDS);
});

test("ttl is RECOMPUTED per upsert, not carried from the existing doc", () => {
  // a doc stamped keep-forever by lead-notify, but whose leadFired flag did not stick
  const stale = { id: "s", sessionId: "s", startedAt: NOW, messages: [], ttl: TTL_KEEP_FOREVER, leadFired: false };
  const d = buildConversationDoc(stale, { sessionId: "s", userText: "hi", assistantText: "ok", nowIso: LATER });
  assert.equal(d.ttl, RETENTION_TTL_SECONDS, "leadFired is the source of truth, not the old ttl");

  // and the converse: a session that converted flips on its next turn
  const converted = { id: "s", sessionId: "s", startedAt: NOW, messages: [], ttl: RETENTION_TTL_SECONDS, leadFired: true };
  const e = buildConversationDoc(converted, { sessionId: "s", userText: "more", assistantText: "sure", nowIso: LATER });
  assert.equal(e.ttl, TTL_KEEP_FOREVER);
  assert.equal(e.leadFired, true);
});

// ── Lead contact parsing (the all-null-contact bug) ───────────────────────────

test("parseLeadContact splits the lead form's single free-text field", () => {
  assert.deepEqual(parseLeadContact("priya@example.com"), { email: "priya@example.com", phone: null, raw: "priya@example.com" });
  assert.deepEqual(parseLeadContact("9876543210"), { email: null, phone: "9876543210", raw: "9876543210" });

  const both = parseLeadContact("Priya — priya@Example.COM / +91 98765 43210");
  assert.equal(both.email, "priya@example.com", "lower-cased");
  assert.equal(both.phone, "9876543210", "+91 stripped to a bare 10-digit mobile");
  assert.ok(both.raw.includes("Priya"), "the original string is kept verbatim");
});

test("parseLeadContact accepts the formats visitors actually type", () => {
  for (const [input, expected] of [
    ["+919876543210", "9876543210"],
    ["09876543210", "9876543210"],
    ["0091 98765 43210", "9876543210"],
    ["98765-43210", "9876543210"],
    ["8123456789", "8123456789"],
  ]) assert.equal(parseLeadContact(input).phone, expected, input);
});

test("parseLeadContact refuses to invent a number", () => {
  assert.deepEqual(parseLeadContact(""), { email: null, phone: null, raw: null });
  assert.deepEqual(parseLeadContact(null), { email: null, phone: null, raw: null });
  assert.equal(parseLeadContact("call me sometime").phone, null);
  assert.equal(parseLeadContact("0141 2345678").phone, null, "landline, not a 6-9 mobile");
  assert.equal(parseLeadContact("302001").phone, null, "pincode");
  assert.equal(parseLeadContact("order 98765432101234").phone, null, "longer digit run");
});
