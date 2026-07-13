#!/usr/bin/env node
// Machine-readable analytics snapshot for the improvement agent — the read-only
// "eyes" of the analytics -> improvement loop described in
// docs/agent/improvement-agent-prompt.md. It DOES NOT write anything.
//
// Emits ONE JSON blob to stdout that the autonomous improvement agent reasons
// over each cycle: the conversion funnel, stage-to-stage rates, the target
// thresholds, period-over-period deltas (to flag regressions), the biggest leak
// (ranked by estimated sessions lost), and an engagement/chatbot sidebar.
//
// Data source: Azure Application Insights (resource appi-vows-prod-eus-001).
// Every site event lands in the customEvents table (see src/lib/telemetry.js —
// all envelopes are EventData). We read them with a single KQL query run through
// `az monitor app-insights query`, which authenticates with the caller's Azure
// CLI session. In CI that session comes from the existing OIDC `azure/login@v2`
// step, so NO App Insights API key is needed — the service principal only needs
// the "Monitoring Reader" role on the component (see docs/agent/setup).
//
// The funnel numbers MUST match the "Vows & Vedas — Whole-Site Analytics"
// workbook (workbook/vows-vedas-comprehensive.workbook, tiles `funnel-tiles` /
// `funnel-rates`) for the same window — that is the verification contract. This
// script reuses the workbook's exact dcountif(sessionId, name == 'X') pattern.
//
// Usage:
//   node scripts/analytics-snapshot.mjs \
//     --app appi-vows-prod-eus-001 --resource-group mci-wedding-website --window 7
//
//   # offline / testing — feed a saved `az ... -o json` result instead of calling Azure:
//   node scripts/analytics-snapshot.mjs --from-file sample-az-result.json --window 7
//
//   # just print the KQL it would run (no Azure call):
//   node scripts/analytics-snapshot.mjs --print-kql --window 7
//
// Env fallbacks: APPINSIGHTS_APP (--app), APPINSIGHTS_RG (--resource-group).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ── Targets: the single source of truth for "what good looks like" ────────────
// Calibrated 2026-07-13 against the real 30d funnel (observed: session->contact
// 0.14, contact->form 0.18, form->enquiry 0.45, session->lead 0.011); set as
// modest stretch goals just above observed. A stage is only a "leak" when its
// rate is below target. These mirror the funnel the workbook charts (Session ->
// /contact -> Form started -> Enquiry). Wedding enquiries are low-frequency /
// high-value, so the session_to_lead floor is deliberately low. Recalibrate as
// volume grows.
const TARGETS = {
  session_to_contact: 0.15, // sessions that reach /contact (obs ~0.14)
  contact_to_form: 0.25, //    /contact viewers who start the form (obs ~0.18, weakest stage)
  form_to_enquiry: 0.55, //    form-starters who submit (obs ~0.45)
  session_to_lead: 0.015, //   overall session -> enquiry (lead) rate (obs ~0.011)
};

// Stage definitions: [label, numerator_key, denominator_key, target_key].
// Keys index into the counts object built from the KQL row.
const STAGES = [
  ["Session → Contact page viewed", "contact_view", "sessions", "session_to_contact"],
  ["Contact viewed → Form started", "form_started", "contact_view", "contact_to_form"],
  ["Form started → Enquiry submitted", "enquiry_sessions", "form_started", "form_to_enquiry"],
  ["Session → Enquiry captured (lead)", "enquiry_sessions", "sessions", "session_to_lead"],
];

// ── CLI parsing ───────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {
    app: process.env.APPINSIGHTS_APP || "appi-vows-prod-eus-001",
    resourceGroup: process.env.APPINSIGHTS_RG || "mci-wedding-website",
    window: 7,
    fromFile: null,
    printKql: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--app") args.app = argv[++i];
    else if (a === "--resource-group" || a === "-g") args.resourceGroup = argv[++i];
    else if (a === "--window") args.window = parseInt(argv[++i], 10);
    else if (a === "--from-file") args.fromFile = argv[++i];
    else if (a === "--print-kql") args.printKql = true;
  }
  if (!Number.isInteger(args.window) || args.window <= 0) args.window = 7;
  return args;
}

