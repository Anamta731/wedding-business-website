"use client";

import { trackClient } from "@/lib/clientTelemetry";
import { Reveal } from "./LandingSection";
import { Blossom, CornerFrame, SectionDivider } from "./Ornaments";
import { scrollToEnquire, WHATSAPP_URL, FINAL_CTA_ID } from "./theme";

export default function LandingFinalCta({ eyebrow, title, titleAccent, subtitle, button }) {
  const handleCta = () => {
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_final_cta" });
    scrollToEnquire();
  };

  return (
    // pt-0 required: the main site's global stylesheet pads every bare <section>
    <section
      className="pt-0 pb-10 md:pb-14 px-5 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,162,52,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,162,52,0.1) 0%, transparent 70%), #FDFAF5",
      }}
    >
      <div className="max-w-[1160px] mx-auto">
        <SectionDivider className="mb-6 md:mb-8" />
      </div>
      <Reveal>
        <div
          id={FINAL_CTA_ID}
          className="max-w-[760px] mx-auto text-center border border-gold/40 rounded-[3px] px-6 py-10 md:py-16 relative shadow-[0_10px_50px_rgba(201,162,52,0.1)]"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,162,52,0.06) 0%, transparent 70%), #FDFAF5",
          }}
        >
          {/* Inner hairline echoes the RSVP card frame */}
          <div className="absolute inset-[6px] border border-gold/20 rounded-[2px] pointer-events-none" />
          <CornerFrame size={34} inset={14} opacity={0.65} className="md:hidden" />
          <CornerFrame size={48} inset={18} opacity={0.65} className="hidden md:block" />
          <p className="flex items-center justify-center gap-3 text-[10px] tracking-[0.42em] uppercase text-gold font-semibold mb-4">
            <Blossom />
            <span>{eyebrow}</span>
            <Blossom />
          </p>
          <h2 className="font-heading text-ink font-light text-[34px] sm:text-[44px] md:text-[52px] leading-[1.1] mb-4">
            {title} <em className="italic text-gold">{titleAccent}</em>
          </h2>
          <p className="text-muted font-light text-[14px] leading-relaxed max-w-[440px] mx-auto mb-9">
            {subtitle}
          </p>
          <button
            onClick={handleCta}
            className="px-12 py-4 bg-gold text-ink text-[11px] tracking-[0.3em] uppercase font-semibold border border-gold rounded-[2px] transition-all duration-300 hover:bg-ink hover:text-gold shadow-[0_8px_24px_rgba(201,162,52,0.28)] hover:shadow-[0_10px_30px_rgba(26,20,8,0.2)]"
          >
            {button}
          </button>
          <p className="text-[11px] text-muted font-light mt-6">
            or{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_final_cta" })}
              className="text-gold underline underline-offset-4 decoration-gold/40 hover:decoration-gold"
            >
              message us on WhatsApp
            </a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
