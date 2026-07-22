# Frontend Developer Handover

**Who this is for:** a frontend developer taking over day-to-day design changes on this
project. It assumes you know HTML, CSS and JavaScript well, but that you're **new to this
project's stack** (Next.js 16 / React 19 / Tailwind 4) and **new to GitHub**. Everything
you need to work safely is here. Read it once top to bottom, then keep it open as a reference.

> **The one thing to remember:** this repo contains **two separate sites** — the **main
> website** and the **campaign landing pages**. They are deliberately walled off from each
> other. If you respect the walls (Section 5), a mistake on one can never break the other.

---

## 0. The 2-minute overview

- It's a **Next.js** website for a luxury wedding business (Vows & Vedas).
- The code lives in the [`src/`](src/) folder. Almost everything you'll touch is there.
- There are **two sites in one codebase**:
  - **Main website** — the homepage and all the normal pages (`/`, `/about`, `/contact`…).
  - **Landing pages** — standalone ad-campaign pages under `/lp/…`, built to be disposable
    and experimental. They do **not** share code with the main site.
- You edit files on your computer, preview in a browser at `http://localhost:3000`, then use
  **GitHub** to submit your change. A preview link is generated automatically; the live site
  only changes after your work is approved and merged.
- **You never edit the live site directly.** There is always a safety net (Section 10).

---

## 1. The tech stack — and what's different from "plain" frontend

You're used to writing `.html`, `.css`, `.js` files. This project is a bit different. Here's
the translation:

| You know… | Here it's… | What that means for you |
|---|---|---|
| HTML pages | **React components** (`.js` files that return HTML-like markup called JSX) | You write HTML inside JavaScript. `class=` becomes `className=`. |
| Separate `.css` files | **Tailwind CSS** (utility classes in the markup) + a few CSS variables | Instead of writing CSS rules, you add classes like `px-6 text-lg font-semibold`. |
| Manually linking pages | **File-based routing (Next.js App Router)** | A folder under [`src/app/`](src/app/) *is* a URL. `src/app/about/page.js` → `/about`. |
| Loading images with `<img>` | **Next.js `<Image>`** component | Optimises images automatically. Copy the pattern from an existing file. |

> ⚠️ **Important:** this is **Next.js 16**, which is newer than most tutorials online. Some
> older Stack Overflow / blog answers will be wrong for this version. When in doubt, copy the
> pattern from a file that already works in *this* repo rather than pasting from the internet.
> The project even has a note about this in [AGENTS.md](AGENTS.md).

**You do not need to become a Next.js expert.** For 90% of design work you will:
1. Find the right `.js` file,
2. change text / classes / image paths,
3. preview,
4. ship.

You almost never need to understand the backend (the `api` folder, Azure, the chatbot).

---

## 2. Big picture: the two sites, and why they're separate

```
src/app/
├── page.js            ← MAIN WEBSITE homepage  (URL: / )
├── about/page.js      ← MAIN WEBSITE           (URL: /about )
├── contact/page.js    ← MAIN WEBSITE           (URL: /contact )
├── ...more pages...
├── globals.css        ← MAIN WEBSITE global styles  (⚠️ shared — see rules)
│
└── lp/                ← LANDING PAGES live entirely inside here
    ├── error.js       ← safety net: a crash here shows a fallback on THIS page only
    ├── README.md      ← the landing-page maintainer guide (read it)
    └── destination-weddings/
        ├── page.js     ← the page layout (rarely edited)
        └── content.js  ← ⭐ ALL the text & image paths for this page

src/components/
├── Navigation.js, Footer.js, Chatbot.js, ...   ← MAIN WEBSITE building blocks
└── landing/                                     ← LANDING PAGE building blocks (self-contained)
    ├── LandingHero.js, EnquiryForm.js, ...
    └── theme.js
```

**Why two sites?** The landing pages are for paid ad campaigns. The business spins up several,
sees which one gets the most enquiries, and deletes the losers. They need to be:
- **disposable** (create/delete without touching the main site),
- **isolated** (a broken experiment must never take down the real website),
- **fast on mobile** (most ad clicks come from phones).

