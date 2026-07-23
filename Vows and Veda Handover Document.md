# Work Handover — Vows & Vedas Website

**Prepared by:** Anamta
**Role:** AI Engineer Intern
**Period:** _[Start month] – July 2026_
**Project:** Vows & Vedas — luxury destination-wedding website (https://vowsandvedas.com)
**Organisation:** MCI Group / GeTS Holidays

> **Purpose of this document.** This is a record of the work I designed, built and delivered
> during my internship on the Vows & Vedas project. It is a companion to the two technical
> handover documents already in the repository — [vows-and-vedas-handover.md](vows-and-vedas-handover.md)
> (how the full system works) and [FRONTEND-DEVELOPER-HANDOVER.md](FRONTEND-DEVELOPER-HANDOVER.md)
> (guide for the incoming frontend developer). Both of those were also authored as part of my work.

---

## 1. Summary

I contributed to the end-to-end build of the Vows & Vedas lead-generation website — a
**Next.js 16 / React 19 / Tailwind CSS 4** application deployed on **Azure Static Web Apps**,
backed by **Azure Cosmos DB, Azure OpenAI, Azure AI Search, Azure Communication Services and
Azure Application Insights**. My work spanned the public website, an AI-powered conversational
concierge ("MIRA"), the lead / enquiry funnel, passwordless authentication and the signed-in
user area, an analytics and reporting pipeline, an autonomous copy-experimentation agent, a
DPDP-compliant privacy & consent system, and a self-contained campaign landing-page system.
I also authored the project's technical documentation and handover materials.

---

## 2. Main Website

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP / Framer Motion animation.

- Built and maintained the public marketing pages — home, about, services, destinations
  (with dynamic category routes), portfolio, mood boards, ideas, venues, experiences, FAQ,
  contact and thank-you — with responsive layouts and scroll-driven animation.
- Implemented the **mood board and "ideas" save experience**: guests are prompted to sign in,
  signed-in users get an optimistic heart/save UI, and saved items surface in their account.
- Handled **image and performance tooling** — Sharp-based compression and blur-placeholder
  generation scripts run over every new asset batch, since Azure Static Web Apps does not run
  the Next.js image optimizer.
- Implemented **SEO fundamentals** — dynamic sitemap with per-page priorities, robots rules,
  and Google Tag Manager integration.

### Authentication & signed-in user area
- Built **passwordless magic-link authentication** end-to-end: email capture, one-time
  time-limited tokens stored in Cosmos DB (auto-expiring), branded verification emails via
  Azure Communication Services, and HTTP-only JWT session cookies.
- Built the full **profile section** — wedding-details profile editor, saved ideas, my
  enquiries, notification preferences, and account settings including GDPR/DPDP-style
  full account-and-data deletion.
- Designed the **Cosmos DB data model** (users, auth tokens, saved ideas, enquiries) and the
  set of session-guarded user APIs behind these pages.

### Enquiry / lead funnel
- Built the core **enquiry submission path** (`/api/contact`): validated multi-field form with
  an international dial-code selector, **reCAPTCHA v3** verification (fail-open), and
  **flag-first spam detection** (honeypot + disposable-domain + score checks that tag rather
  than drop leads, so no genuine enquiry is ever lost).
- Wired enquiries to a **team notification email** (including chatbot conversation context when
  present), an **enquirer confirmation email**, a Cosmos DB record for signed-in users, and a
  funnel telemetry event.

---

## 3. MIRA — AI Chatbot (RAG system)

Designed and built the site's conversational wedding concierge — the most complex component of
the project — as a four-stage **retrieval-augmented generation (RAG)** pipeline over
**Azure OpenAI + Azure AI Search**.

- **Static FAQ fast-path** that answers high-volume questions instantly with zero LLM cost.
- **Structured intent extraction** (JSON-mode LLM call) that pulls cities, venue type, dates,
  guest count, budget tier, services and conversation stage from each turn, and **accumulates
  context across the whole conversation**.
- **Vector retrieval** with query embedding, metadata filtering, city/venue and pricing
  score-boosting, venue deduplication, and a graceful unfiltered fallback.
- **Streamed generation (SSE)** from a large, carefully engineered persona/system prompt with
  formatting rules, confirmed venue pricing, and per-stage conversation hints.
- **Lead capture from chat** — inline contact form on high-intent conversations, automatic team
  lead-notification emails, and a handoff flow that carries chat context into the contact form.
- **Feedback loop** — per-message thumbs up/down, with thumbs-down responses emailed to the team
  for review.
- Built the **knowledge-base indexing pipeline** (Node and Python indexers) that chunks and
  embeds the source content into Azure AI Search, with a documented update procedure.

### Chatbot quality evaluation
- Ran a structured **24-test QA evaluation** of MIRA across six categories (persona & tone,
  knowledge, conversation depth, services, sales funnel, edge cases), produced weighted category
  scores and a prioritised list of critical issues and strengths to guide future improvement.

---

## 4. Analytics, Reporting & Autonomous Improvement Agent

- Built a **privacy-safe telemetry pipeline** — client beacons → whitelisted server ingestion →
  Azure Application Insights — tracking the full acquisition-to-enquiry funnel with per-session
  and persistent anonymous visitor IDs, and lead source-page attribution. No PII is ever sent.
- Built **Azure Monitor workbooks** (a comprehensive dashboard plus an enquiry deep-dive)
  covering traffic, acquisition, the conversion funnel, CTA channels, chatbot metrics and errors.
- Built an **autonomous improvement agent** — a scheduled GitHub Actions loop that reads the live
  analytics funnel, identifies the biggest drop-off, and opens a single scoped copy-change pull
  request, gated by automated review and human merge. Includes an experiment ledger to track
  each hypothesis and result.

---

## 5. Privacy & Consent (DPDP)

- Published a **DPDP-compliant privacy policy** and implemented the associated **user-consent
  surfaces** across the site, plus the account-level data-deletion capability described above.

---

## 6. Campaign Landing-Page System

Designed and built a **reusable, fully isolated landing-page system** for paid ad campaigns,
living in the same Next.js app under `/lp/…` routes but architecturally walled off from the
main website.

- Built the landing component kit (`src/components/landing/`) **from scratch** — hero image
  slider, enquiry form, service/feature sections, testimonials and footer — with **zero shared
  imports** from the main-site components; brand values were copied in, not shared, so the two
  code areas can never affect one another.
- Adopted a **content-driven structure**: each campaign variant has its own `content.js` holding
  all copy and image paths, so a non-technical editor (or the incoming frontend developer) can
  change everything about a page in one file without touching component code. Creating a new
  variant is a folder copy; retiring one is a folder delete.
- Engineered **strict isolation** as the top priority — a dedicated `error.js` boundary so a
  crash in a campaign page shows a fallback on that page only and never takes down the main site,
  plus pathname guards that hide main-site chrome (navigation, chatbot, loading screen) on
  landing routes.
- Built a **mobile-first** experience, since most ad clicks come from phones, with a dedicated,
  compressed image set under `public/assets/photos/landing/`.
- Added **lead source-attribution** (`sourcePagePath` read from the URL, never hardcoded) so
  enquiries from each campaign are correctly attributed in the analytics workbook, and applied
  `noindex` + sitemap exclusion while pages are experimental.
- Delivered the **first live variant** (`/lp/destination-weddings`) end to end and documented the
  whole system for handover (maintainer README, plan document, and the frontend-developer guide).
- Confirmed the same single CI/CD pipeline deploys both sites together with build-gating, so a
  broken campaign experiment can never reach production.

---

## 7. DevOps & Deployment

- Worked within **Azure Static Web Apps** with a **GitHub Actions CI/CD pipeline** — automatic
  per-PR preview environments and automatic production deploys on merge, with build-gating so a
  failed build never reaches production.
- Contributed **Bicep infrastructure-as-code** for the monitoring stack and worked within MCI
  Group Azure governance conventions (resource naming, tagging, RBAC via PIM, Key Vault for
  secrets).
- Set up supporting automation — AI code-review on every PR, an on-demand assistant workflow,
  and Playwright-based screenshot review tooling.

---

## 8. Documentation

- Authored the **full technical developer handover** ([vows-and-vedas-handover.md](vows-and-vedas-handover.md))
  covering architecture, auth, data model, the chatbot pipeline, the lead funnel, analytics,
  the improvement agent, deployment and environment configuration.
- Authored a **beginner-friendly frontend developer handover** ([FRONTEND-DEVELOPER-HANDOVER.md](FRONTEND-DEVELOPER-HANDOVER.md))
  for the incoming developer, covering the stack, the two-site structure, safe-editing rules,
  Git workflow and deployment.
- Maintained supporting docs — brand guidelines, landing-page plan and maintainer guide,
  experiment ledger and infrastructure runbook.

---

## 9. Technologies Used

**Frontend:** Next.js 16, React 19, Tailwind CSS 4, GSAP, Framer Motion, JavaScript (ES modules).
**Backend / cloud:** Azure Static Web Apps, Azure Cosmos DB, Azure OpenAI, Azure AI Search,
Azure Communication Services, Azure Application Insights, Azure Monitor Workbooks, Azure Key Vault.
**AI / ML:** Retrieval-augmented generation (RAG), vector search & embeddings, prompt
engineering, structured intent extraction, LLM evaluation.
**DevOps:** GitHub Actions CI/CD, Bicep (infrastructure-as-code), Playwright, Sharp image pipeline.
**Practices:** passwordless auth, reCAPTCHA, DPDP privacy compliance, privacy-safe analytics.

---

_Prepared as part of the project handover._
