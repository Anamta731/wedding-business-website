# Follow-up: two small fixes — GTM consent + one policy sentence

**From:** Nik · **Context:** We audited our Google Tag Manager container (GTM-PX8XXL2T) after the privacy policy went live. All the Google tags are fine. Two things came up around the Crazy Egg and VWO tags you added — nothing's broken, but both need a small fix. Should take ~15 minutes total.

---

## Fix 1 — GTM: make Crazy Egg and VWO respect the cookie banner (dashboard, not Claude Code)

Google's own tags automatically obey the cookie consent banner we shipped. **Custom HTML tags don't** — so right now Crazy Egg and VWO run even for visitors who clicked "Essential only." Here's the fix:

1. Go to tagmanager.google.com → **Vows and Vedas → vowsandvedas.com (GTM-PX8XXL2T)** → Tags.
2. Open **"Vows & Vedas CrazyEgg"** → click into Tag Configuration → expand **Advanced Settings → Consent Settings**.
3. Select **"Require additional consent for tag to fire"** and add **`analytics_storage`**. Save.
4. Repeat exactly the same for **"Vows & Vedas VWO Tag"**.
5. Click **Submit** (top right) → publish the container with a note like "Consent gating for CrazyEgg + VWO".
6. Quick check: open vowsandvedas.com in an incognito window, choose **"Essential only"** on the banner, then open DevTools → Network and confirm nothing loads from `crazyegg.com` or `visualwebsiteoptimizer.com`. Then repeat with **"Accept all"** — both should load.

Note: this means your VWO experiments will only collect data from visitors who accept cookies. That's expected and correct.

## Fix 2 — Privacy policy: name the two tools (Claude Code)

Paste this into Claude Code in the wedding-business-website folder:

> In `src/app/privacy-policy/page.js`, make one addition to Section 10 (Cookies) and nothing else. After the sentence about advertising cookies and before the browser-settings sentence, insert exactly this sentence:
>
> "We also use website-analytics tools Crazy Egg (heatmaps) and VWO (page testing), which use cookies to understand how visitors interact with our pages; they do not collect your name or contact details, and they only run if you accept cookies on our consent banner."
>
> (Note: Fix 1 in this document is already DONE — Nik published the GTM consent gating on 2026-07-22. Only this policy sentence remains.)
>
> Also update the "Last updated" date to today. Do not change any other wording anywhere in the policy. Commit on a feature branch, open a PR to main — do not merge or deploy. Run the build to confirm it compiles.

Send Nik the PR link when done.

---

**Order doesn't matter, but do both this week.** Questions → Nik.