**How the isolation actually works** (you don't have to maintain this, just respect it):
- Next.js only loads the files for the URL being visited, so the pages don't "see" each other.
- Landing components in [`src/components/landing/`](src/components/landing/) import **nothing**
  from the main-site components, and vice-versa.
- All landing styling uses Tailwind classes *inside* landing components — so there's no shared
  stylesheet to accidentally break.
- If landing code crashes, [`src/app/lp/error.js`](src/app/lp/error.js) catches it and shows a
  fallback **on that page only**. The rest of the site keeps working.

There's a fuller technical explanation in [`docs/landing-pages/PLAN.md`](docs/landing-pages/PLAN.md)
if you're curious, but you don't need it for day-to-day work.

---

## 3. Your safe zones — what to edit for each kind of change

| I want to change… | Edit this | Notes |
|---|---|---|
| Text/photos on a **landing page** | that variant's **`content.js`** (e.g. [`src/app/lp/destination-weddings/content.js`](src/app/lp/destination-weddings/content.js)) | Almost all landing edits happen here. Don't touch the components. |
| The **look** of a landing section | the matching file in [`src/components/landing/`](src/components/landing/) | e.g. hero styling → `LandingHero.js`. |
| Add a **new** landing page (variant) | copy an existing folder under `src/app/lp/`, rename it, edit its `content.js` | The folder name becomes the URL. |
| **Main website** homepage | [`src/app/page.js`](src/app/page.js) | |
| Another main website page | that page's folder under `src/app/` (e.g. `src/app/about/page.js`) | |
| A **shared** main-site piece (menu, footer) | [`src/components/Navigation.js`](src/components/Navigation.js), [`src/components/Footer.js`](src/components/Footer.js), etc. | Affects the whole main site — preview carefully. |
| Main-site colours/fonts/global CSS | [`src/app/globals.css`](src/app/globals.css) | ⚠️ Main site only. **Never for landing work.** |

**Landing images** all live in **`public/assets/photos/landing/`**. Keep them there — never
point a landing page at a main-site image folder (a future main-site change could delete it
and silently break your ad page). Full details in [`src/app/lp/README.md`](src/app/lp/README.md).

---

## 4. The golden rules (this is the section that keeps you safe)

Follow these five and you cannot make one site break the other:

1. **Never edit `globals.css` for landing-page work.** It belongs to the main site. Landing
   styling goes in the landing components (Tailwind classes only).
2. **Never import a main-site component into landing code, or vice-versa.** The two
   `components` areas are separate on purpose. If you need something on a landing page, build
   or copy it inside `src/components/landing/`.
3. **Keep all landing images in `public/assets/photos/landing/`.** Don't reference main-site
   image paths from a landing page.
4. **Never work directly on the `main` branch, and never edit the live site.** Always make a
   branch, preview it, and let it be reviewed (Sections 6–7).
5. **When adding a new `<section>` to a landing page, set its padding explicitly** (e.g. add
   `p-0`/`pt-0`/`px-0` where you don't want padding). The main site's global stylesheet adds
   default padding to bare `<section>` tags, which can leak invisible dead space into landing
   pages. This has caused a real bug — see the "Gotcha" note in
   [`src/app/lp/README.md`](src/app/lp/README.md).

If you ever feel a change "reaches across" the wall between the two sites, stop and ask.

---

## 5. Getting it running on your computer (one-time setup)

You need this to preview changes before shipping them.

1. **Install Node.js version 20.** This project requires Node 20 (see [`.nvmrc`](.nvmrc)).
   The easiest way is [nvm](https://github.com/nvm-sh/nvm); then run `nvm use` in the project
   folder. (Node 21+ will not work — the version is pinned on purpose.)
2. **Install the project's packages** — from the project folder in a terminal:
   ```bash
   npm install
   ```
3. **Get the secret settings file.** The app expects a file called `.env.local` (API keys for
   email, chatbot, etc.). It is **not** in GitHub for security. Ask the project owner to send
   you theirs, or copy [`.env.example`](.env.example) to `.env.local` and fill in the values.
   *Note: without real keys the chatbot/enquiry email won't fully work locally — that's fine
   for design work; the pages still render.*
4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Then open **http://localhost:3000** in your browser. The main site is at `/`; the landing
   page is at `/lp/destination-weddings`.
5. As you save a file, the browser updates automatically. Leave `npm run dev` running while
   you work.

---

## 6. GitHub from zero (you've never used it)

**What GitHub is, in one sentence:** a shared online copy of all the project's code that also
keeps a full history of every change, so nothing is ever lost and changes can be reviewed
before they go live.

**The mental model — think of it like Google Docs "suggesting" mode:**
- The live, agreed-upon version is a branch called **`main`**. You never type directly into it.
- You make a **branch** — your own private copy — and make your changes there.
- You **commit** — save a labelled snapshot of your changes.
- You **push** — upload your branch to GitHub.
- You open a **Pull Request (PR)** — "please review and accept my changes."
- Someone reviews it, a **preview link** is generated automatically, and once approved it's
  **merged** into `main` and goes live.

### Recommended way to start: GitHub Desktop (a visual app, no command line)

Because you're new to this, use **[GitHub Desktop](https://desktop.github.com/)** — it does
all of the above with buttons instead of typed commands.

1. Install GitHub Desktop and sign in with a GitHub account (ask the owner to invite your
   account to the repository first: `github.com/nik-mci/wedding-business-website`).
2. **Clone** the repository (File → Clone repository). This downloads the code to your machine.
3. Every time you start a new piece of work:
   - **Current branch → New branch.** Name it for the task, e.g. `landing-hero-new-photo`.
     (Always branch off `main`.)
4. Make your edits in your code editor, preview at `localhost:3000`.
5. Back in GitHub Desktop you'll see your changed files. Write a short **summary** ("Swap hero
   photo on destination-weddings LP") and click **Commit to `<your-branch>`**.
6. Click **Push origin** to upload.
7. Click **Preview Pull Request → Create Pull Request**. This opens GitHub in your browser;
   fill in a short description and submit.
8. Wait for the automatic checks and the **preview link** (Section 10), then ask for review.
9. After it's approved and **merged**, switch your branch back to `main` and **Pull** to get
   the latest. Start your next task from a fresh branch.

### The same thing on the command line (for later, when you're comfortable)

```bash
git checkout main && git pull              # start from the latest live version
git checkout -b landing-hero-new-photo     # make + switch to your branch
# ... make your edits, preview locally ...
git add -A                                 # stage all your changes
git commit -m "Swap hero photo on destination-weddings LP"
git push -u origin landing-hero-new-photo  # upload your branch
# then open the Pull Request from the link Git prints, or on github.com
```

> **Never run `git push` to `main` directly, and don't `--force` anything.** If a command
> mentions "force", stop and ask. The whole point is that `main` is protected.

---

## 7. Making a change — worked examples

### A) Change text or a photo on the landing page (the most common task)

1. Make a branch (Section 6).
2. Open [`src/app/lp/destination-weddings/content.js`](src/app/lp/destination-weddings/content.js).
   Everything editable — headlines, subtitles, service cards, testimonials, image paths, CTA
   labels — is in this one file, with comments explaining each part.
3. To change text: edit the string.
   To change a photo: drop the new image into `public/assets/photos/landing/`, then update the
   path in `content.js` to point at it.
4. If you added images, run `npm run compress-images` (shrinks them so pages load fast on
   phones).
5. Preview at `http://localhost:3000/lp/destination-weddings` — **test it on a phone-sized
   window** (the browser dev-tools device toolbar), because these pages are mobile-first.
6. Commit → push → open a PR (Section 6).

### B) Change something on the main website

1. Make a branch.
2. Find the page's file under [`src/app/`](src/app/) (homepage is
   [`src/app/page.js`](src/app/page.js)). Shared pieces like the menu or footer are in
   [`src/components/`](src/components/).
3. Edit text/classes/images. For colours and fonts used site-wide, the design tokens are in
   [`src/app/globals.css`](src/app/globals.css) and [`BRAND_GUIDELINES.md`](BRAND_GUIDELINES.md).
4. Preview at `http://localhost:3000` and click through a few pages to make sure a shared
   component change didn't affect a page you didn't expect.
5. Commit → push → open a PR.

### C) Create a brand-new landing page variant

1. Make a branch.
2. Copy the folder `src/app/lp/destination-weddings/` to a new name, e.g.
   `src/app/lp/royal-weddings/`. The folder name becomes the URL (`/lp/royal-weddings`).
3. Edit **only** the new folder's `content.js`.
4. Preview at `http://localhost:3000/lp/royal-weddings`.
5. Commit → push → open a PR. To retire a variant later, just delete its folder.

---

## 8. Previewing and shipping safely

This is why you can experiment without fear:

1. You work on a **branch**, never on `main` — so the live site is untouched while you work.
2. Before pushing, run a **production build** locally to catch errors:
   ```bash
   npm run build
   ```
   If it reports an error, fix it before pushing. (A broken build can't go live.)
3. When you open a **Pull Request**, an automated system (Azure Static Web Apps) **builds your
   branch and posts a preview URL right on the PR.** Open that link — ideally **on your actual
   phone** — and check the change: swipe the landing hero, submit a test enquiry, click around.
4. Only after review and **merge** does the live site update. Even then, if a merge somehow
   fails to build, the deploy just fails and **the live site keeps serving the previous good
   version** — visitors never see a broken page.

So the worst case for a mistake is "my preview looks wrong" — never "I broke the live site."

---

## 9. Deployment: how a change reaches the live site

**The single most important fact: there is only ONE deployment pipeline.** The main website
and the landing pages are the *same* Next.js app in the *same* repository, so they build and
deploy **together**. There is no separate deploy for landing pages, and there is no manual
"upload" step — **you never touch a server or Azure directly.** Deployment is fully automatic,
driven by GitHub.

### The setup

- The whole app is hosted on one **Azure Static Web App** called `wedding-website-mci`
  (resource group `mci-wedding-website`).
- A GitHub Action — [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml)
  — runs automatically and does all the building and publishing.
- The build command it runs is essentially `npm run build` (Next.js production build).

### Two triggers, two outcomes

| What you do on GitHub | What happens automatically |
|---|---|
| **Open or update a Pull Request** targeting `main` | The Action builds *your branch* and publishes it to a **temporary preview environment** with its own URL, posted as a comment on the PR. (Deleted automatically when the PR is closed.) |
| **Merge the PR** (i.e. push to `main`) | The Action builds `main` and deploys it to **production — the live site**. |

### The flow (identical for main website and landing pages)

```
Edit files ──▶ make a branch ──▶ push ──▶ open a Pull Request to main
                                                │
                              GitHub Action builds YOUR branch
                                                │
                            ✅ build OK  → PREVIEW URL appears on the PR
                            ❌ build fails → deploy blocked; nothing goes live
                                                │
                                        review + approve
                                                │
                                          merge to main
                                                │
                              GitHub Action builds main → PRODUCTION (live)
                            ❌ if it ever fails → the live site keeps the PREVIOUS good version
```

### Main website vs. landing page — the only differences

The pipeline is the same. All that changes is **which files you edit** and **which preview URL
you open to check your work**:

| | Files you edit | Where to check it on the preview URL |
|---|---|---|
| **Main website** | `src/app/page.js`, other `src/app/<page>/`, `src/components/` | `<preview-url>/`, `/about`, `/contact`, … |
| **Landing page** | `src/app/lp/<variant>/content.js` (+ `src/components/landing/`) | `<preview-url>/lp/destination-weddings` |

### Why deployment itself keeps the two sites safe

Because the build must succeed before anything is published, a broken change **fails the
deploy** instead of going live — and production simply keeps serving the last good version.
So a broken landing-page experiment can never take the main website down, and a mistake on the
main site can never corrupt a landing page. This is the deployment-level half of the isolation
you read about in Section 4.

> **You do not need Azure access to do your job.** Everything happens through GitHub: push a
> branch, open a PR, check the preview, merge. If a deploy ever fails for an infrastructure
> reason (not a code error), that's for the project owner to handle — ping Nikhil.

---

## 10. When something goes wrong

- **The dev server won't start / weird errors after pulling:** run `npm install` again (someone
  may have added a package), then `npm run dev`.
- **A page is blank or shows an error in the browser:** read the error message in the terminal
  where `npm run dev` is running — it usually names the file and line.
- **`npm run build` fails:** the message points at the file. If it's a landing file, your page
  has a code mistake; the main site is unaffected. Fix and rebuild.
- **I think I edited the wrong thing / want to undo:** in GitHub Desktop, right-click a changed
  file → **Discard changes** (before committing). Nothing is lost that's already committed —
  that's the point of Git.
- **I'm not sure whether a change crosses the wall between the two sites:** stop and ask the
  owner before pushing. Re-read Section 4.

---

## 11. Prompts to give Claude (cheat-sheet)

This project is set up so you can do most changes by **asking Claude in plain English** rather
than writing code yourself. A few things to know first:

- **There is no magic "deploy" button.** Production deploys automatically when a change reaches
  the `main` branch (Section 9). So when you ask Claude to "deploy", it does the git steps
  (branch → commit → push → PR → merge) that trigger that automatic deploy. Claude does **not**
  touch Azure directly.
- **Claude will not commit, push, or deploy unless you explicitly ask it to.** Editing files and
  previewing is safe; shipping only happens on your clear instruction.
- **Always give: (1) what to change, (2) where, (3) whether to preview, (4) whether/how to ship.**
  The more specific you are, the better. When unsure of a file path, just describe the thing
  ("the second hero photo") — Claude will find it.

### Making changes

| Goal | Prompt to give Claude |
|---|---|
| Change landing-page text | *"On the destination-weddings landing page, change the hero headline to '…'. Show me the preview."* |
| Add / swap a landing photo | *"I added a new image at `public/assets/photos/landing/<folder>/<file>.jpg`. Use it as the 2nd hero slide on the destination-weddings landing page, compress it, and show me the preview."* |
| Edit a testimonial / service card | *"Update the second testimonial on the destination-weddings landing page to '…'."* |
| Create a new landing variant | *"Create a new landing page variant called `royal-weddings` by copying destination-weddings, and change the headline and hero photos to be about royal palace weddings."* |
| Retire a landing variant | *"Delete the `royal-weddings` landing page variant."* |
| Change something on the main website | *"On the main website About page, change the intro paragraph to '…'. Preview it and check the other pages still look fine."* |

### Previewing & checking

| Goal | Prompt to give Claude |
|---|---|
| See a change locally | *"Start the dev server and give me the URL to preview the destination-weddings landing page."* |
| Make sure nothing broke | *"Run `npm run build` and tell me if there are any errors before we ship."* |

### Shipping (deploying)

| Goal | Prompt to give Claude |
|---|---|
| Ship the safe way (recommended) | *"Commit these changes to a new branch, push it, and open a Pull Request to main."* → then, after you check the PR's preview URL: *"Merge the PR."* (this deploys to production) |
| Ship directly (faster, skips preview) | *"Commit these changes and push straight to main to deploy to production."* |
| Undo something not yet shipped | *"Discard the changes I just made to `content.js`."* |

> **Rule of thumb:** for anything going to the live site, use the **Pull Request** route so you
> get a preview URL to check on your phone first. Only push straight to `main` for tiny,
> low-risk text fixes you're confident about.

### A good end-to-end example

> *"I added a new hero image at `public/assets/photos/landing/couple shots/new-photo.jpg`.
> Replace the 2nd hero slide on the destination-weddings landing page with it, compress the
> image, and show me the preview. Then commit to a new branch and open a PR to main."*

That one message tells Claude the file, where to use it, to compress it, to preview it, and how
to ship it — Claude handles the correct path formatting, the `content.js` edit, and the git
steps.

---

## 12. Glossary (quick reference)

- **Next.js** — the framework this site is built on. Turns folders into URLs and optimises the site.
- **React / component** — a reusable piece of UI written as a `.js` file returning HTML-like markup (JSX).
- **JSX** — HTML written inside JavaScript. `class` → `className`, `for` → `htmlFor`.
- **Tailwind** — styling by adding utility classes (`px-6 text-lg`) instead of writing CSS rules.
- **App Router** — Next.js's system where a folder under `src/app/` with a `page.js` becomes a URL.
- **`content.js`** — the plain-data file holding all text/images for one landing page. Edit this, not the components.
- **Branch** — your private working copy of the code.
- **Commit** — a saved, labelled snapshot of your changes.
- **Push** — uploading your branch to GitHub.
- **Pull Request (PR)** — a request to review and merge your branch into `main`.
- **Merge** — accepting a PR so its changes join `main` (and go live).
- **`main`** — the protected live branch. Never edit it directly.
- **Preview URL** — a temporary live copy of your branch, auto-generated on each PR, for testing.

---

## 13. Key files & docs, at a glance

- [`src/app/lp/README.md`](src/app/lp/README.md) — the landing-page maintainer guide (photos, text, new variants, safety rules). **Read this second, after this file.**
- [`docs/landing-pages/PLAN.md`](docs/landing-pages/PLAN.md) — the deeper "why it's built this way" for landing pages.
- [`BRAND_GUIDELINES.md`](BRAND_GUIDELINES.md) — colours, fonts, and visual rules for both sites.
- [`AGENTS.md`](AGENTS.md) — reminder that this is a *newer* Next.js than most tutorials assume.
- [`src/app/`](src/app/) — main website pages (+ the `lp/` landing pages).
- [`src/components/`](src/components/) — main-site building blocks; `landing/` inside it is the separate landing kit.

---

## 14. Who to ask

For anything unclear, or before any change you're unsure about, contact the project owner
(Nikhil). It is always cheaper to ask first than to undo later — and thanks to branches and
previews, nothing you do on a branch can hurt the live site anyway.
