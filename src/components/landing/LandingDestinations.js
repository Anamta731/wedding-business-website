"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { trackClient } from "@/lib/clientTelemetry";
import { SectionHeading, Reveal } from "./LandingSection";
import { CornerFrame, MiniFlourish, PhotoFrame, SectionDivider } from "./Ornaments";
import DetailOverlay from "./DetailOverlay";
import { scrollToEnquire, WHATSAPP_URL } from "./theme";

// Place cards: infinitely looping snap-carousel on phones, 2×2 spread on
// desktop. Tapping a card opens a detail overlay with the destination's
// story and a few of its venues — no navigation off the landing page.
export default function LandingDestinations({ eyebrow, title, titleAccent, items, midCta }) {
  const railRef = useRef(null);
  const [selected, setSelected] = useState(null);

  // Seamless loop: the cards render three times; we start in the middle copy
  // and teleport the scroll position by exactly one set-width when the user
  // drifts toward either end. The teleport runs only after scrolling settles
  // (debounced) so it never fights an in-flight swipe/snap animation — and
  // since the copies are identical, the jump is invisible.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.children.length < items.length * 2) return;
    const setWidth = rail.children[items.length].offsetLeft - rail.children[0].offsetLeft;
    if (setWidth <= 0) return;
    rail.scrollLeft = setWidth;
    let timer;
    const settle = () => {
      const sl = rail.scrollLeft;
      if (sl < setWidth * 0.6) rail.scrollLeft = sl + setWidth;
      else if (sl >= setWidth * 1.6) rail.scrollLeft = sl - setWidth;
    };
    const onScroll = () => {
      // Hard guard: during continuous fast swiping the settle below never
      // runs, so teleport immediately before the physical ends are reachable.
      const sl = rail.scrollLeft;
      if (sl >= setWidth * 2) rail.scrollLeft = sl - setWidth;
      else if (sl < setWidth * 0.45) rail.scrollLeft = sl + setWidth;
      clearTimeout(timer);
      timer = setTimeout(settle, 120);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      rail.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  const handleMidCta = () => {
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_destinations" });
    scrollToEnquire();
  };

  const handleOverlayEnquire = () => {
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_destination_overlay" });
    setSelected(null);
    // let the scroll-lock release before scrolling to the card
    setTimeout(scrollToEnquire, 60);
  };

  return (
    // pt-0/px-0 required: the main site's global stylesheet pads every bare
    // <section>; px-0 also keeps the mobile swipe rail truly edge-to-edge
    <section className="bg-bg pt-0 px-0 pb-12 md:pb-16">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8">
        <SectionDivider className="mb-6 md:mb-8" />
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} flourish={false} />
      </div>

      {/* Mobile: edge-to-edge looping swipe rail. Desktop: 2×2 grid. */}
      <div ref={railRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-5 pb-3 scrollbar-hide md:hidden">
        {[0, 1, 2].map((copy) =>
          items.map((d) => (
            <PlaceCard
              key={`${copy}-${d.name}`}
              d={d}
              onOpen={() => setSelected(d)}
              className="snap-center shrink-0 w-[78vw] max-w-[340px] aspect-[3/4]"
            />
          ))
        )}
      </div>
      <div className="hidden md:grid max-w-[1160px] mx-auto px-8 grid-cols-2 gap-6">
        {items.map((d, i) => (
          <Reveal key={d.name} delay={(i % 2) * 0.1}>
            <PlaceCard d={d} onOpen={() => setSelected(d)} className="w-full aspect-[16/10]" />
          </Reveal>
        ))}
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
                onClick={handleOverlayEnquire}
                className="flex-1 py-3.5 bg-gold text-ink text-[10.5px] tracking-[0.24em] uppercase font-semibold border border-gold rounded-[2px] shadow-[0_4px_16px_rgba(201,162,52,0.3)]"
              >
                Plan my wedding here
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message us on WhatsApp"
                onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_destination_overlay" })}
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
              <p className="text-[10px] tracking-[0.42em] uppercase text-gold font-semibold mb-2">Extraordinary locations</p>
              <h2 className="font-heading text-ink text-[30px] md:text-[38px] font-light leading-[1.08]">{selected.name}</h2>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted font-medium mt-2">{selected.places}</p>
              <MiniFlourish className="w-[52px] mt-3" />
              <p className="text-muted text-[13.5px] md:text-[14px] font-light leading-relaxed mt-4">
                {selected.description}
              </p>

              <p className="text-[9.5px] tracking-[0.3em] uppercase text-ink/45 font-semibold mt-6 mb-3">A few of our venues</p>
              <ul className="flex flex-col gap-3">
                {selected.venues.map((v) => (
                  <li key={v.name + v.location} className="flex items-center gap-3.5">
                    <span className="relative w-[52px] h-[52px] shrink-0 rounded-[3px] overflow-hidden border border-gold/30">
                      <Image src={v.image} alt={`${v.name}, ${v.location}`} fill className="object-cover" sizes="52px" />
                    </span>
                    <span>
                      <span className="block text-[13.5px] text-ink font-medium leading-tight">{v.name}</span>
                      <span className="block text-[11px] text-muted font-light mt-0.5">{v.location}</span>
                    </span>
                  </li>
                ))}
              </ul>

              {/* Desktop in-flow CTAs — phones use the pinned footer instead */}
              <div className="mt-8 hidden md:flex flex-col gap-3">
                <button
                  onClick={handleOverlayEnquire}
                  className="w-full py-4 bg-gold text-ink text-[11px] tracking-[0.28em] uppercase font-semibold border border-gold rounded-[2px] transition-all duration-300 hover:bg-ink hover:text-gold shadow-[0_8px_24px_rgba(201,162,52,0.28)]"
                >
                  Plan my wedding here
                </button>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_destination_overlay" })}
                  className="w-full py-4 text-center text-gold text-[11px] tracking-[0.28em] uppercase font-semibold border border-gold/50 rounded-[2px] transition-colors duration-300 hover:bg-gold/10"
                >
                  Message us on WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </DetailOverlay>

      <div className="text-center mt-8 md:mt-12 px-5">
        <button
          onClick={handleMidCta}
          className="px-9 py-4 text-[11px] tracking-[0.28em] uppercase font-semibold text-gold border border-gold/60 rounded-[2px] transition-all duration-300 hover:bg-gold hover:text-ink hover:shadow-[0_0_24px_rgba(201,162,52,0.4)]"
        >
          {midCta}
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

function PlaceCard({ d, onOpen, className = "" }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`group relative block text-left overflow-hidden rounded-[3px] cursor-pointer ${className}`}
    >
      <Image
        src={d.image}
        alt={d.name}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        sizes="(max-width: 768px) 78vw, 50vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,20,8,0.85)_0%,rgba(26,20,8,0.2)_50%,transparent_75%)]" />
      <PhotoFrame />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <MiniFlourish className="mb-2 w-[48px] md:w-[58px]" />
        <h3 className="font-heading text-bg text-[24px] md:text-[30px] font-light leading-tight mb-1.5">
          {d.name}
        </h3>
        <p className="text-[10px] tracking-[0.2em] uppercase text-bg/60 font-medium leading-relaxed">
          {d.places}
        </p>
        <span className="inline-block text-gold text-[10px] tracking-[0.24em] uppercase font-semibold mt-2.5 transition-transform duration-300 group-hover:translate-x-1">
          Explore →
        </span>
      </div>
    </button>
  );
}
