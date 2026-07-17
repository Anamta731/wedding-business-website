"use client";

import { useState } from "react";
import Image from "next/image";
import { trackClient, getSessionId } from "@/lib/clientTelemetry";
import { LotusFlourish } from "./Ornaments";
import { WHATSAPP_URL, EMAIL, INSTAGRAM_URL, FACEBOOK_URL } from "./theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal ink footer: identity, contact, stay-connected signup, legal.
// No site navigation — the landing page keeps its focus to the very end.
// Unlike the main footer's decorative field, this signup actually delivers
// the email to the team via the existing lead-notify pipeline.
export default function LandingFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter signup",
          contact: value,
          source: "Landing page footer — stay connected",
          session_id: getSessionId(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      trackClient("CtaClick", { channel: "newsletter", location: "lp_footer" });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    // pb-28 on phones keeps the sticky CTA bar from covering the contact links
    <footer className="bg-ink text-bg/55 pt-12 pb-28 md:pb-12 px-5 sm:px-8">
      <div className="max-w-[880px] mx-auto flex flex-col items-center text-center gap-5">
        <LotusFlourish dark className="w-[140px]" />
        <div className="relative h-[44px] w-[200px]">
          <Image src="/assets/photos/for -4A.png" alt="Vows & Vedas" fill className="object-contain" sizes="200px" />
        </div>
        <p className="text-[12px] font-light max-w-[380px] leading-relaxed">
          India&rsquo;s premier luxury destination wedding studio.
        </p>

        {/* Stay Connected — same block as the main footer, wired to the team */}
        <div className="w-full max-w-[360px]">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium mb-3">Stay Connected</p>
          <p className="text-[12px] font-light mb-4 text-bg/50">Receive inspiration, stories &amp; exclusive offers.</p>
          {status === "done" ? (
            <p className="text-[12px] text-gold font-light py-3">You&rsquo;re on the list — see you in your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                placeholder="Your email address"
                aria-label="Email address for updates"
                className="bg-bg/5 border-none p-3 text-[16px] sm:text-[12px] text-bg outline-none focus:ring-1 focus:ring-gold/50 transition-shadow w-full rounded-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Sign up"
                className="bg-gold px-4 text-ink transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
              >
                {status === "loading" ? "…" : "→"}
              </button>
            </form>
          )}
          {status === "error" && (
            <p role="alert" className="text-[11px] text-[#C96A72] font-light mt-2">
              Please enter a valid email address and try again.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] tracking-[0.22em] uppercase">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">WhatsApp</a>
          <a href={`mailto:${EMAIL}`} className="hover:text-gold transition-colors">Email</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a>
        </div>
        <p className="text-[10px] tracking-widest">© {new Date().getFullYear()} Vows &amp; Vedas. All rights reserved.</p>
      </div>
    </footer>
  );
}
