"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackClient } from "@/lib/clientTelemetry";
import { SectionHeading } from "./LandingSection";
import { Blossom, SectionDivider } from "./Ornaments";
import { scrollToEnquire } from "./theme";

// Compact objection-handler near the foot of the page. The whole block sits
// collapsed behind one toggle so it adds almost no scroll; opening it reveals
// the list of questions, and each question then expands in place to show its
// answer (grid 0fr→1fr gives a smooth height transition without measuring, and
// grows with the inner expansions). One accordion item is open at a time. Ends
// with a soft "still have a question?" prompt that drops the visitor into the
// enquiry.
export default function LandingFaq({ eyebrow, title, titleAccent, items = [], cta, enquireHref }) {
  const router = useRouter();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex((cur) => (cur === i ? null : i));

  const toggleSection = () => {
    setSectionOpen((v) => !v);
    setOpenIndex(null); // start fresh each time the section is opened/closed
  };

  const handleCta = () => {
    // Go straight to the full enquiry page rather than scrolling all the way
    // back to the hero form.
    if (enquireHref) {
      trackClient("CtaClick", { channel: "enquire_page", location: "lp_faq" });
      router.push(enquireHref);
      return;
    }
    trackClient("CtaClick", { channel: "enquire_scroll", location: "lp_faq" });
    scrollToEnquire();
  };

  return (
    // pt-0 required: the main site's global stylesheet pads every bare <section>
    <section className="bg-bg pt-0 pb-12 md:pb-16 px-5 sm:px-8">
      <div className="max-w-[820px] mx-auto">
        <SectionDivider className="mb-6 md:mb-8" />
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} flourish={false} />

        {/* Section-level toggle — the questions only appear once opened */}
        <div className="flex justify-center -mt-2">
          <button
            type="button"
            onClick={toggleSection}
            aria-expanded={sectionOpen}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span className="text-[11px] uppercase text-gold font-semibold tracking-[0.32em] group-hover:tracking-[0.42em] transition-all duration-500">
              {sectionOpen ? "Hide Questions" : "View Questions"}
            </span>
            <span
              className="flex items-center justify-center w-9 h-9 rounded-full border border-gold/40 text-gold text-sm group-hover:border-gold group-hover:bg-gold/10"
              style={{ transform: sectionOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s ease, border-color 0.3s, background 0.3s" }}
              aria-hidden="true"
            >
              ↓
            </span>
          </button>
        </div>

        {/* Reveal: 0fr → 1fr animates open and still grows as inner items expand */}
        <div className="grid transition-all duration-500 ease-out" style={{ gridTemplateRows: sectionOpen ? "1fr" : "0fr" }}>
          <div className="overflow-hidden">
            <div className="mt-8">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="border-b border-ink/10">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="group w-full flex items-center justify-between gap-5 py-5 text-left"
                >
                  <span
                    className={`font-heading font-light text-[18px] md:text-[21px] leading-snug transition-colors duration-300 ${
                      isOpen ? "text-gold" : "text-ink group-hover:text-gold"
                    }`}
                  >
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-lg font-light transition-all duration-300 ${
                      isOpen ? "rotate-45 bg-gold text-ink border-gold" : "text-muted border-ink/20 group-hover:border-gold"
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {/* 0fr → 1fr animates the row height smoothly, no JS measuring */}
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="relative pl-5 pr-2 pb-6">
                      <span className="absolute left-0 top-0 bottom-6 w-[2px] bg-gold/60" aria-hidden="true" />
                      <p className="text-muted text-[13.5px] md:text-[14px] font-light leading-relaxed">{item.a}</p>

                      {item.bullets && (
                        <ul className="mt-3 flex flex-col gap-2">
                          {item.bullets.map((b) => (
                            <li key={b} className="flex items-center gap-3 text-muted text-[13px] font-light">
                              <Blossom size={8} />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {item.note && (
                        <p className="text-muted text-[13.5px] md:text-[14px] font-light leading-relaxed mt-3">{item.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
              {/* Still have a question? */}
              {cta && (
                <div className="text-center mt-9">
                  <p className="text-[10px] tracking-[0.34em] uppercase text-gold font-semibold mb-4">{cta.eyebrow}</p>
                  <button
                    type="button"
                    onClick={handleCta}
                    className="px-9 py-4 text-[11px] tracking-[0.28em] uppercase font-semibold bg-gold text-ink border border-gold rounded-full transition-all duration-300 hover:bg-ink hover:text-gold shadow-[0_8px_24px_rgba(201,162,52,0.35)] hover:shadow-[0_10px_30px_rgba(26,20,8,0.2)]"
                  >
                    {cta.button}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
