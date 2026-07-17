"use client";

import { motion } from "framer-motion";
import { LotusFlourish, Blossom } from "./Ornaments";

// Shared section shell: eyebrow + display heading, gentle fade-up on entry.
// The flourish lives inside the margin the heading already had — no extra space.
// Pass flourish={false} when a SectionDivider already ornaments the boundary.
export function SectionHeading({ eyebrow, title, titleAccent, dark = false, flourish = true, className = "" }) {
  const hairline = dark ? "bg-gold/30" : "bg-gold/40";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`text-center mb-7 md:mb-10 ${className}`}
    >
      <p className="flex items-center justify-center gap-3 text-[10px] md:text-[11px] tracking-[0.42em] uppercase text-gold font-semibold mb-4">
        <span className={`hidden sm:block w-14 md:w-24 h-px ${hairline}`} aria-hidden="true" />
        <Blossom />
        <span>{eyebrow}</span>
        <Blossom />
        <span className={`hidden sm:block w-14 md:w-24 h-px ${hairline}`} aria-hidden="true" />
      </p>
      <h2
        className={`font-heading font-light text-[34px] sm:text-[44px] md:text-[56px] leading-[1.08] ${
          dark ? "text-bg" : "text-ink"
        }`}
      >
        {title} <em className="italic text-gold">{titleAccent}</em>
      </h2>
      {flourish && <LotusFlourish className="mx-auto mt-4 w-[170px] md:w-[220px]" dark={dark} />}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
