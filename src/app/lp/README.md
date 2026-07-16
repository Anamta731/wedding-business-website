# Landing Pages — How to Maintain

Campaign landing pages live here. Each folder = one page on the site:
`src/app/lp/destination-weddings/` → `vowsandvedas.com/lp/destination-weddings`

These pages are **isolated from the main website**: they use their own
components (`src/components/landing/`), and the main site's menu, chatbot
popup, loading screen and footer automatically stay off `/lp/` pages.
An error here shows a fallback on this page only ([error.js](error.js)).

## Change a photo

1. Drop the new image into `public/assets/photos/landing/` (or reuse an existing site photo).
2. Open the variant's `content.js` and update the path on the line you want.
3. Run `npm run compress-images` before committing.

## Change any text, testimonial, or service

Edit the variant's `content.js` only. **Never edit the components** — all
wording, headings, image paths and CTA labels live in `content.js`.

## Create a new variant

1. Copy an existing folder, e.g. `destination-weddings/` → `royal-weddings/`.
   The folder name becomes the URL (`/lp/royal-weddings`).
2. Edit the new folder's `content.js`.
3. That's it — the layout comes from the shared kit in `src/components/landing/`.

## Retire a variant

Delete its folder. Nothing else to clean up.

## Ship safely (always this way)

1. Work on a git branch, never on `main`.
2. Run `npm run build` — if it fails, fix before pushing.
3. Open a PR → Azure Static Web Apps posts a **preview URL** on the PR.
4. Open the preview **on a phone**: swipe the hero, submit a test enquiry.
5. Merge. The live site is untouched until this moment.

## Where leads go

The enquiry card posts to the same pipeline as the main contact page
(email to the team + saved to the database). Every lead is tagged with
this page's URL (`sourcePagePath`), so the workbook shows enquiries per
variant — that's how you compare which landing page converts best.

## Gotcha for new sections

The main site's global stylesheet gives every bare `<section>` default
padding (`clamp(40px…80px)`). Every `<section>` in the landing kit must
therefore declare its own padding explicitly on **all** sides (use `p-0`,
`pt-0`, or `px-0` for sides you don't want). Otherwise invisible padding
leaks in and creates dead space — this was the cause of a real bug.

## Rules that keep the main website safe

- Never edit `src/app/globals.css` for landing work — style inside the
  landing components only.
- Never import main-site components (`src/components/*.js`) into landing
  code; the kit in `src/components/landing/` is self-contained.
- Landing pages are `noindex` by default (see the variant's `page.js`) so
  Google ignores them while you experiment.
