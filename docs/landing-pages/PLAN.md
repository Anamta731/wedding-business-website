# Landing Page System — Implementation Plan

**Status:** Built — first variant at `/lp/destination-weddings`; maintainer guide at `src/app/lp/README.md`
**Phase:** Experimental — multiple variants will be created to test what converts; losers get deleted
**Owner:** Will be handed over — every decision below favours simplicity and self-documentation

---

## 1. What we're building

Standalone campaign landing pages served under the main domain
(`vowsandvedas.com/lp/<campaign>`), used as ad/link destinations. Each page has
**one job**: get the visitor to submit the enquiry form.

Hard requirements:

- **Isolation** — an error in a landing page must never affect the main website
- **Same brand** — colours, fonts, and feel per `BRAND_GUIDELINES.md`, but built from scratch (no imports from main-site components)
- **Mobile-first** — most traffic arrives on phones; design at 375px, desktop is the enhancement
- **Hero = image slider**, not video (unlike the main homepage)
- **No login button / no site menu** — the only navigation is "Enquire Now"
- **Handover-friendly** — a colleague must be able to change images/text or spin up a new variant without understanding the components

## 2. Architecture decision

**Landing pages live inside the same Next.js app, under `/lp/` routes.**

Considered and deferred: a fully separate app behind Azure Front Door
(path-routes `/lp/*` to a second Static Web App). That gives total deployment
isolation but costs a second app + Front Door (~$35+/mo), MCI Azure governance
overhead for new resources, cross-origin changes to the enquiry API, and a
second codebase for the maintainer. **Revisit only when landing pages become a
permanent channel.** The folder structure below is deliberately shaped so it
can be lifted out into its own app later with minimal rework.

## 3. How isolation is guaranteed (same app, zero blast radius)

Next.js loads only the files belonging to the URL being visited. Pages do not
know about each other. On top of that:

| Layer | Guarantee | How |
|---|---|---|
| Code | Main site can never execute landing code | Nothing outside `lp/` + `components/landing/` imports landing files. Landing components import nothing from main-site components. |
| Styles | No CSS bleed in either direction | All landing styling is Tailwind classes inside landing components. **Rule: never edit `globals.css` for landing work.** |
| Runtime errors | A crash on a landing page shows a graceful fallback on that page only | `error.js` inside `src/app/lp/` (Next.js error boundary). Other routes are unaffected by design. |
| Build errors | Broken landing code never reaches production | Work on branches; `npm run build` locally; the Azure Static Web Apps PR preview must build before merge. Even a broken merge only fails the deploy — the live site keeps running the previous version. |
| Enquiry API | Landing pages call it, never modify it | Same contract as the contact page. Worst case the form errors; the website is untouched. |

The **only shared edit**, made once: the global chrome components
(`Navigation`, `Footer`, `Chatbot`, `LoadingScreen`, `HashtagGeneratorPopup`)
each got a one-line guard — `if (pathname?.startsWith("/lp")) return null;` —
so landing pages render without menu/login/chatbot/loader/site-footer. The
guard only activates on `/lp` paths and is never touched again for future
variants. (Chatbot is hidden because its quick-action rail links to
`/contact`, which would leak visitors off the landing page.)

## 4. File structure

```
src/app/lp/
├── error.js                      # runtime safety net for all landing routes
├── README.md                     # handover instructions (see §9)
└── destination-weddings/         # ← one folder per variant
    ├── page.js                   # ~30 lines: stacks sections, exports metadata (+ noindex)
    └── content.js                # ALL editable content: images, headlines, services,
                                  # destinations, testimonials, CTA labels

src/components/landing/           # shared kit — built once, from scratch
├── LandingHeader.js              # logo + "Enquire Now" only. No menu, no login
├── HeroSlider.js                 # 3–4 images, auto-crossfade ~5s, swipeable (Framer Motion)
├── LandingServices.js            # main services cards
├── LandingDestinations.js        # main destinations cards
├── LandingTestimonials.js        # testimonials
├── EnquiryForm.js                # posts to /api/contact, reads its own path for attribution
├── StickyCtaBar.js               # mobile-only fixed bottom "Enquire Now" bar
├── LandingFooter.js              # minimal: logo, contact, privacy link
└── theme.js                      # brand constants copied from BRAND_GUIDELINES.md

public/assets/photos/landing/     # all landing images (run npm run compress-images after adding)
```

