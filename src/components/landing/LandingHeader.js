"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { trackClient } from "@/lib/clientTelemetry";
import { scrollToEnquire } from "./theme";

// Slim landing header: logo + one action. No menu, no login — a landing
// visitor has exactly one thing to do. Pass enquireHref to navigate to the
// full enquiry page; without it the button scrolls to the on-page card.
export default function LandingHeader({ enquireHref }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEnquire = () => {
    if (enquireHref) {
      trackClient("CtaClick", { channel: "enquire_page", location: "lp_header" });
      router.push(enquireHref);
      return;
    }
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_header" });
    scrollToEnquire();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 h-[64px] sm:h-[72px] px-4 sm:px-8 transition-all duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur-md shadow-sm border-b border-ink/8" : "bg-transparent"
      }`}
    >
      <div className="relative h-[32px] w-[148px] sm:h-[38px] sm:w-[178px] md:h-[44px] md:w-[206px] shrink min-w-0">
        {/* White logo over the dark hero, gold once scrolled onto ivory */}
        <Image
          src="/assets/photos/for -4A.png"
          alt="Vows & Vedas"
          fill
          priority
          className={`object-contain object-left transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-100"}`}
        />
        <Image
          src="/assets/photos/for -4.png"
          alt=""
          fill
          priority
          className={`object-contain object-left transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <button
        onClick={handleEnquire}
        className={`shrink-0 whitespace-nowrap px-4 py-2.5 sm:px-7 sm:py-3 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.26em] uppercase font-semibold rounded-full border transition-colors duration-300 ${
          scrolled
            ? "bg-gold text-ink border-gold hover:bg-ink hover:text-gold"
            : "bg-transparent text-bg border-bg/50 hover:bg-gold hover:text-ink hover:border-gold"
        }`}
      >
        Get Free Consultation
      </button>
    </header>
  );
}
