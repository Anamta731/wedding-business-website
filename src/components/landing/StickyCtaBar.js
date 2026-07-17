"use client";

import { useEffect, useState } from "react";
import { trackClient } from "@/lib/clientTelemetry";
import { scrollToEnquire, WHATSAPP_URL, PHONE_URL, ENQUIRE_ID, FINAL_CTA_ID } from "./theme";

// Phones only: an ink action bar fixed to the bottom — Enquire, a raised
// gold Call disc centre-stage, and WhatsApp. Appears after the visitor
// scrolls past the hero; hides while the enquiry card OR the final CTA
// card is on screen (never stack duplicate CTAs).
export default function StickyCtaBar() {
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
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_bottom_bar" });
    scrollToEnquire();
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-[90] transition-transform duration-400 ${
        visible ? "translate-y-0" : "translate-y-[135%]"
      }`}
    >
      <div className="bg-ink border-t border-gold/25 px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(26,20,8,0.35)]">
        <div className="grid grid-cols-3 items-end max-w-[420px] mx-auto">
          {/* Enquire */}
          <button
            onClick={handleEnquire}
            className="flex flex-col items-center gap-1 py-1 text-gold"
          >
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-bg/75">Enquire</span>
          </button>

          {/* Call — raised gold disc */}
          <a
            href={PHONE_URL}
            onClick={() => trackClient("CtaClick", { channel: "call", location: "lp_bottom_bar" })}
            className="flex flex-col items-center gap-1"
            aria-label="Call us"
          >
            <span className="-mt-8 w-14 h-14 rounded-full bg-gold border-[3px] border-ink flex items-center justify-center shadow-[0_6px_24px_rgba(201,162,52,0.5)]">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1A1408" aria-hidden="true">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1C10.4 21 3 13.6 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.2 2.45.57 3.57a1 1 0 01-.24 1.02l-2.21 2.2z" />
              </svg>
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-bg/75">Call us</span>
          </a>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_bottom_bar" })}
            className="flex flex-col items-center gap-1 py-1"
          >
            <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="#25D366" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
            </svg>
            <span className="text-[9px] tracking-[0.18em] uppercase font-semibold text-bg/75">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