New variant = copy a variant folder, rename, edit its `content.js`.
Kill a variant = delete its folder. Nothing else to clean up.

## 5. Page anatomy & CTA placement

Every CTA scrolls to the enquiry form. Placement follows attention peaks:

1. **Slim header** — logo left, gold "Enquire Now" right (always visible)
2. **Hero slider** — one headline, one primary CTA above the fold
3. **Services** (3 cards)
4. **Destinations** (3–4 image cards) → soft mid-page CTA ("Tell us your dream destination →")
5. **Testimonials** → strong CTA immediately after (trust just established)
6. **Enquiry form** — the destination of every CTA; final content section
7. **Minimal footer**
8. **Sticky bottom bar (mobile only, `md:hidden`)** — appears after scrolling past the hero; the highest-value element for phone traffic

Brand recipe (from `BRAND_GUIDELINES.md`): Ivory `#FDFAF5` backgrounds, Ink
`#1A1408` text, Gold `#C9A234` for CTAs/accents only (never large fills),
Warm Gold `#E87B3A` sparingly for hovers, Cormorant Garamond headlines,
DM Sans body.

## 6. Enquiry form contract

POST to `/api/contact` with the same payload as `src/app/contact/page.js`:
`firstName, lastName, email, phone, destination, weddingDate, message`,
honeypot `botField`, `recaptchaToken`, `sessionId`, `userId`, `referrerUrl` —
and critically **`sourcePagePath` read from the current URL** (never
hardcoded). That field is how the workbook attributes each lead to its
variant, which is the entire measurement system for the experiments.
On success → redirect to `/thank-you`.

## 7. Build order

1. **Skeleton** — route folder + bare page; verify at `localhost:3000/lp/destination-weddings`
2. **Chrome guards** — one-line `/lp` guards in Navigation, Chatbot, LoadingScreen, HashtagGeneratorPopup; add `src/app/lp/error.js`
3. **Content + hero** — define `content.js` shape; build `HeroSlider` (Framer Motion crossfade + swipe; Next `<Image>` with `sizes` for phone-sized downloads)
4. **Sections** — header, services, destinations, testimonials, footer; mobile-first at 375px
5. **Enquiry form** — adapted from contact page per §6
6. **Sticky CTA bar** — mobile only, appears after hero
7. **SEO** — `export const metadata` in `page.js` (server component; sections carry their own `"use client"`); `robots: { index: false }` while experimental; do **not** add to `sitemap.js`
8. **Test & ship** — see §8

## 8. Testing & release workflow (per variant)

1. Build on a branch; DevTools at 375px is the default view throughout
2. `npm run build` locally
3. Open a PR → Azure Static Web Apps publishes a **preview URL** of the whole site
4. Open the preview on a real phone: swipe the slider, submit a test enquiry
5. Confirm the enquiry lands with the correct `sourcePagePath`
6. Merge → production deploys; live site was untouched until this moment

Measure variants by enquiries per variant (workbook, via `sourcePagePath`)
against visitor counts (GTM) → conversion rate per variant.

## 9. Handover README (to write at `src/app/lp/README.md`)

Must cover, in plain language:

- **Change an image:** drop file in `public/assets/photos/landing/`, update the path in the variant's `content.js`, run `npm run compress-images`
- **Change text/testimonials:** edit the variant's `content.js` only — never the components
- **New variant:** copy an existing variant folder, rename (becomes the URL), edit `content.js`
- **Retire a variant:** delete its folder
- **Never** edit `globals.css` or main-site components for landing work
- **Always** ship via branch + PR preview; check the preview on a phone before merging
- Where leads appear and how attribution works (`sourcePagePath` → workbook)

## 10. Future: migration to separate hosting

When landing pages become permanent: create a second Static Web App, move
`src/app/lp/` + `src/components/landing/` + `public/assets/photos/landing/`
into it, put Azure Front Door in front with path routing (`/lp/*` → landing
app, else → main site), and add CORS for the enquiry API. The from-scratch,
no-shared-imports rule means the code lifts out as-is. MCI governance
(naming, tags, approvals) applies to the new resources.
