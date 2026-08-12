/**
 * Regression fixtures from the 2026-07 chatbot integrity test (live prod, ?test=1 session).
 * Spec + acceptance criteria: copilot repo `reports/chatbot-integrity-test-2026-07.md`.
 *
 * These are the ACTUAL messages that failed, kept verbatim so a future prompt/matcher edit that
 * re-breaks them fails a test instead of reaching a real couple.
 */

/** T3 / T4a / T5 — messages the greedy static-FAQ matcher wrongly claimed. */
export const FAQ_MUST_REACH_LLM = [
  { id: "T3",  message: "Jaipur venues only",
    why: "specific city + scoping 'only' → got the full multi-region catalogue dump" },
  { id: "T4a", message: "venues in Delhi?",
    why: "specific city → hit the \\bvenues?\\b catch-all; the Delhi row was right but the dump was not" },
  { id: "T5",  message: "we're about 200 pax, December 2026, budget around 1.5 crore total",
    why: "budget/date/guests ignored; matched the 'budget'/'pax' FAQ patterns and re-asked guest count" },
  // the report's headline example of the real-world cost
  { id: "T5b", message: "venues in Udaipur?",
    why: "a real couple asking this got a catalogue wall (report: 'Fix priority HIGH')" },
];

/** Genuinely general questions that MUST keep their curated static answers. */
export const FAQ_MUST_STAY_STATIC = [
  { id: "T1",  message: "what's your minimum budget?",   expectIncludes: "₹3 Lakhs" },
  { id: "T2",  message: "tell me about Goa",             expectIncludes: "ITC Grand Goa" },
  { id: "pkg", message: "what packages do you offer?",   expectIncludes: "Full Planning" },
  { id: "svc", message: "what services do you provide?", expectIncludes: "9 core services" },
  { id: "vo",  message: "do you do venue-only sourcing?", expectIncludes: "Partial planning" },
];

/**
 * Extraction acceptance fixture — verbatim from the report (added 2026-07-24), which was itself taken
 * from the first persisted prod conversation.
 */
export const INTENT_FIXTURE_UNDERCAPTURE = {
  id: "D-036",
  message: "~150 guests in December 2026, torn between Goa and the hills, budget ~1.5 crore total",
  /** What the LIVE prod doc actually stored — the failure being fixed. */
  observed: { cities: [], guest_count: "", budget_tier: "", wedding_date: "December" },
  /** Report acceptance criteria. */
  expect: {
    guest_count: "150",
    weddingDateIncludesYear: "2026",
    citiesInclude: ["Goa", "Hills"],
    budgetReflects: "1.5 crore",   // ₹150L → the ₹1-2Cr band
  },
};

/**
 * Second fixture — the NEWER regression (prod doc 2026-08-04): a completely EMPTY accumulatedIntent
 * (0 keys), worse than the D-036 under-capture. Cause: the static-FAQ bypass persisted the CLIENT's
 * `accumulated_intent`, which is `{}` on a first message, and ran no extraction at all.
 */
export const INTENT_FIXTURE_EMPTY = {
  id: "2026-08-04",
  message: "what are your planning packages?", // non-specific → legitimately takes the static path
  observedAccumulatedIntent: {},               // 0 keys — indistinguishable from "never extracted"
  expect: { hasCanonicalKeys: true, notEmptyObject: true },
};
