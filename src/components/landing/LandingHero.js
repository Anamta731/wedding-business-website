"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Diamond } from "./Ornaments";

const SLIDE_MS = 6000;

// Full-bleed crossfading image slider with the headline on the left and the
// RSVP card (passed as children) laid over the imagery — beside the headline
// on desktop, directly beneath it on phones.
export default function LandingHero({ eyebrow, title, titleAccent, subtitle, placesLine, slides, children }) {
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
      {/* ── Slider backdrop ── */}
      <div className="absolute inset-0">
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
            >
              <Image
                src={slides[index].image}
                alt={slides[index].alt}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* Ink veil for legibility */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,20,8,0.4)_0%,rgba(26,20,8,0.2)_45%,rgba(26,20,8,0.55)_78%,rgba(26,20,8,0.78)_100%)]" />
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
        <div className="min-h-[40svh] flex flex-col justify-end lg:min-h-0 lg:justify-center pb-6 lg:pb-0 pointer-events-none lg:pointer-events-auto">
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
            transition={{ duration: 0.8, delay: 1.3 }}
            className="text-bg/75 font-light text-[14px] sm:text-[15px] leading-relaxed max-w-[440px] mb-6"
          >
            {subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.7 }}
            className="flex items-center gap-3 text-[10px] tracking-[0.34em] uppercase text-bg/75 font-medium [text-shadow:0_1px_14px_rgba(26,20,8,0.55)]"
          >
            <Diamond className="!bg-gold/70" />
            <span>{placesLine}</span>
            <Diamond className="hidden sm:inline-block !bg-gold/70" />
          </motion.p>

          {/* Slide progress ornaments — hit area padded to 44px without moving layout */}
          <div className="flex gap-2.5 mt-5 lg:mt-9 pointer-events-auto">
            {slides.map((s, i) => (
              <button
                key={s.image}
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1}`}
                className="group px-1 -mx-1 py-[21px] -my-[13px]"
              >
                <span
                  className={`block h-[2px] w-9 transition-all duration-500 ${
                    i === index ? "bg-gold" : "bg-bg/30 group-hover:bg-bg/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RSVP card slot — the invitation resting on the imagery */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
          className="relative z-10 max-w-[420px] mx-auto w-full lg:mx-0 lg:max-w-none lg:pt-32 lg:pb-12"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
