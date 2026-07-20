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

// Mirrors the recipient list in /api/lead-notify (source of truth). Kept
// separate on purpose so the landing kit's newsletter path stays isolated
// from the chatbot lead pipeline.
const RECIPIENTS = [
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

// A newsletter opt-in is a mailing-list signup, not a scored lead — the email
// deliberately carries no intent badge, transcript, or "cities explored" so the
// team can tell it apart at a glance from a real chatbot handoff.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    contact    = "",
    source     = "Landing page footer",
    session_id = "unknown",
    is_test    = false,
  } = body ?? {};

  if (!contact || typeof contact !== "string") {
    return Response.json({ error: "contact (email) is required." }, { status: 400 });
  }

  try {
    const client = getEmailClient();
    const emailMessage = {
      senderAddress: process.env.AZURE_SENDER_ADDRESS,
      content: {
        subject: `${is_test ? "[TEST] " : ""}[Newsletter Signup] ${contact}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:640px;margin:0 auto;color:#1A1408;">
            <div style="background:#1A1408;padding:22px 32px;text-align:center;">
              <h2 style="color:#C9A234;margin:0;font-weight:300;letter-spacing:4px;font-size:12px;text-transform:uppercase;">
                Newsletter Signup — Vows &amp; Vedas
              </h2>
            </div>
            <div style="padding:28px 32px;background:#FDFAF5;border:1px solid #EDE8DC;">
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">
                A visitor joined the mailing list from the landing page. This is a newsletter opt-in, not a chatbot lead.
              </p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:38%;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:14px;font-weight:600;">${escHtml(contact)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Source</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:12px;color:#9A8F7E;">${escHtml(source)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Session</td>
                  <td style="padding:10px 0;font-size:12px;color:#9A8F7E;">${escHtml(session_id)}</td>
                </tr>
              </table>
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
    console.error("[newsletter-notify] error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
