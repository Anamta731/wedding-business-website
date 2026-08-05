import { test } from "node:test";
import assert from "node:assert/strict";
import { matchStaticFaq, isSpecificQuery } from "../src/lib/staticFaqs.js";
import { FAQ_MUST_REACH_LLM, FAQ_MUST_STAY_STATIC } from "./fixtures/chatbot-integrity-2026-07.mjs";

/**
 * Regression guard for the greedy static-FAQ matcher (integrity test T3/T4a/T5, priority HIGH).
 * The failure mode: broad catch-alls (`\bvenues?\b`, `budget`, `pax`) claimed questions a canned
 * answer cannot scope, so "venues in Udaipur?" returned a multi-region catalogue wall.
 */

test("T3/T4a/T5: specific questions must fall through to the LLM", () => {
  for (const { id, message, why } of FAQ_MUST_REACH_LLM) {
    assert.equal(isSpecificQuery(message), true, `${id} should be detected as specific — ${why}`);
    assert.equal(matchStaticFaq(message), null, `${id} must NOT get a canned answer — ${why}`);
  }
});

test("general questions keep their curated static answers (T1/T2 stay PASS)", () => {
  for (const { id, message, expectIncludes } of FAQ_MUST_STAY_STATIC) {
    const answer = matchStaticFaq(message);
    assert.ok(answer, `${id} should still be answered statically: "${message}"`);
    assert.ok(answer.includes(expectIncludes), `${id} answer should mention ${expectIncludes}`);
  }
});

test("specificity: a named city routes to the LLM, a region keeps its static answer", () => {
  // cities → generative (the LLM scopes correctly; integrity test T4b proved that)
  for (const q of ["venues in Udaipur?", "what about Jaipur", "anything in Mumbai", "Rishikesh wedding venues"]) {
    assert.equal(isSpecificQuery(q), true, q);
  }
  // regions with good curated answers → still static (T2 Goa PASSed; do not regress it)
  for (const q of ["tell me about Goa", "Rajasthan palace weddings", "Kerala weddings", "hill station wedding"]) {
    assert.equal(isSpecificQuery(q), false, q);
    assert.ok(matchStaticFaq(q), `${q} should still be static`);
  }
});

test("specificity: numbers, money and dates route to the LLM", () => {
  for (const q of [
    "200 pax wedding",
    "budget is 1.5 crore",
    "around ₹80 lakhs",
    "we have 25L to spend",
    "getting married in December 2026",
    "wedding in March",
  ]) assert.equal(isSpecificQuery(q), true, q);
});

test("specificity does NOT trip on incidental digits or the compound service names", () => {
  // "3-D models" is an add-on FAQ — a lone digit must not make it specific
  assert.equal(isSpecificQuery("do you do 3d models?"), false);
  assert.ok(matchStaticFaq("do you do 3d models?"), "3-D models FAQ must survive");
  // "venue-only" / "coordination only" are service names, not scoping "only"
  for (const q of ["venue-only sourcing", "venue only planning", "coordination only please"]) {
    assert.equal(isSpecificQuery(q), false, q);
  }
  // but a bare scoping "only" IS specific (T3)
  assert.equal(isSpecificQuery("Jaipur venues only"), true);
  assert.equal(isSpecificQuery("beach venues only"), true);
});

test("a named venue still bypasses the FAQ table (pre-existing rule, unchanged)", () => {
  assert.equal(matchStaticFaq("tell me about ITC Grand Goa"), null);
  assert.equal(matchStaticFaq("Taj Exotica pricing"), null);
});

test("guards: empty / too-short queries", () => {
  assert.equal(matchStaticFaq(""), null);
  assert.equal(matchStaticFaq("a"), null);
  assert.equal(matchStaticFaq(null), null);
  assert.equal(isSpecificQuery(null), false);
  assert.equal(isSpecificQuery(undefined), false);
});

test("leadCaptured suppresses the hand-off line but keeps the body", () => {
  const withHandoff = matchStaticFaq("what packages do you offer?", false);
  const without = matchStaticFaq("what packages do you offer?", true);
  assert.ok(withHandoff.length > without.length);
  assert.ok(without.includes("Full Planning"));
});
