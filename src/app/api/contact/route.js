import { randomUUID } from "crypto";
import { EmailClient } from "@azure/communication-email";
import { DefaultAzureCredential } from "@azure/identity";
import { trackEvent } from "@/lib/telemetry";
import { getSession } from "@/lib/session";
import { getEnquiriesContainer } from "@/lib/cosmos";

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

function buildChatbotSection(ctx) {
  if (!ctx) return "";

  const {
    intent_level  = "low",
    cities        = [],
    venues_viewed = [],
    wedding_date,
    budget_tier,
    last_turns    = [],
    session_id,
  } = ctx;

  const hasNoIntent = !cities.length && !venues_viewed.length && intent_level === "low";

  const transcriptRows = last_turns.length > 0
    ? last_turns.map(m => {
        const isBot = m.role === "assistant";
        return `
          <tr style="border-bottom:1px solid #EDE8DC;">
            <td style="padding:8px 12px;font-size:11px;color:${isBot ? "#9A8F7E" : "#C9A234"};font-weight:700;text-transform:uppercase;letter-spacing:1px;white-space:nowrap;vertical-align:top;width:60px;">${isBot ? "Bot" : "User"}</td>
            <td style="padding:8px 12px;font-size:13px;color:#1A1408;line-height:1.6;">${escHtml(m.content)}</td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="2" style="padding:12px;font-size:12px;color:#9A8F7E;font-style:italic;">No conversation history</td></tr>`;

  return `
    <tr>
      <td colspan="2" style="padding:20px 0 8px;">
        <div style="border-top:1px solid #EDE8DC;padding-top:20px;">
          ${hasNoIntent ? `
          <div style="background:#FFF8E1;border-left:4px solid #FFA000;padding:10px 14px;margin-bottom:16px;border-radius:0 4px 4px 0;">
            <p style="margin:0;font-size:12px;color:#7A5200;font-weight:600;">⚠ No chatbot intent captured — form submitted without sharing venue or destination preferences in chat.</p>
          </div>` : ""}
          <p style="color:#9A8F7E;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;font-weight:600;">Chatbot Context</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:38%;">Intent Level</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;">${intentBadge(intent_level)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Cities Explored</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${cities.length > 0 ? cities.map(escHtml).join(", ") : "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Venues Viewed</td>
              <td style="padding:8px 0;border-bottom:1px solid ${!wedding_date && !budget_tier ? "#EDE8DC" : "#EDE8DC"};font-size:14px;">${venues_viewed.length > 0 ? venues_viewed.map(escHtml).join(", ") : "—"}</td>
            </tr>
            ${wedding_date ? `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Chat: Wedding Date</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${escHtml(wedding_date)}</td>
            </tr>` : ""}
            ${budget_tier ? `
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Budget Tier</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDE8DC;font-size:14px;">${escHtml(budget_tier)}</td>
            </tr>` : ""}
            ${session_id ? `
            <tr>
              <td style="padding:8px 0;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Session</td>
              <td style="padding:8px 0;font-size:12px;color:#9A8F7E;">${escHtml(session_id)}</td>
            </tr>` : ""}
          </table>
          <p style="color:#9A8F7E;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;font-weight:600;">Last ${last_turns.length} Message${last_turns.length !== 1 ? "s" : ""}</p>
          <div style="background:#F9F6EF;border:1px solid #EDE8DC;border-radius:4px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;">${transcriptRows}</table>
          </div>
        </div>
      </td>
    </tr>`;
}

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.5; // advisory only — low scores are flagged, never blocked

// Verify a reCAPTCHA v3 token. Lead-safe by design: it blocks the dominant spam
// vector (missing or forged token) but NEVER rejects a genuine token over its score
// — a real enquiry must not be lost (v3 routinely scores privacy/incognito users low).
// Fails open on Google/infra errors, and is skipped entirely when no secret is set.
async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: "missing-token" };
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token }),
    });
    const data = await res.json();
    if (data?.success !== true) {
      return { ok: false, reason: "verify-failed", codes: data?.["error-codes"] };
    }
    const score = typeof data.score === "number" ? data.score : null;
    return { ok: true, score, lowScore: score !== null && score < RECAPTCHA_MIN_SCORE };
  } catch {
    return { ok: true, reason: "verify-error" }; // fail open — never lose a lead to an outage
  }
}

