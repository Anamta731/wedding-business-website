"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeading } from "./LandingSection";

// Ink interlude: the two featured couples exactly as on the main site —
// full-bleed photo cards with a preview quote that expand into a full-story
// overlay (text left, photo right on desktop), plus the "More Love Stories"
// reveal with the masonry quote grid. Real quotes only.
export default function LandingTestimonials({ eyebrow, title, titleAccent, featured, quotes = [] }) {
  const [active, setActive] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <section className="bg-ink py-10 md:py-14 px-5 sm:px-8 relative overflow-hidden">
      <div className="max-w-[1000px] mx-auto relative">
        <SectionHeading eyebrow={eyebrow} title={title} titleAccent={titleAccent} dark />

        {/* Featured couple cards */}
        <div className="flex flex-col md:flex-row justify-center gap-4">
          {featured.map((t, i) => (
            <div
              key={t.author}
              className="relative w-full md:w-[480px] flex-shrink-0 overflow-hidden rounded-[3px] transition-transform duration-500 hover:scale-[1.02] h-[380px] md:h-[420px]"
            >
              <Image
                src={t.image}
                alt={t.author}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(26,20,8,0.88) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                <div className="text-gold mb-2 text-[13px] tracking-[4px]">★★★★★</div>
                <p className="font-heading italic font-light text-[16px] md:text-[17px] leading-relaxed text-[#F5F0E8] line-clamp-4 mb-3">
                  &ldquo;{t.preview}&rdquo;
                </p>
                <button
                  onClick={() => setActive(i)}
                  className="text-[9px] tracking-[0.22em] uppercase text-gold font-semibold hover:underline underline-offset-4 mb-3 block"
                >
                  Read Full Story →
                </button>
                <p className="text-[11px] uppercase font-bold text-bg tracking-[0.18em] mb-0.5">{t.author}</p>
                <p className="text-[10px] text-gold">{t.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider — expand trigger */}
        {quotes.length > 0 && (
          <div className="flex flex-col items-center mt-10">
            <hr className="border-none mb-5 w-[200px] h-px bg-gold/30" />
            <button
              onClick={() => setShowGrid((v) => !v)}
              className="group flex flex-col items-center gap-3 cursor-pointer"
              aria-expanded={showGrid}
            >
              <span className="text-[11px] uppercase text-gold font-semibold tracking-[0.32em] group-hover:tracking-[0.42em] transition-all duration-500">
                {showGrid ? "Close" : "More Love Stories"}
              </span>
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full border border-gold/40 text-gold text-sm group-hover:border-gold group-hover:bg-gold/10 transition-colors duration-300"
                style={{ transform: showGrid ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.4s ease, border-color 0.3s, background 0.3s" }}
              >
                ↓
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Masonry quote grid, revealed on click */}
      {quotes.length > 0 && (
        <div
          style={{
            maxHeight: showGrid ? "1200px" : "0px",
            opacity: showGrid ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.7s ease, opacity 0.5s ease",
            marginTop: showGrid ? "36px" : "0px",
          }}
        >
          {/* Mobile — horizontal snap scroll */}
          <div className="md:hidden flex gap-4 overflow-x-auto -mx-5 px-5 pb-4" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
            {quotes.map((q) => (
              <QuoteCard key={q.author} q={q} className="flex-shrink-0 w-[78vw] p-6" style={{ scrollSnapAlign: "start" }} />
            ))}
          </div>
          {/* Desktop/tablet — masonry grid */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 max-w-[1000px] mx-auto">
            {quotes.map((q, i) => (
              <QuoteCard
                key={q.author}
                q={q}
                className={`${i === 3 ? "md:col-span-3 lg:col-span-2 lg:col-start-2" : "md:col-span-3 lg:col-span-2"} p-8`}
              />
            ))}
          </div>
        </div>
      )}

      <StoryOverlay t={active !== null ? featured[active] : null} onClose={() => setActive(null)} />
    </section>
  );
}

function QuoteCard({ q, className = "", style }) {
  return (
    <div
      className={`rounded-[4px] border border-gold/25 bg-ink transition-colors duration-300 hover:border-gold/60 ${className}`}
      style={style}
    >
      <div className="font-heading text-[52px] leading-none mb-2 text-gold/30">&ldquo;</div>
      <div className="text-gold mb-3 text-[12px] tracking-[4px]">★★★★★</div>
      <p className="font-heading italic text-[16px] text-[#E8E0D0] leading-[1.7]">{q.quote}</p>
      <hr className="border-none my-4 h-px bg-gold/20" />
      <p className="text-[10px] uppercase font-bold text-bg tracking-[0.18em] mb-0.5">{q.author}</p>
      <p className="text-[10px] text-gold">{q.location}</p>
    </div>
  );
}

// Full-story overlay — ink panel, scrollable text left, photo right (desktop).
function StoryOverlay({ t, onClose }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!t) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [t, onClose]);

  return (
    <AnimatePresence>
      {t && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Story of ${t.author}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex w-[92vw] max-w-5xl h-[85vh] overflow-hidden shadow-2xl bg-ink rounded-[3px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-5 z-10 text-bg/50 hover:text-gold transition-colors text-3xl leading-none"
            >
              ×
            </button>

            {/* Left — full text */}
            <div
              className="flex-1 min-h-0 overflow-y-auto p-8 md:p-14 flex flex-col justify-start"
              style={{ overscrollBehavior: "contain" }}
              data-lenis-prevent
            >
              <div className="text-gold mb-6 text-[13px] tracking-[4px]">★★★★★</div>
              <p className="font-heading text-xl md:text-2xl italic font-light leading-relaxed text-[#F5F0E8] mb-10 whitespace-pre-line">
                &ldquo;{t.full}&rdquo;
              </p>
              <p className="text-[11px] uppercase font-bold text-bg tracking-[0.18em] mb-1">{t.author}</p>
              <p className="text-[10px] text-gold">{t.location}</p>
            </div>

            {/* Right — image (desktop only) */}
            <div className="hidden md:block w-[42%] flex-shrink-0 relative">
              <Image src={t.image} alt={t.author} fill className="object-cover" sizes="42vw" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