// ── KQL: one query returns current + prior window in a single row ─────────────
// `cur` splits the 2*window range into current (last W days) and prior (the W
// days before that) so period-over-period deltas need only one round-trip.
function buildKql(windowDays) {
  const W = `${windowDays}d`;
  const W2 = `${windowDays * 2}d`;
  return `
customEvents
| where timestamp > ago(${W2})
| extend sid = tostring(customDimensions.sessionId)
| extend p = tostring(customDimensions.path)
| extend cur = timestamp > ago(${W})
| summarize
    cur_sessions        = dcountif(sid, cur),
    cur_pageview        = dcountif(sid, cur and name == 'PageView'),
    cur_cta             = dcountif(sid, cur and name == 'CtaClick'),
    cur_contact_view    = dcountif(sid, cur and name == 'PageView' and p == '/contact'),
    cur_form_started    = dcountif(sid, cur and name == 'ContactFormStarted'),
    cur_enquiry_sessions = dcountif(sid, cur and name == 'EnquirySubmitted'),
    cur_enquiries       = countif(cur and name == 'EnquirySubmitted'),
    cur_chatbot_open    = dcountif(sid, cur and name == 'ChatbotOpened'),
    cur_chatbot_msg     = dcountif(sid, cur and name == 'ChatbotFirstMessage'),
    prior_sessions        = dcountif(sid, not(cur)),
    prior_pageview        = dcountif(sid, not(cur) and name == 'PageView'),
    prior_cta             = dcountif(sid, not(cur) and name == 'CtaClick'),
    prior_contact_view    = dcountif(sid, not(cur) and name == 'PageView' and p == '/contact'),
    prior_form_started    = dcountif(sid, not(cur) and name == 'ContactFormStarted'),
    prior_enquiry_sessions = dcountif(sid, not(cur) and name == 'EnquirySubmitted'),
    prior_enquiries       = countif(not(cur) and name == 'EnquirySubmitted')
`.trim();
}

// ── Run the query via az CLI (uses the caller's logged-in Azure session) ──────
// Cross-platform: on Windows `az` is a batch file (az.cmd) that Node cannot
// execFile directly, so we go through `cmd /c az`. The KQL is passed via an
// @file reference (a global az convention) so the query — which contains pipes
// and quotes — never touches a shell command line on any platform.
function runAz(app, resourceGroup, kql, windowDays) {
  const dir = mkdtempSync(join(tmpdir(), "ai-snap-"));
  const qfile = join(dir, "query.kql");
  writeFileSync(qfile, kql, "utf8");
  const baseArgs = [
    "monitor", "app-insights", "query",
    "--app", app,
    "--resource-group", resourceGroup,
    "--analytics-query", "@" + qfile,
    // The in-query `ago(2*windowDays)` filter governs the range, but az defaults
    // its API timespan to the last ~1h when neither --offset nor --timespan is
    // given — which silently clips the query to the last hour and returns
    // near-zero. Pin the CLI window to the query's full outer range.
    "--offset", `${windowDays * 2}d`,
    "-o", "json",
  ];
  const isWin = process.platform === "win32";
  const bin = isWin ? "cmd" : "az";
  const args = isWin ? ["/c", "az", ...baseArgs] : baseArgs;
  try {
    const out = execFileSync(bin, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(out);
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best-effort temp cleanup */
    }
  }
}

// az returns { tables: [ { columns:[{name,..}], rows:[[..]] } ] }. Flatten the
// first table's first row into a { columnName: number } object. Missing data
// (no rows) yields an empty object -> every count defaults to 0 downstream.
function rowFromAzResult(azJson) {
  const table =
    (azJson.tables && azJson.tables.find((t) => t.rows && t.rows.length)) ||
    (azJson.tables && azJson.tables[0]);
  if (!table || !table.columns || !table.rows || !table.rows.length) return {};
  const cols = table.columns.map((c) => c.name);
  const row = table.rows[0];
  const obj = {};
  cols.forEach((name, i) => {
    const v = row[i];
    obj[name] = typeof v === "number" ? v : v == null ? 0 : Number(v) || 0;
  });
  return obj;
}

function countsFor(row, prefix) {
  const g = (k) => Number(row[`${prefix}_${k}`] || 0);
  return {
    sessions: g("sessions"),
    pageview: g("pageview"),
    cta: g("cta"),
    contact_view: g("contact_view"),
    form_started: g("form_started"),
    enquiry_sessions: g("enquiry_sessions"),
    enquiries: g("enquiries"),
    chatbot_open: g("chatbot_open"),
    chatbot_msg: g("chatbot_msg"),
  };
}

// ── Metric assembly ───────────────────────────────────────────────────────────
function rate(num, den) {
  return den ? Math.round((num / den) * 10000) / 10000 : null;
}

