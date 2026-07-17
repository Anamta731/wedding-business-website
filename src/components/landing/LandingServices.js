"use client";

import { useState } from "react";
import Image from "next/image";
import { trackClient } from "@/lib/clientTelemetry";
import { SectionHeading, Reveal } from "./LandingSection";
import { Blossom, CornerFrame, MiniFlourish, PhotoFrame } from "./Ornaments";
import DetailOverlay from "./DetailOverlay";
import { scrollToEnquire, WHATSAPP_URL } from "./theme";

// Proof, not navigation: the six pillars as image cards. Tapping a card opens
// a detail overlay (photo, description, what's included) whose only exits are
// the enquiry form or WhatsApp — a landing visitor never leaves the page.
export default function LandingServices({ eyebrow, title, titleAccent, items }) {
  const [selected, setSelected] = useState(null);

  const handleEnquire = () => {
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_service_overlay" });
    setSelected(null);
    // let the scroll-lock release before scrolling to the card
    setTimeout(scrollToEnquire, 60);
  };

  return (
    <section
      className="py-12 md:py-16 px-5 sm:px-8"
      style={{
        background:
          "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(201,162,52,0.06) 0%, transparent 70%), #FDFAF5",
      }}
    >
      <div className="max-w-[1160px] mx-auto">
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} />
        {/* Mobile: stacked full-width cards (services deserve big imagery).
            Desktop: 3-column grid. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, i) => (
            <Reveal key={item.name} delay={(i % 3) * 0.08}>
              <button
                type="button"
                onClick={() => setSelected(item)}
                className="group relative block w-full text-left aspect-[16/10] md:aspect-[4/4.4] overflow-hidden rounded-[3px] cursor-pointer"
                aria-haspopup="dialog"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,20,8,0.82)_0%,rgba(26,20,8,0.25)_45%,transparent_70%)]" />
                <PhotoFrame />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <MiniFlourish className="mb-2 w-[50px] md:w-[56px]" />
                  <h3 className="font-heading text-bg text-[24px] md:text-[24px] font-light leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-bg/70 md:text-bg/65 text-[12.5px] md:text-[12px] font-light leading-snug mt-1">
                    {item.tagline}
                  </p>
                  <span className="inline-block text-gold text-[10px] tracking-[0.24em] uppercase font-semibold mt-2.5 transition-transform duration-300 group-hover:translate-x-1">
                    Explore service →
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <DetailOverlay
        item={selected}
        onClose={() => setSelected(null)}
        image={selected?.image}
        imageAlt={selected?.name}
        ariaLabel={selected?.name}
        footer={
          selected && (
            <div className="flex items-stretch gap-2.5">
              <button
                onClick={handleEnquire}
                className="flex-1 py-3.5 bg-gold text-ink text-[10.5px] tracking-[0.24em] uppercase font-semibold border border-gold rounded-[2px] shadow-[0_4px_16px_rgba(201,162,52,0.3)]"
              >
                Enquire about this service
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message us on WhatsApp"
                onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_service_overlay" })}
                className="w-12 shrink-0 flex items-center justify-center border border-ink/15 rounded-[2px] bg-surface"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
                </svg>
              </a>
            </div>
          )
        }
      >
        {selected && (
          <>
            <CornerFrame size={24} inset={8} opacity={0.4} className="hidden md:block" />
            <div className="px-6 py-7 md:px-9 md:py-10">
              <p className="text-[10px] tracking-[0.42em] uppercase text-gold font-semibold mb-2">Our services</p>
              <h2 className="font-heading text-ink text-[30px] md:text-[38px] font-light leading-[1.08]">{selected.name}</h2>
              <MiniFlourish className="w-[52px] mt-3" />
              <p className="text-muted text-[13.5px] md:text-[14px] font-light leading-relaxed mt-4">
                {selected.description}
              </p>

              <p className="text-[9.5px] tracking-[0.3em] uppercase text-ink/45 font-semibold mt-6 mb-3">What&rsquo;s included</p>
              <ul className="flex flex-col gap-2.5">
                {selected.includes.map((inc) => (
                  <li key={inc} className="flex items-center gap-3">
                    <Blossom size={8} />
                    <span className="text-[13px] text-ink font-light leading-tight">{inc}</span>
                  </li>
                ))}
              </ul>

              {/* Desktop in-flow CTAs — phones use the pinned footer instead */}
              <div className="mt-8 hidden md:flex flex-col gap-3">
                <button
                  onClick={handleEnquire}
                  className="w-full py-4 bg-gold text-ink text-[11px] tracking-[0.28em] uppercase font-semibold border border-gold rounded-[2px] transition-all duration-300 hover:bg-ink hover:text-gold shadow-[0_8px_24px_rgba(201,162,52,0.28)]"
                >
                  Enquire about this service
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_service_overlay" })}
                  className="w-full py-4 text-center text-gold text-[11px] tracking-[0.28em] uppercase font-semibold border border-gold/50 rounded-[2px] transition-colors duration-300 hover:bg-gold/10"
                >
                  Message us on WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </DetailOverlay>
    </section>
  );
}
