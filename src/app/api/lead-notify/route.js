import { EmailClient } from "@azure/communication-email";
import { DefaultAzureCredential } from "@azure/identity";

const _credential = new DefaultAzureCredential();
let _emailClient = null;
function getEmailClient() {
  if (!_emailClient) {
    const endpoint = process.env.AZURE_COMMUNICATION_ENDPOINT;
    _emailClient = endpoint
      ? new EmailClient(endpoint, _credential)
      : new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING);
  }
  return _emailClient;
}

const RECIPIENTS = [
  // Backend-only recipient — never rendered to visitors.
  { address: "arunima.sethi@vowsandvedas.com", displayName: "Vows & Vedas" },
];

const CC_RECIPIENTS = [
  { address: "anamta.ali@getsholidays.com", displayName: "Anamta Ali" },
  { address: "nikhil.arora@wearemci.com",   displayName: "Nikhil Arora" },
  { address: "rakesh.bijewar@wearemci.com", displayName: "Rakesh Bijewar" },
];

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function intentBadge(level) {
  const styles = {
    high:   { bg: "#E8F5E9", color: "#1B5E20", label: "HIGH" },
    medium: { bg: "#FBE9E7", color: "#BF360C", label: "MEDIUM" },
    low:    { bg: "#F5F5F5", color: "#555555", label: "LOW" },
  };
  const s = styles[level?.toLowerCase()] ?? styles.low;
  return `<span style="display:inline-block;background:${s.bg};color:${s.color};border:1px solid ${s.color}40;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;">${s.label}</span>`;
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    accumulated_intent   = {},
    conversation_history = [],
    session_id           = "unknown",
    name                 = "",
    contact              = "",
    source               = "",
    is_test              = false,
  } = body ?? {};

  if (typeof accumulated_intent !== "object" || Array.isArray(accumulated_intent))
    return Response.json({ error: "accumulated_intent must be an object." }, { status: 400 });
  if (!Array.isArray(conversation_history))
    return Response.json({ error: "conversation_history must be an array." }, { status: 400 });

  try {

    const {
      intent_level  = "low",
      cities        = [],
      venues_viewed = [],
      wedding_date,
      budget_tier,
      stage,
    } = accumulated_intent;

    const hasNoIntent = !cities.length && !venues_viewed.length && intent_level === "low";
    const recentHistory = conversation_history.slice(-6);

    const transcriptRows = recentHistory.length > 0
      ? recentHistory.map(m => {
          const isBot = m.role === "assistant";
          return `
            <tr style="border-bottom:1px solid #EDE8DC;">
              <td style="padding:8px 12px;font-size:11px;color:${isBot ? "#9A8F7E" : "#C9A234"};font-weight:700;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;vertical-align:top;width:60px;">${isBot ? "Bot" : "User"}</td>
              <td style="padding:8px 12px;font-size:13px;color:#1A1408;line-height:1.6;">${escHtml(m.content)}</td>
            </tr>`;
        }).join("")
      : `<tr><td colspan="2" style="padding:12px;font-size:12px;color:#9A8F7E;font-style:italic;">No conversation history available</td></tr>`;

    const client = getEmailClient();

    const emailMessage = {
      senderAddress: process.env.AZURE_SENDER_ADDRESS,
      content: {
        subject: `${is_test ? "[TEST] " : ""}[Chatbot Lead] ${intent_level?.toUpperCase() || "LOW"} Intent${name ? ` — ${name}` : ""} — ${cities.length > 0 ? cities.join(", ") : "No destination yet"}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#1A1408;">
            <div style="background:#1A1408;padding:22px 32px;text-align:center;">
              <h2 style="color:#C9A234;margin:0;font-weight:300;letter-spacing:4px;font-size:12px;text-transform:uppercase;">
                Chatbot Lead Alert — Vows &amp; Vedas
              </h2>
            </div>

            ${hasNoIntent ? `
            <div style="background:#FFF8E1;border-left:4px solid #FFA000;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#7A5200;font-weight:600;">
                ⚠ Early discovery — no venue or destination intent captured yet.
              </p>
            </div>` : ""}

            <div style="padding:28px 32px;background:#FDFAF5;border:1px solid #EDE8DC;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                ${name || contact ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:38%;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;font-weight:600;">${escHtml(name) || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Phone / Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;font-weight:600;">${escHtml(contact) || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Source</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:12px;color:#9A8F7E;">${escHtml(source) || "chatbot"}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:38%;">Intent Level</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;">${intentBadge(intent_level)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Cities Explored</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${cities.length > 0 ? cities.map(escHtml).join(", ") : "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Venues Viewed</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${venues_viewed.length > 0 ? venues_viewed.map(escHtml).join(", ") : "—"}</td>
                </tr>
                ${wedding_date ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Wedding Date</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${escHtml(wedding_date)}</td>
                </tr>` : ""}
                ${budget_tier ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Budget Tier</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${escHtml(budget_tier)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Stage</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${escHtml(stage || "discovery")}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Session</td>
                  <td style="padding:10px 0;font-size:12px;color:#9A8F7E;">${escHtml(session_id)}</td>
                </tr>
              </table>

              <p style="color:#9A8F7E;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">
                Last ${recentHistory.length} Message${recentHistory.length !== 1 ? "s" : ""}
              </p>
              <div style="background:#F9F6EF;border:1px solid #EDE8DC;border-radius:4px;overflow:hidden;">
                <table style="width:100%;border-collapse:collapse;">${transcriptRows}</table>
              </div>
            </div>

            <div style="padding:14px 32px;background:#1A1408;text-align:center;">
              <p style="color:#C9A234;margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                Vows &amp; Vedas · Curating Rare Moments
              </p>
            </div>
          </div>
        `,
      },
      recipients: { to: RECIPIENTS, cc: CC_RECIPIENTS },
    };

    const poller = await client.beginSend(emailMessage);
    await poller.pollUntilDone();

    return Response.json({ success: true });
  } catch (err) {
    console.error("[lead-notify] error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
