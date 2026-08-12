import { test } from "node:test";
import assert from "node:assert/strict";
import { shapedIntent } from "../src/lib/intentExtraction.js";
import {
  INTENT_FIXTURE_UNDERCAPTURE, INTENT_FIXTURE_EMPTY,
} from "./fixtures/chatbot-integrity-2026-07.mjs";

/**
 * Intent-extraction regressions (integrity report + D-036 + the 2026-08-04 empty-intent finding).
 *
 * The extraction itself is an LLM call, so the PROMPT is asserted rather than mocked: each acceptance
 * criterion in the report maps to an explicit instruction that must be present. A prompt edit that
 * silently drops one of these — which is how the under-capture happened — fails here.
 */

const promptSrc = await import("node:fs").then(({ readFileSync }) =>
  readFileSync(new URL("../src/lib/intentExtraction.js", import.meta.url), "utf8")
);

test("D-036 acceptance: the prompt must instruct all four slots the live doc dropped", () => {
  const { message, observed } = INTENT_FIXTURE_UNDERCAPTURE;
  assert.ok(message.includes("150") && message.includes("December 2026"), "fixture kept verbatim");

  // cities — the OLD prompt said "Do NOT extract from comparison", and the fixture is literally
  // "torn between Goa and the hills". That instruction is what suppressed cities:[].
  assert.ok(!/Do NOT extract from comparison/i.test(promptSrc),
    "the comparison exclusion must be gone — it is what caused cities:[] on a 'torn between' message");
  assert.ok(/torn between Goa and the hills/i.test(promptSrc),
    "the prompt should teach the exact failing phrasing");
  assert.ok(/INCLUDING when they are weighing options/i.test(promptSrc));

  // wedding_date — the live doc stored "December", dropping the year
  assert.equal(observed.wedding_date, "December", "the recorded failure");
  assert.ok(/ALWAYS keep the YEAR/i.test(promptSrc));
  assert.ok(/NEVER just "December"/i.test(promptSrc));

  // guest_count — "~150 guests" returned ""
  assert.ok(/Strip approximators/i.test(promptSrc));
  assert.ok(/~150 guests.*→.*150/.test(promptSrc));

  // budget_tier — 1.5 crore returned "". The old ladder topped out at ₹60L+, so ₹150L had no band.
  assert.ok(/UNIT CONVERSION IS MANDATORY/i.test(promptSrc));
  assert.ok(/1 Cr \(crore\) = 100 L \(lakh\)/i.test(promptSrc));
  assert.ok(/₹1-2Cr/.test(promptSrc), "a band that can actually express ₹1.5Cr must exist");
  assert.ok(/Never return "" just because a figure is large/i.test(promptSrc));
});

test("the budget ladder can express the fixture's ₹1.5Cr (the old one could not)", () => {
  // old ceiling: "₹60L+" — every large budget collapsed into one bucket, or came back empty
  const bands = promptSrc.match(/"₹[^"]+"/g).map((s) => s.replaceAll('"', ""));
  assert.ok(bands.includes("₹1-2Cr"), `₹1.5Cr needs a home; bands are ${bands.join(" | ")}`);
  assert.ok(bands.includes("₹2Cr+"), "and an open top band above it");
  // the JSDoc must not still advertise the old vocabulary
  assert.ok(!/budget_tier\s+-\s+"₹8-15L" \| "₹15-30L" \| "₹30-60L" \| "₹60L\+"/.test(promptSrc),
    "the @property doc should list the new bands");
});

test("2026-08-04 regression: shapedIntent can never persist an empty object", () => {
  const { observedAccumulatedIntent, expect } = INTENT_FIXTURE_EMPTY;
  assert.deepEqual(observedAccumulatedIntent, {}, "what the live doc actually held: 0 keys");

  const shaped = shapedIntent(observedAccumulatedIntent, INTENT_FIXTURE_EMPTY.message);
  assert.ok(Object.keys(shaped).length > 10, "canonical shape, not {}");
  assert.equal(expect.notEmptyObject, true);

  // the canonical keys the copilot's reader and the lead email both rely on
  for (const k of [
    "cities", "venue_type", "wedding_date", "guest_count", "budget_tier",
    "intent", "category", "stage", "intent_level", "rewritten_query",
  ]) assert.ok(k in shaped, `missing canonical key: ${k}`);

  assert.deepEqual(shaped.cities, []);
  assert.equal(shaped.intent_level, "low");
});

test("shapedIntent preserves what the client already accumulated", () => {
  const acc = { cities: ["Goa"], guest_count: "150", intent_level: "high" };
  const shaped = shapedIntent(acc, "anything");
  assert.deepEqual(shaped.cities, ["Goa"], "client values win over defaults");
  assert.equal(shaped.guest_count, "150");
  assert.equal(shaped.intent_level, "high");
  assert.equal(shaped.venue_type, "", "unset keys still get their default");
});

test("shapedIntent tolerates null/undefined input", () => {
  assert.ok(Object.keys(shapedIntent(null, "q")).length > 10);
  assert.ok(Object.keys(shapedIntent(undefined)).length > 10);
});
