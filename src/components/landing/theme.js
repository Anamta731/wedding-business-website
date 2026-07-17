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

export function scrollToEnquire() {
  document.getElementById(ENQUIRE_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
