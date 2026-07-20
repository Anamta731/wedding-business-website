"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";

// Shared detail overlay for the landing kit: bottom sheet on phones, split
// panel (content | photo) on desktop. Used by services and destinations —
// pass the scrollable content as children. On phones, pass `footer` to pin
// the CTA to the sheet's bottom edge: always visible, no scrolling needed.
// Sits above the chatbot (z-2200).
export default function DetailOverlay({ item, onClose, image, imageAlt, ariaLabel, footer, children }) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  // Scroll lock + Escape to close. Preferred lock is lenis.stop(): it blocks
  // wheel/touch on the page WITHOUT moving the scroll position (and still lets
  // the panel's own data-lenis-prevent area scroll), so closing lands exactly
  // where the visitor was — no jump to the form at the top. The position:fixed
  // path is only a fallback for when the Lenis instance isn't available.
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    if (lenis) {
      lenis.stop();
      return () => {
        lenis.start();
        window.removeEventListener("keydown", onKey);
      };
    }

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose, lenis]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="fixed inset-0 z-[2200] bg-[rgba(13,13,8,0.82)] backdrop-blur-[5px] flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={reduceMotion ? { opacity: 0 } : { y: "6%", opacity: 0, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "6%", opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full h-[88svh] rounded-t-2xl md:w-[90vw] md:max-w-[1020px] md:h-[80vh] md:rounded-lg bg-bg overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.55)] flex flex-col md:flex-row"
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-ink/55 backdrop-blur flex items-center justify-center text-bg hover:bg-ink transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Photo — top on phones, right pane on desktop */}
            <div className="relative h-[228px] shrink-0 md:h-auto md:shrink md:w-[55%] md:order-2">
              <Image src={image} alt={imageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,20,8,0.35),transparent_50%)] md:bg-[linear-gradient(to_right,rgba(253,250,245,0.18),transparent_35%)]" />
            </div>

            {/* Content */}
            <div className="relative flex-1 min-h-0 overflow-y-auto md:w-[45%] md:order-1 border-t md:border-t-0 md:border-r border-border" data-lenis-prevent>
              {children}
            </div>

            {/* Phone-only pinned CTA bar — the action stays on screen while
                the content scrolls beneath it */}
            {footer && (
              <div className="md:hidden shrink-0 border-t border-gold/25 bg-bg/95 backdrop-blur px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(26,20,8,0.08)]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