const RECIPIENTS = [
  // Backend-only routing inbox — never rendered to visitors (server-side recipient only).
  // All enquiries route here; this address must NOT appear anywhere on the public site.
  // (Confirmed deliverable via ACS. The public-facing email stays info@vowsandvedas.com.)
  { address: "arunima.sethi@vowsandvedas.com", displayName: "Vows & Vedas" },
];

// CC'd on every enquiry (server-side only, like the recipient above).
const CC_RECIPIENTS = [
  { address: "anamta.ali@getsholidays.com", displayName: "Anamta Ali" },
  { address: "nikhil.arora@wearemci.com",   displayName: "Nikhil Arora" },
  { address: "rakesh.bijewar@wearemci.com", displayName: "Rakesh Bijewar" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Known disposable / throwaway email domains. Real couples don't use these;
// bots and testers do. Used only to FLAG (never block) a submission.
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamailblock.com", "sharklasers.com",
  "grr.la", "spam4.me", "10minutemail.com", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "yopmail.com", "trashmail.com", "getnada.com", "nada.email",
  "dispostable.com", "maildrop.cc", "fakeinbox.com", "mailnesia.com", "mytemp.email",
  "tempmailo.com", "emailondeck.com", "moakt.com", "tempr.email", "mohmal.com",
  "mailcatch.com", "inboxkitten.com", "discard.email", "spamgourmet.com",
]);

