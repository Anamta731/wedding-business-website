// Shared constants for the landing kit. Brand colours/fonts come from the
// Tailwind theme tokens (bg-bg, text-ink, text-gold, font-heading, font-body)
// defined in globals.css — same brand, no page-style coupling.

export const WHATSAPP_URL = "https://wa.me/919654277656";
export const PHONE_URL = "tel:+919654277656";
export const EMAIL = "info@vowsandvedas.com";
export const INSTAGRAM_URL = "https://www.instagram.com/vowsandvedas/";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590644336785";

// Every CTA on a landing page scrolls to this element (the enquiry card)
export const ENQUIRE_ID = "enquire";

// The closing CTA card — the sticky mobile bar hides while this is on screen
export const FINAL_CTA_ID = "lp-final-cta";

// The landing footer — the sticky CTAs stay visible once it's reached, so the
// visitor always has a way to enquire at the very bottom of the page.
export const FOOTER_ID = "lp-footer";

export function scrollToEnquire() {
  document.getElementById(ENQUIRE_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Continuously drift a horizontal rail at a slow, constant speed — a gentle
// marquee rather than a stepped carousel. `speed` is px/second. Content is
// expected to be duplicated (identical copies) so the wrap is seamless: when
// scrollLeft passes `wrapAt` it steps back by `wrapBy` (one copy's width),
// which is invisible. Snap is switched off while it runs (restored on stop),
// since scroll-snap fights a free-running scroll. `isPaused()` lets the caller
// halt the drift (e.g. while the visitor is swiping) without tearing it down.
// Returns a stop fn. rAF-driven so a "very slow" sub-pixel speed still advances.
export function startMarquee(el, { speed = 18, wrapAt = Infinity, wrapBy = 0, isPaused = () => false } = {}) {
  const prevSnap = el.style.scrollSnapType;
  el.style.scrollSnapType = "none";
  let raf = 0;
  let last = 0;
  let pos = el.scrollLeft;
  const frame = (ts) => {
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; // clamp tab-switch gaps
    last = ts;
    if (isPaused()) {
      pos = el.scrollLeft; // stay in sync with manual scrolling
    } else if (el.clientWidth > 0) {
      pos += speed * dt;
      if (pos >= wrapAt) pos -= wrapBy;
      el.scrollLeft = pos;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    el.style.scrollSnapType = prevSnap;
  };
}
