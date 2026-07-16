"use client";

import Image from "next/image";
import { SectionHeading, Reveal } from "./LandingSection";
import { MiniFlourish, PhotoFrame } from "./Ornaments";

// Proof, not navigation: the six pillars as image cards. Deliberately not
// links — a landing visitor's only destination is the enquiry card.
export default function LandingServices({ eyebrow, title, titleAccent, items }) {
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
              <div className="group relative aspect-[16/10] md:aspect-[4/4.4] overflow-hidden rounded-[3px]">
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
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