// Lead-safe spam heuristics: returns a list of human-readable reasons a submission
// looks automated. NEVER used to reject — the caller only tags the email for review,
// so a false positive can never cost a real lead.
function detectSpam({ botField, email, recaptcha }) {
  const reasons = [];
  if (botField && String(botField).trim() !== "") {
    reasons.push("Honeypot field was filled — only bots do this");
  }
  const domain = (email.split("@")[1] || "").toLowerCase().trim();
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    reasons.push(`Disposable email domain (${domain})`);
  }
  if (recaptcha?.lowScore) {
    reasons.push(`Low reCAPTCHA score (${recaptcha.score})`);
  }
  return reasons;
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { firstName, lastName, email, phone, destination, weddingDate, message, botField, chatbotContext, recaptchaToken, sourcePagePath, referrerUrl, sessionId, userId } = body ?? {};

  if (!firstName?.trim())
    return Response.json({ error: "firstName is required." }, { status: 400 });
  if (!lastName?.trim())
    return Response.json({ error: "lastName is required." }, { status: 400 });
  if (!email?.trim() || !EMAIL_RE.test(email.trim()))
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  if (firstName.trim().length > 50 || lastName.trim().length > 50)
    return Response.json({ error: "Name must be under 50 characters." }, { status: 400 });
  if (message && message.length > 2000)
    return Response.json({ error: "Message must be under 2000 characters." }, { status: 400 });
  if (chatbotContext !== undefined && (typeof chatbotContext !== "object" || Array.isArray(chatbotContext)))
    return Response.json({ error: "Invalid chatbotContext." }, { status: 400 });

  const recaptcha = await verifyRecaptcha(recaptchaToken);
  if (!recaptcha.ok) {
    console.warn("Contact reCAPTCHA blocked:", recaptcha.reason, recaptcha.codes ?? "");
    return Response.json(
      { success: false, error: "Your submission could not be verified. Please try again." },
      { status: 400 }
    );
  }
  if (recaptcha.lowScore) {
    console.warn("Contact reCAPTCHA low score (allowed):", recaptcha.score);
  }

  // Flag-first spam detection — tags suspicious submissions but never blocks them,
  // so a genuine enquiry is never lost. The team can filter/ignore flagged mail.
  const spamReasons = detectSpam({ botField, email: email.trim(), recaptcha });
  const isFlagged = spamReasons.length > 0;
  if (isFlagged) {
    console.warn("Contact submission flagged (allowed):", spamReasons.join("; "));
  }

  try {

    const client = getEmailClient();

    const emailMessage = {
      senderAddress: process.env.AZURE_SENDER_ADDRESS,
      replyTo: [{ address: email, displayName: `${firstName} ${lastName}` }],
      content: {
        subject: `${isFlagged ? "[POSSIBLE SPAM] " : ""}New Wedding Enquiry — ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A1408;">
            <div style="background: #1A1408; padding: 24px 32px; text-align: center;">
              <h2 style="color: #C9A234; margin: 0; font-weight: 300; letter-spacing: 4px; font-size: 13px; text-transform: uppercase;">
                New Enquiry — Vows &amp; Vedas
              </h2>
            </div>
            <div style="padding: 32px; background: #FDFAF5; border: 1px solid #EDE8DC;">
              ${isFlagged ? `
              <div style="background:#FDECEA;border-left:4px solid #C0392B;padding:12px 16px;margin-bottom:22px;border-radius:0 4px 4px 0;">
                <p style="margin:0 0 6px;font-size:12px;color:#922B21;font-weight:700;">⚠ Possible spam — flagged for review, NOT blocked. Verify before acting.</p>
                <ul style="margin:6px 0 0;padding-left:18px;font-size:12px;color:#922B21;line-height:1.6;">
                  ${spamReasons.map(r => `<li>${escHtml(r)}</li>`).join("")}
                </ul>
              </div>` : ""}
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:38%;">Name</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;"><a href="mailto:${email}" style="color:#C9A234;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Phone</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;">${phone || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Destination</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;">${destination || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Wedding Date</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;">${weddingDate || "—"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Enquiry Source</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:13px;">${sourcePagePath ? `<a href="${escHtml(sourcePagePath)}" style="color:#C9A234;">${escHtml(sourcePagePath)}</a>` : "—"}</td>
                </tr>
                ${referrerUrl ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;">External Referrer</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:13px;color:#5a5a5a;word-break:break-all;"><a href="${escHtml(referrerUrl)}" style="color:#C9A234;">${escHtml(referrerUrl)}</a></td>
                </tr>` : ""}
                ${message ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;color:#9A8F7E;font-size:11px;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">Vision</td>
                  <td style="padding:10px 0;border-bottom:1px solid #EDE8DC;font-size:15px;line-height:1.7;">${escHtml(message)}</td>
                </tr>` : ""}
                ${buildChatbotSection(chatbotContext)}
              </table>
            </div>
            <div style="padding:16px 32px;background:#1A1408;text-align:center;">
              <p style="color:#C9A234;margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                Vows &amp; Vedas · Curating Rare Moments
              </p>
            </div>
          </div>
        `,
      },
      recipients: {
        to: RECIPIENTS,
        cc: CC_RECIPIENTS,
      },
    };

    const poller = await client.beginSend(emailMessage);
    const result = await poller.pollUntilDone();

    if (result.status !== "Succeeded") {
      throw new Error(`Email send failed with status: ${result.status}`);
    }

    // Fire-and-forget: save enquiry to DB if user is logged in
    getSession().then((session) => {
      if (!session) return;
      return getEnquiriesContainer().items.create({
        id: randomUUID(),
        userId: session.sub,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        destination: destination ?? "",
        weddingDate: weddingDate ?? "",
        message: message ?? "",
        submittedAt: new Date().toISOString(),
        // Phase 0: link enquiry ↔ chatbot conversation (camelCase sessionId, D-030).
        sessionId: sessionId || chatbotContext?.session_id || null,
      });
    }).catch((err) => console.error("Enquiry DB save error:", err));

    // Fire-and-forget telemetry — never awaited so it can't block the response
    trackEvent("EnquirySubmitted", {
      sourcePagePath:     sourcePagePath || "",
      referrerUrl:        referrerUrl    || "",
      destination:        destination    || "",
      weddingDate:        weddingDate    || "",
      hasMessage:         !!message,
      hasChatbotContext:  !!chatbotContext,
      flaggedSpam:        isFlagged,
      spamReasons:        spamReasons,
      intentLevel:        chatbotContext?.intent_level        || "none",
      citiesExplored:     chatbotContext?.cities              || [],
      venuesViewed:       chatbotContext?.venues_viewed       || [],
      budgetTier:         chatbotContext?.budget_tier         || "",
      sessionId:          sessionId || chatbotContext?.session_id || "",
      userId:             userId || "",
    });

    // Confirmation email to the enquirer.
    // Skipped for flagged submissions: the address may be forged/disposable, and
    // auto-replying to it would make us a spam relay (backscatter). The team is
    // still notified above, so a mis-flagged real lead is never dropped — they'll
    // simply get a personal reply instead of the instant auto-confirmation.
    let confirmationError = null;
    if (!isFlagged) try {
      const confirmationMessage = {
        senderAddress: process.env.AZURE_SENDER_ADDRESS,
        replyTo: [{ address: "info@vowsandvedas.com", displayName: "Vows & Vedas" }],
        content: {
          subject: "We've received your enquiry — Vows & Vedas",
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1A1408;">
              <div style="background: #1A1408; padding: 32px; text-align: center;">
                <p style="color: #C9A234; margin: 0 0 8px; font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 500;">Vows &amp; Vedas</p>
                <h1 style="color: #FDFAF5; margin: 0; font-weight: 300; font-size: 28px; letter-spacing: 2px;">Thank You, ${escHtml(firstName)}</h1>
              </div>
              <div style="padding: 40px 32px; background: #FDFAF5; border: 1px solid #EDE8DC;">
                <p style="font-size: 16px; line-height: 1.8; color: #1A1408; margin: 0 0 24px;">
                  We've received your enquiry and are delighted to begin this journey with you. Our planning team will be in touch within <strong>24–48 hours</strong> to explore your vision and put together a tailored proposal.
                </p>
                <div style="border-left: 2px solid #C9A234; padding-left: 20px; margin: 28px 0;">
                  <p style="font-size: 13px; color: #9A8F7E; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 2px; font-size: 10px;">What happens next</p>
                  <p style="font-size: 14px; line-height: 1.8; color: #1A1408; margin: 0 0 10px;">
                    <strong style="color: #C9A234;">1.</strong> Our team reviews your enquiry and gathers the best options for your celebration.
                  </p>
                  <p style="font-size: 14px; line-height: 1.8; color: #1A1408; margin: 0 0 10px;">
                    <strong style="color: #C9A234;">2.</strong> We reach out to schedule a short discovery call — no obligation, just a conversation.
                  </p>
                  <p style="font-size: 14px; line-height: 1.8; color: #1A1408; margin: 0;">
                    <strong style="color: #C9A234;">3.</strong> You receive a personalised proposal built around your vision, destination, and budget.
                  </p>
                </div>
                <p style="font-size: 14px; line-height: 1.8; color: #9A8F7E; margin: 28px 0 0;">
                  In the meantime, feel free to explore our <a href="https://vowsandvedas.com/moodboards" style="color: #C9A234; text-decoration: none;">moodboards</a> and <a href="https://vowsandvedas.com/destinations" style="color: #C9A234; text-decoration: none;">destinations</a> for inspiration. If you have any questions, simply reply to this email.
                </p>
              </div>
              <div style="padding: 20px 32px; background: #1A1408; text-align: center;">
                <p style="color: #C9A234; margin: 0; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">
                  Vows &amp; Vedas · Curating Rare Moments
                </p>
              </div>
            </div>
          `,
        },
        recipients: {
          to: [{ address: email.trim(), displayName: `${firstName} ${lastName}` }],
        },
      };
      const confirmPoller = await client.beginSend(confirmationMessage);
      const confirmResult = await confirmPoller.pollUntilDone();
      if (confirmResult.status !== "Succeeded") {
        confirmationError = `Confirmation send status: ${confirmResult.status}`;
      }
    } catch (confirmErr) {
      confirmationError = confirmErr.message;
    }

    return Response.json({ success: true, confirmationError });
  } catch (err) {
    console.error("Contact form error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
