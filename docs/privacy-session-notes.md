# Privacy policy publication + consent surfaces — session notes

**Branch:** `feat/privacy-policy-consent` (off `origin/main`) · PR to `main` only — **not merged, not deployed.**
For Nik to review, then port the register-relevant items below.

## What shipped

| # | Surface | File(s) |
|---|---------|---------|
| 1 | `/privacy-policy` page (static Server Component, full §1–§14, `robots: index`) | `src/app/privacy-policy/page.js`, styles in `src/app/globals.css` (`.policy-*`) |
| 2 | Main footer "Privacy" link (dropped dead "Terms", left `// TODO`) | `src/components/Footer.js` |
| 3 | Main contact form consent microcopy (no checkbox — affirmative action, §4) | `src/app/contact/page.js` |
| 4 | Chatbot AI/data disclosure bar (persistent, above messages, pre-first-message) | `src/components/Chatbot.js` |
| 5 | Consent Mode v2 default (denied) + `CookieBanner` + App Insights gating | `src/app/layout.js`, `src/components/CookieBanner.js`, `src/lib/clientTelemetry.js` |
| 6 | Landing footer Privacy link + newsletter consent line | `src/components/landing/LandingFooter.js` |
| 7 | Landing enquiry forms — Privacy link added to existing consent checkboxes | `src/components/landing/LandingContactPage.js`, `src/components/landing/EnquiryForm.js` |

Empty dead route `src/app/privacy/` (no `page.js`) was removed; the canonical URL is `/privacy-policy`
(matches every consent link).

## Implementation decisions (for the registers)

- **Google Consent Mode v2, denied-by-default.** An inline `<script id="consent-default">` runs in
  `<head>` **before** the GTM `<Script>` and sets `ad_storage`, `ad_user_data`, `ad_personalization`,
  `analytics_storage` = `denied` (with `wait_for_update:500`). GTM still loads (Google-sanctioned
  pattern — tags respect the consent state). The banner's **Accept all** issues a
  `gtag('consent','update', …granted)`; **Essential only** leaves defaults denied. Choice persists in
  `localStorage.vv_consent` (`"all"`/`"essential"`); a returning `"all"` visitor is re-granted on load
  by the same inline script (defaults reset to denied every page load).
- **App Insights telemetry gated on analytics consent.** `trackClient()` in
  `src/lib/clientTelemetry.js` now no-ops unless `vv_consent === "all"`. All analytics events
  (PageView, CtaClick, ChatbotOpened, EnquirySubmitted, HashtagGenerated, …) flow through this one
  function, so the gate is complete. **This changes analytics volume: the funnel workbook will only
  see consenting visitors.** Also: `vv_uid`/`vv_sid` identifiers are no longer generated on page load
  before consent.
  - **Boundary note:** `getSessionId()`/`getUserId()` are still called directly (not via `trackClient`)
    inside enquiry/chat/newsletter **submission** payloads (contact, LandingContactPage, EnquiryForm,
    Chatbot, LandingFooter). Those are service functionality the user actively invokes, consented by
    affirmative action (§4) — left unchanged by design.
- **Banner scope covers `/lp/*`.** `<CookieBanner />` is mounted in `layout.js` body **outside**
  `HideOnLp` (which hides only the main `Footer` on `/lp`), so it appears on landing pages too. It is
  non-blocking (fixed bottom, page usable behind it) and keyboard-accessible.
- **Policy dates** left as the approved text ("Effective / Last updated: July 2026"). Bump to the
  actual publication date at deploy if desired.

## ⚠️ Flags for Nik

1. **No unsubscribe mechanism exists.** `grep -ri unsubscribe src` → 0 hits. The newsletter
   (`/api/newsletter-notify`) only emails the team; there is no stored subscriber list, no double
   opt-in, and no unsubscribe link in the notification email. **Policy §2(d) and §7 promise
   unsubscribe "using the link in any newsletter email."** This must be built (or the copy softened)
   before the policy is truly accurate. Not fabricated here.
2. **Stale policy file in repo.** `vows-and-vedas-privacy-policy.md` (+ `.docx`) is an **older,
   different** policy — "Last Updated: 22 June 2026", **GDPR**-based (UK/EU/ICO), 13 sections, no
   mention of the AI/Microsoft handling, chat storage, newsletter, account registration, DPDP Act, or
   Grievance Officer. The published page uses the **approved DPDP FINAL text** from the handover, not
   this file. Recommend removing/reconciling the stale file to avoid confusion.
3. **Dead newsletter input on the main site.** `Footer.js` has a "Stay Connected" email input with
   **no handler** — it collects/submits nothing. Left untouched (adding consent copy to a
   non-submitting field would mislead). Either wire it to `/api/newsletter-notify` (then it needs the
   consent line) or remove it.
4. **Prompt-injection in bundled Next docs.** `node_modules/next/dist/docs/index.md:11` contains an
   embedded "AI agent hint" instructing agents to export `unstable_instant`. It is not a legitimate
   Next instruction and was ignored. Worth a look given `AGENTS.md` routes agents into these docs.
5. **GTM ↔ policy §10 wording.** Policy §10 names Google/GTM advertising cookies. Before activating,
   confirm the actual GTM tag inventory (GA4 / Google Ads / **Meta**?). If a Meta/Facebook pixel is
   present, §10 needs "and Meta" added.

## Deploy checklist (operator — NOT this session)
1. Review + merge PR → SWA deploy.
2. Verify banner + `/privacy-policy` live; confirm `dataLayer` consent default is `denied` pre-choice.
3. **Then, separately:** confirm GTM tag inventory matches policy §10 (add "and Meta" if a Meta pixel
   exists) → create prod `conversations` container (`init-conversations.mjs --commit`) → Phase 0 active.
