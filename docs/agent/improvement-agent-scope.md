# Improvement Agent — Phase 1 Scope (allow-list / deny-list)

This is the **hard boundary** for what the autonomous improvement agent may
change on Vows & Vedas. The agent proposes everything as a PR for human merge (it
never merges, force-pushes, or deploys). Even so, its diffs must stay inside the
allow-list below. A reviewer who sees a PR touching anything in the deny-list
should reject it on sight — that is a scope breach, not a judgment call.

Rationale: the site is a live lead-gen funnel (enquiry = revenue). Phase 1
deliberately limits the agent to the **highest signal-to-risk surface** —
user-visible **marketing / CTA / form copy** — so a bad suggestion costs at most
a `git revert`, never a logic or telemetry regression. Scope widens only after
the loop earns trust.

> This site is **English-only** (`<html lang="en">`, `src/app/layout.js`). There
> is no i18n table — every string is an inline JSX literal. A copy change touches
> exactly one language, so there is no locale fan-out (unlike the GeTS chatbot).
> **Before any edit, read `BRAND_GUIDELINES.md`** — copy must match the brand
> voice (refined, warm, heritage, understated-confident; never boastful/corporate).

---

## ✅ ALLOWED in Phase 1 — user-visible copy string literals only

The agent may edit the **text content** of existing strings in these files. It
may NOT restructure markup, rename/remove elements, change attributes, add
imports, or add new files (except the ledger).

| File | Editable copy |
|---|---|
| `src/app/page.js` | Home hero eyebrow / title words / subtitle; primary CTA labels (*Plan Your Wedding*, *View Our Work*); the 5 process step titles+descriptions (**edit BOTH the desktop and mobile copies — they are duplicated**); section teasers; final-CTA block (*Your Story Awaits* / *Begin Your Journey With Us* / *Start Planning*). |
| `src/app/contact/page.js` | Eyebrow (*Let's Begin*), heading (*Tell Us About Your Dream Day*), field **labels** and placeholders, submit button (*Send My Enquiry*), the failure `alert()` text, "Or reach us directly" block, side quote. Copy strings ONLY — see landmines below. |
| `src/app/thank-you/page.js` | Page `metadata` title/description, headings, the 24–48h confirmation body, "Back to Home" CTA. |
| `src/components/Navigation.js` | Nav link labels and the primary nav CTA (*Begin Your Journey*). |
| `src/components/Footer.js` | Brand tagline, column headers, newsletter line + placeholder, copyright, "Privacy · Terms". |
| `src/components/FloatingSidebar.js` | Section titles and link labels. |
| `src/components/Chatbot.js` | Copy constants ONLY: `GET_QUOTE_LABEL`, `STARTERS`, `INITIAL_MESSAGE`, lead-form heading/placeholders, composer placeholder, user-facing validation/fallback strings. NOT the handlers, state, `fireLeadNotify`/`submitLead` logic, or the `trackClient` calls. |
| `src/app/api/contact/route.js` | **Email HTML/subject copy literals ONLY** — the enquiry subject, the confirmation email subject/greeting/body/steps. Treat this file as high-risk; see landmines. |

Marketing copy on secondary pages (`about`, `services`, `faq`, `portfolio`,
`destinations/**`, `moodboards`, `experiences`, `venues`, `ideas`) follows the
same inline-literal pattern and is **in scope** when the funnel points there
(e.g. a leak on a specific `sourcePagePath`). Same rule: text content only.

### The agent's own bookkeeping
- `docs/experiments/EXPERIMENTS.md` — append exactly one row per experiment.

---

## ⛔ DENIED in Phase 1 (reviewer rejects on sight)

| Surface | Why off-limits |
|---|---|
| Telemetry code — `src/lib/telemetry.js`, `src/lib/clientTelemetry.js`, `src/components/PageTracker.js`, `src/app/api/track/route.js`, and **any `trackClient(...)` / `trackEvent(...)` call or event name** | Breaks the funnel or its measurement — the very thing the loop reads. |
| `src/app/api/contact/route.js` **logic** — recipient/CC email addresses (L142–150), reCAPTCHA (`RECAPTCHA_SECRET_KEY`, `RECAPTCHA_MIN_SCORE`), validation rules, ACS/Cosmos calls | Lead delivery + anti-spam + data integrity. A regression here silently loses real enquiries. |
| Contact form **field `name`/`id` attributes** (`fname`, `lname`, `email`, `phone`, `destination`, `estimatedWeddingDate`, `message`) | `handleSubmit` reads `form.<name>.value` — renaming breaks submission. |
| **Markup/structure** bound to GSAP selectors in `src/app/page.js` (`.hero-title .word`, `.hero-eyebrow`, `.hero-subtitle`, `.hero-ctas`, timeline steps) | Editing text is safe; restructuring the surrounding elements breaks animations. |
| Any `route.js` request/response logic, `src/lib/*` (retrieval, intent, cosmos, session, suggestions, staticFaqs), chat/auth/hashtag APIs | Core behaviour; out of a copy-only phase. |
| `infra/**` (Bicep), `workbook/**`, Key Vault, any secret / env value, SWA app settings | Security + cost surface; governed by MCI DevOps. Env levers ship via `az staticwebapp appsettings`, not a PR. |
| `.github/workflows/**` | The deploy + agent pipeline itself — never agent-editable. |
| New dependencies, new files (except the ledger), new components | Out of Phase-1 scope; widen deliberately, not by drift. |

---

## Invariants (apply to every allowed change)

1. **One experiment per PR.** Never batch unrelated changes — it destroys
   attribution (we can only read one A/B at a time).
2. **Evidence-backed.** Every PR cites snapshot numbers (see
   `improvement-agent-prompt.md`).
3. **On-brand.** Copy matches `BRAND_GUIDELINES.md` voice and never promises what
   the team can't keep (no invented response-time SLAs beyond the existing 24–48h,
   no fake "free"/guarantee claims, no discounts).
4. **Reversible.** The change must be a clean `git revert` with no follow-on.
5. **No second PR** until the prior experiment's observation window has closed and
   its ledger row has a verdict.
