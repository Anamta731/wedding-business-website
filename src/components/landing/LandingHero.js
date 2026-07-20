"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const SLIDE_MS = 6000;

// Full-bleed crossfading image slider with the headline on the left and the
// RSVP card (passed as children) laid over the imagery — beside the headline
// on desktop, directly beneath it on phones.
export default function LandingHero({ eyebrow, title, titleAccent, subtitle, trustBadges = [], stats = [], slides, children }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length, reduceMotion]);

  const goTo = (i) => setIndex(((i % slides.length) + slides.length) % slides.length);

  const onDragEnd = (_e, info) => {
    if (info.offset.x < -60) goTo(index + 1);
    else if (info.offset.x > 60) goTo(index - 1);
  };

  return (
    // p-0 required: the main site's global stylesheet gives every bare
    // <section> default padding — landing sections must declare their own
    <section className="relative overflow-hidden bg-ink p-0">
      {/* ── Slider backdrop — on phones a shorter top band (so faces stay
           clear of the text stack), fading into ink below; full-bleed on
           desktop ── */}
      <div className="absolute inset-x-0 top-0 h-[52svh] md:h-auto md:inset-0 overflow-hidden">
        <AnimatePresence>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.4, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduceMotion ? 1 : 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: "linear" }}
              style={{
                "--focal-m": slides[index].focal || "center",
                "--focal-d": slides[index].focalDesktop || "center",
              }}
            >
              <Image
                src={slides[index].image}
                alt={slides[index].alt}
                fill
                priority={index === 0}
                className="object-cover [object-position:var(--focal-m)] md:[object-position:var(--focal-d)]"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* Ink veil for legibility — lighter up top on phones so faces read */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,20,8,0.35)_0%,rgba(26,20,8,0.12)_40%,rgba(26,20,8,0.45)_75%,rgba(26,20,8,0.7)_100%)] md:bg-[linear-gradient(to_bottom,rgba(26,20,8,0.4)_0%,rgba(26,20,8,0.2)_45%,rgba(26,20,8,0.55)_78%,rgba(26,20,8,0.78)_100%)]" />
        {/* Phone: dissolve the image band into the ink below it */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] md:hidden bg-[linear-gradient(to_bottom,transparent_0%,#1A1408_92%)]" />
        <div className="absolute inset-0 hidden lg:block bg-[linear-gradient(to_right,rgba(26,20,8,0.5)_0%,transparent_55%)]" />
      </div>

      {/* Swipe layer (mobile) — sits behind the content so form/CTAs stay tappable */}
      <motion.div
        className="absolute inset-0 lg:hidden"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={onDragEnd}
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-8 pt-24 pb-8 lg:pt-0 lg:pb-0 lg:min-h-[92vh] lg:grid lg:grid-cols-[1fr_380px] lg:items-center lg:gap-16">
        {/* Headline block */}
        <div className="min-h-[46svh] flex flex-col justify-end lg:min-h-0 lg:justify-center pb-6 lg:pb-0 pointer-events-none lg:pointer-events-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[10px] tracking-[0.42em] uppercase text-gold font-semibold mb-5"
          >
            {eyebrow}
          </motion.p>
          <h1 className="font-heading text-bg font-light text-[40px] leading-[1.08] sm:text-[52px] lg:text-[64px] xl:text-[72px] lg:leading-[1.05] mb-6 max-w-[560px]">
            {title.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.24em]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease: "easeOut" }}
              >
                {word}
              </motion.span>
            ))}
            <motion.em
              className="block italic text-gold font-light"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 + title.split(" ").length * 0.12, ease: "easeOut" }}
            >
              {titleAccent}
            </motion.em>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="text-bg/80 font-light text-[14px] sm:text-[15px] leading-relaxed max-w-[460px] mb-6"
          >
            {subtitle}
          </motion.p>

          {/* Trust cues — quick, scannable reassurance */}
          {trustBadges.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25 }}
              className="flex flex-wrap gap-x-5 gap-y-2 mb-7 max-w-[480px]"
            >
              {trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-1.5 text-bg/90 text-[12px] sm:text-[13px] font-light [text-shadow:0_1px_10px_rgba(26,20,8,0.5)]"
                >
                  <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 text-gold shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 10.5l4 4 8-9" />
                  </svg>
                  <span>{badge}</span>
                </li>
              ))}
            </motion.ul>
          )}

          {/* Headline numbers — confident, evenly spaced, never crowded */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.45 }}
              className="flex items-center gap-4 sm:gap-6 max-w-[460px]"
            >
              {stats.map((stat, i) => (
                <div key={stat.label} className={`flex-1 ${i > 0 ? "border-l border-gold/25 pl-4 sm:pl-6" : ""}`}>
                  <div className="font-heading text-gold font-light leading-none text-[30px] sm:text-[38px]">
                    {stat.value}
                  </div>
                  <div className="text-bg/65 text-[9px] sm:text-[10px] tracking-[0.16em] uppercase font-medium mt-1.5 leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* RSVP card slot — the invitation resting on the imagery */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
          className="relative z-10 max-w-[420px] mx-auto w-full lg:mx-0 lg:max-w-none lg:pt-32 lg:pb-12 lg:translate-x-[clamp(16px,calc((100vw-1240px)/2),56px)]"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
