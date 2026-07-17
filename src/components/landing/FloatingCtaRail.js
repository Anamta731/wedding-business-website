"use client";

import { useEffect, useState } from "react";
import { trackClient } from "@/lib/clientTelemetry";
import { scrollToEnquire, WHATSAPP_URL, PHONE_URL, ENQUIRE_ID, FINAL_CTA_ID } from "./theme";

// Desktop-only floating CTA rail on the right edge — same ink-and-gold rail
// as the main site. Pass enquireHref to send Enquiry to the full enquiry
// page; without it, it scrolls to the landing form. Mirrors the mobile
// bottom bar's behaviour: slides in after the hero (whose form is already
// on screen) and slides away while the enquiry card or final CTA is visible.
export default function FloatingCtaRail({ enquireHref }) {
  const [open, setOpen] = useState(true);
  const [pastHero, setPastHero] = useState(false);
  const [ctaInView, setCtaInView] = useState({});

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = [ENQUIRE_ID, FINAL_CTA_ID]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setCtaInView((prev) => {
          const next = { ...prev };
          for (const entry of entries) next[entry.target.id] = entry.isIntersecting;
          return next;
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const visible = pastHero && !Object.values(ctaInView).some(Boolean);

  const handleEnquire = () => {
    if (enquireHref) {
      trackClient("CtaClick", { channel: "enquire_page", location: "lp_floating_rail" });
      window.location.href = enquireHref;
      return;
    }
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_floating_rail" });
    scrollToEnquire();
  };

  return (
    <div
      className={`hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-[95] transition-all duration-500 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      {open ? (
        <div className="bg-ink border border-gold/25 border-r-0 rounded-l-2xl flex flex-col items-center shadow-[-8px_0_40px_rgba(0,0,0,0.45)]">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close contact panel"
            className="w-full flex items-center justify-center pt-3 pb-2 text-muted hover:text-gold transition-colors duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gold/20" />

          {/* Call Us */}
          <a
            href={PHONE_URL}
            aria-label="Call us"
            onClick={() => trackClient("CtaClick", { channel: "call", location: "lp_floating_rail" })}
            className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.93a16 16 0 0 0 6.29 6.29l.93-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-gold text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">Call Us</span>
          </a>

          <div className="w-8 h-px bg-gold/20" />

          {/* Enquiry — scrolls to the landing form, never leaves the page */}
          <button
            onClick={handleEnquire}
            aria-label="Open enquiry form"
            className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
            <span className="text-gold text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">Enquiry</span>
          </button>

          <div className="w-8 h-px bg-gold/20" />

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_floating_rail" })}
            className="group flex flex-col items-center gap-1.5 px-4 py-3.5 hover:bg-[#251C0D] transition-colors duration-200 w-full"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-200" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
            </svg>
            <span className="text-gold text-[8px] tracking-[0.2em] uppercase font-medium leading-none whitespace-nowrap">WhatsApp</span>
          </a>

          <div className="pb-2" />
        </div>
      ) : (
        /* Re-open tab */
        <button
          onClick={() => setOpen(true)}
          aria-label="Open contact options"
          className="w-6 h-16 bg-ink border border-gold/30 border-r-0 rounded-l-lg flex items-center justify-center text-gold hover:bg-[#251C0D] transition-colors duration-200 shadow-[-4px_0_20px_rgba(0,0,0,0.4)]"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