function funnelMetrics(counts) {
  return STAGES.map(([label, numKey, denKey, targetKey]) => {
    const num = counts[numKey] || 0;
    const den = counts[denKey] || 0;
    const r = rate(num, den);
    const target = TARGETS[targetKey];
    // A rate > 1 means the stages are NOT strictly nested (e.g. a form-start
    // beacon landed for a session whose /contact PageView beacon was lost).
    // Such a ratio is not a meaningful conversion rate — mark it invalid and
    // exclude it from leak ranking / regression detection.
    const valid = r !== null && r <= 1.0;
    const note =
      r === null
        ? "no volume in window"
        : valid
        ? ""
        : "stages not strictly nested (e.g. a lost /contact PageView beacon)";
    const lost = valid && r < target ? Math.round((target - r) * den) : 0;
    return {
      stage: label,
      key: targetKey,
      numerator: num,
      denominator: den,
      rate: r,
      target,
      gap_to_target: r === null ? null : Math.round((target - r) * 10000) / 10000,
      valid,
      note,
      underperforming: valid && r < target,
      est_sessions_lost: lost,
    };
  });
}

function engagement(counts) {
  return {
    sessions: counts.sessions,
    page_views_sessions: counts.pageview,
    cta_click_sessions: counts.cta,
    chatbot_opened_sessions: counts.chatbot_open,
    chatbot_engaged_sessions: counts.chatbot_msg,
    chatbot_open_rate: rate(counts.chatbot_open, counts.sessions),
    chatbot_engage_rate: rate(counts.chatbot_msg, counts.chatbot_open),
    note: "informational — chatbot is a secondary funnel; not used for Phase-1 leak ranking",
  };
}

function primaryLeak(metrics) {
  const under = metrics.filter((m) => m.underperforming && m.denominator > 0);
  if (!under.length) return null;
  const top = under.reduce((a, b) => (b.est_sessions_lost > a.est_sessions_lost ? b : a));
  return {
    stage: top.stage,
    key: top.key,
    rate: top.rate,
    target: top.target,
    est_sessions_lost: top.est_sessions_lost,
  };
}

function deltas(cur, prior) {
  const pmap = Object.fromEntries(prior.map((m) => [m.key, m]));
  return cur.map((m) => {
    const p = pmap[m.key];
    let d = null;
    if (p && m.rate !== null && p.rate !== null) d = Math.round((m.rate - p.rate) * 10000) / 10000;
    // Only a well-defined (valid, nested) stage in BOTH windows can regress — a
    // swinging non-nested ratio is noise.
    const regression = d !== null && d < 0 && m.valid && (p ? p.valid : false);
    return {
      stage: m.stage,
      key: m.key,
      rate_now: m.rate,
      rate_prior: p ? p.rate : null,
      delta: d,
      regression,
    };
  });
}

function buildSnapshot(row, windowDays) {
  const curCounts = countsFor(row, "cur");
  const priorCounts = countsFor(row, "prior");
  const curMetrics = funnelMetrics(curCounts);
  const priorMetrics = funnelMetrics(priorCounts);
  const d = deltas(curMetrics, priorMetrics);
  return {
    generated_at: new Date().toISOString(),
    source: "app-insights (az monitor app-insights query)",
    window_days: windowDays,
    counts: curCounts,
    prior_counts: priorCounts,
    engagement: engagement(curCounts),
    funnel: curMetrics,
    deltas_vs_prior: d,
    primary_leak: primaryLeak(curMetrics),
    regressions: d.filter((x) => x.regression),
    targets: TARGETS,
    notes:
      "Funnel matches workbook tiles funnel-tiles / funnel-rates. Targets in TARGETS are SEED values — calibrate then commit.",
  };
}

// ── main ──────────────────────────────────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv.slice(2));
  const kql = buildKql(args.window);

  if (args.printKql) {
    process.stdout.write(kql + "\n");
    return 0;
  }

  let row;
  try {
    if (args.fromFile) {
      row = rowFromAzResult(JSON.parse(readFileSync(args.fromFile, "utf8")));
    } else {
      row = rowFromAzResult(runAz(args.app, args.resourceGroup, kql, args.window));
    }
  } catch (e) {
    const msg = e && e.stderr ? String(e.stderr) : e && e.message ? e.message : String(e);
    process.stderr.write(
      JSON.stringify({
        error: msg.trim(),
        hint:
          "Needs `az login` (CI: azure/login@v2 OIDC) + the 'application-insights' az extension, " +
          "and 'Monitoring Reader' on the App Insights component. See docs/agent/github-claude-reviewer-setup.md.",
      }) + "\n"
    );
    return 1;
  }

  process.stdout.write(JSON.stringify(buildSnapshot(row, args.window), null, 2) + "\n");
  return 0;
}

process.exit(main());
