"use client";

import Image from "next/image";
import { SectionHeading, Reveal } from "./LandingSection";
import { Flourish, MiniFlourish } from "./Ornaments";

// Ink interlude: one featured couple, two supporting voices. Real quotes only.
export default function LandingTestimonials({ eyebrow, title, titleAccent, featured, quotes }) {
  return (
    <section className="bg-ink py-10 md:py-14 px-5 sm:px-8 relative overflow-hidden">
      {/* Oversized quote mark filling the upper ink band */}
      <span
        aria-hidden="true"
        className="absolute -top-10 left-1/2 -translate-x-1/2 font-heading italic text-gold/[0.14] text-[260px] md:text-[380px] leading-none select-none pointer-events-none"
      >
        &ldquo;
      </span>

      <div className="max-w-[900px] mx-auto relative">
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} dark />

        {/* Featured couple */}
        <Reveal className="text-center mb-12 md:mb-16">
          <blockquote className="font-heading italic text-bg/90 text-[20px] sm:text-[24px] md:text-[28px] font-light leading-[1.5] max-w-[720px] mx-auto mb-4">
            &ldquo;{featured.quote}&rdquo;
          </blockquote>
          <Flourish className="mx-auto mb-4 w-[140px] md:w-[170px]" dark />
          <div className="flex items-center justify-center gap-4">
            <span className="relative w-12 h-12 rounded-full overflow-hidden border border-gold/50">
              <Image src={featured.image} alt={featured.author} fill className="object-cover" sizes="48px" />
            </span>
            <span className="text-left">
              <span className="block text-bg text-[13px] tracking-[0.14em] uppercase font-medium">
                {featured.author}
              </span>
              <span className="block text-bg/65 text-[11px] font-light mt-0.5">{featured.location}</span>
            </span>
          </div>
        </Reveal>

        {/* Supporting voices */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          {quotes.map((q, i) => (
            <Reveal key={q.author} delay={i * 0.1}>
              <figure className="border border-gold/20 rounded-[3px] p-6 md:p-8 h-full bg-bg/[0.03] flex flex-col">
                <MiniFlourish className="mb-4 w-[50px]" />
                <blockquote className="font-heading italic text-bg/75 text-[15px] md:text-[16px] font-light leading-[1.7] mb-5">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto">
                  <span className="block text-bg/90 text-[11px] tracking-[0.16em] uppercase font-medium">
                    {q.author}
                  </span>
                  <span className="block text-bg/65 text-[11px] font-light mt-0.5">{q.location}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
