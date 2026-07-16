"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { trackClient } from "@/lib/clientTelemetry";
import { SectionHeading, Reveal } from "./LandingSection";
import { MiniFlourish, PhotoFrame, SectionDivider } from "./Ornaments";
import { scrollToEnquire } from "./theme";

// Place cards: infinitely looping snap-carousel on phones, 2×2 spread on desktop.
export default function LandingDestinations({ eyebrow, title, titleAccent, items, midCta }) {
  const railRef = useRef(null);

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
              className="snap-center shrink-0 w-[78vw] max-w-[340px] aspect-[3/4]"
            />
          ))
        )}
      </div>
      <div className="hidden md:grid max-w-[1160px] mx-auto px-8 grid-cols-2 gap-6">
        {items.map((d, i) => (
          <Reveal key={d.name} delay={(i % 2) * 0.1}>
            <PlaceCard d={d} className="aspect-[16/10]" />
          </Reveal>
        ))}
      </div>

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

function PlaceCard({ d, className = "" }) {
  return (
    <div className={`group relative overflow-hidden rounded-[3px] ${className}`}>
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
      </div>
    </div>
  );
}
