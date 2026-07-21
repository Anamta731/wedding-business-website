"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "vv_consent"; // "all" | "essential"

const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

// Push a Consent Mode command via gtag if present, else straight to dataLayer.
// (The inline default in layout.js defines window.gtag and seeds denied defaults.)
function updateConsent(state) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", state);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["consent", "update", state]);
  }
}

export default function CookieBanner() {
  // Start hidden; reveal only after we confirm no prior choice (avoids SSR flash).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      } else if (stored === "all") {
        // Re-affirm granted state on this load (defaults start denied every page load).
        updateConsent(GRANTED);
      }
      // stored === "essential" → defaults already denied, nothing to do.
    } catch {
      // localStorage unavailable (private mode, etc.) — show the banner so the user can still choose.
      setVisible(true);
    }
  }, []);

  const choose = (choice) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore persistence failure */
    }
    if (choice === "all") updateConsent(GRANTED);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[9997] px-4 pb-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[560px] bg-[#1A1408] text-[#FDFAF5] border border-[#C9A234]/30 rounded-[4px] shadow-[0_8px_40px_rgba(0,0,0,0.35)] px-5 py-4 md:px-6 md:py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[12px] leading-[1.65] font-light text-[#FDFAF5]/80">
          We use cookies for analytics and advertising. See our{" "}
          <Link
            href="/privacy-policy"
            className="text-[#C9A234] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-medium border border-[#C9A234]/40 text-[#FDFAF5]/80 rounded-[2px] hover:border-[#C9A234] hover:text-[#C9A234] transition-colors cursor-none"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="px-4 py-2 text-[10px] tracking-[0.18em] uppercase font-semibold bg-[#C9A234] text-[#1A1408] border border-[#C9A234] rounded-[2px] hover:bg-[#FDFAF5] hover:border-[#FDFAF5] transition-colors cursor-none"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
