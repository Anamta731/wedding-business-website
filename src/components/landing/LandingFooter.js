"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { trackClient, getSessionId } from "@/lib/clientTelemetry";
import { LotusFlourish } from "./Ornaments";
import { WHATSAPP_URL, EMAIL, INSTAGRAM_URL, FACEBOOK_URL, FOOTER_ID } from "./theme";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Minimal ink footer: identity, contact, stay-connected signup, legal.
// No site navigation — the landing page keeps its focus to the very end.
// Unlike the main footer's decorative field, this signup actually delivers
// the email to the team via the dedicated /api/newsletter-notify endpoint.
export default function LandingFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const botRef = useRef(null);

  // Load reCAPTCHA v3 once, guarded so it never double-injects if the hero
  // enquiry form already loaded it — same protection as the enquiry form.
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    if (document.querySelector("script[data-recaptcha]")) return;
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-recaptcha", "true");
    document.head.appendChild(script);
  }, []);

  const getRecaptchaToken = async () => {
    if (!RECAPTCHA_SITE_KEY || typeof window === "undefined") return null;
    for (let i = 0; i < 30 && !window.grecaptcha?.execute; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!window.grecaptcha?.execute) return null;
    try {
      return await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "newsletter" }).then(resolve).catch(reject);
        });
      });
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const recaptchaToken = await getRecaptchaToken();
      const res = await fetch("/api/newsletter-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: value,
          source: "Landing page footer — stay connected",
          session_id: getSessionId(),
          botField: botRef.current?.value || "",
          recaptchaToken,
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
    <footer id={FOOTER_ID} className="bg-ink text-bg/55 pt-12 pb-28 md:pb-12 px-5 sm:px-8">
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
              {/* Honeypot — invisible to people, filled only by bots */}
              <input
                ref={botRef}
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
              />
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
