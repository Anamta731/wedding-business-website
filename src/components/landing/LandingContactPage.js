"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackClient, getSessionId, getUserId } from "@/lib/clientTelemetry";
import { Flourish, CornerFrame } from "./Ornaments";
import { WHATSAPP_URL, EMAIL } from "./theme";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const DIAL_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+1", flag: "🇺🇸", name: "US / Canada" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Full-page enquiry experience — an exact replica of the main website's
// contact page, rebuilt inside the landing kit: split layout, underline
// fields with the gold focus bar, the framed quote over photography, and
// direct WhatsApp/email options. Attribution stays on the landing variant.
export default function LandingContactPage({ backHref }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(false);
  const [dialCode, setDialCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [weddingYear, setWeddingYear] = useState("");
  const [sourcePagePath, setSourcePagePath] = useState("");
  const [referrerUrl, setReferrerUrl] = useState("");
  const formStartedRef = useRef(false);

  const currentYear = new Date().getFullYear();
  const weddingYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

  useEffect(() => {
    setSourcePagePath(window.location.origin + window.location.pathname);
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.host)) setReferrerUrl(ref);
  }, []);

  // Gentle parallax on the photo pane, like the main contact page
  useEffect(() => {
    const onScroll = () => {
      const bg = document.getElementById("lp-contact-img-bg");
      if (bg) bg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const handleFormStart = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackClient("ContactFormStarted", { sourcePagePath: sourcePagePath || "" });
  };

  const getRecaptchaToken = async () => {
    if (!RECAPTCHA_SITE_KEY || typeof window === "undefined") return null;
    for (let i = 0; i < 30 && !window.grecaptcha?.execute; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!window.grecaptcha?.execute) return null;
    try {
      return await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact" }).then(resolve).catch(reject);
        });
      });
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError(false);
    const form = e.target;
    // Single name field → split for the API's first/last contract
    const nameParts = form.name.value.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "—";
    try {
      const recaptchaToken = await getRecaptchaToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: form.email.value,
          phone: phoneNumber ? `${dialCode} ${phoneNumber}` : "",
          destination: form.destination.value,
          weddingDate: [weddingMonth, weddingYear].filter(Boolean).join(" "),
          message: form.message.value,
          botField: form.company_website.value, // honeypot — empty for real users
          recaptchaToken,
          sourcePagePath,
          referrerUrl,
          sessionId: getSessionId(),
          userId: getUserId(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/thank-you");
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      console.error(err);
      setStatus("idle");
      setError(true);
    }
  };

  return (
    <div className="bg-bg min-h-screen">
      {/* Slim page header — logo returns to the landing page, nothing else */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 h-[64px] sm:h-[72px] px-4 sm:px-8 bg-bg/95 backdrop-blur-md shadow-sm border-b border-ink/8">
        <Link href={backHref} className="relative h-[32px] w-[148px] sm:h-[38px] sm:w-[178px] md:h-[44px] md:w-[206px]">
          <Image src="/assets/photos/for -4.png" alt="Vows & Vedas" fill priority className="object-contain object-left" />
        </Link>
        <Link
          href={backHref}
          className="shrink-0 whitespace-nowrap text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-semibold text-ink/60 hover:text-gold transition-colors"
        >
          ← Back
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen pt-16 sm:pt-[72px]">
        {/* ── FORM SIDE ─────────────────────────────────────────────── */}
        <div
          className="relative px-6 pt-6 pb-10 sm:px-8 md:px-14 lg:px-20 md:py-10 flex flex-col justify-center"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 0% 0%, rgba(201,162,52,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 100% 100%, rgba(201,162,52,0.04) 0%, transparent 70%), #FDFAF5",
            boxShadow: "4px 0 30px rgba(26,20,8,0.06)",
          }}
        >
          <CornerFrame size={40} inset={14} opacity={0.4} className="hidden md:block" />
          <div className="max-w-[640px] w-full mx-auto">
            <p className="lp-eyebrow text-[10px] tracking-[0.42em] md:tracking-[0.5em] uppercase mb-2 font-medium">
              Let&rsquo;s Begin
            </p>

            <h1 className="lp-title font-heading text-ink text-[25px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-light leading-[1.1] mb-3 whitespace-nowrap">
              Tell Us About Your <em className="italic">Dream Day</em>
            </h1>

            <Flourish className="mb-6 w-[200px]" />

            <form onSubmit={handleSubmit} onFocusCapture={handleFormStart}>
              {/* Honeypot — invisible to humans; bots fill it and get flagged */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}
              >
                <label htmlFor="lpc_company_website">Do not fill this field</label>
                <input type="text" id="lpc_company_website" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>

              {/* ── Identity ── */}
              <div className="space-y-4">
                <div className="lpc-group">
                  <label className="lpc-label" htmlFor="lpc-name">Full Name</label>
                  <input type="text" className="lpc-input" id="lpc-name" name="name" autoComplete="name" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8">
                  <div className="lpc-group">
                    <label className="lpc-label" htmlFor="lpc-email">Email Address</label>
                    <input type="email" className="lpc-input" id="lpc-email" name="email" autoComplete="email" required />
                  </div>
                  <div className="lpc-group">
                    <label className="lpc-label" htmlFor="lpc-phone">Phone Number</label>
                    <div className="lpc-phone-field">
                      <select
                        className="lpc-dial"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        aria-label="Country dial code"
                        autoComplete="tel-country-code"
                      >
                        {DIAL_CODES.map((c) => (
                          <option key={c.code + c.name} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="lpc-phone-input"
                        id="lpc-phone"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter number"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="lpc-sep" />

              {/* ── Wedding details — side by side on desktop ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8">
                <div className="lpc-group">
                  <label className="lpc-label" htmlFor="lpc-destination">
                    Destination in Mind <span className="lpc-optional">(Optional)</span>
                  </label>
                  <input type="text" className="lpc-input" id="lpc-destination" name="destination" autoComplete="off" />
                </div>

                <div className="lpc-group">
                  <label className="lpc-label" htmlFor="lpc-month">
                    Estimated Wedding Date <span className="lpc-optional">(Optional)</span>
                  </label>
                  <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(104px,0.65fr)] gap-4">
                    <select className="lpc-input lpc-select" id="lpc-month" value={weddingMonth} onChange={(e) => setWeddingMonth(e.target.value)}>
                      <option value="">Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select className="lpc-input lpc-select" aria-label="Year" value={weddingYear} onChange={(e) => setWeddingYear(e.target.value)}>
                      <option value="">Year</option>
                      {weddingYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="lpc-sep" />

              {/* ── Message ── */}
              <div className="lpc-group">
                <label className="lpc-label" htmlFor="lpc-message">
                  Tell Us Your Vision <span className="lpc-optional">(Optional)</span>
                </label>
                <textarea className="lpc-input lpc-textarea" id="lpc-message" name="message" />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
                <input type="checkbox" name="consent" required className="mt-[2px] w-3.5 h-3.5 shrink-0 accent-[#C9A234] cursor-pointer" />
                <span className="text-[11px] text-muted font-light leading-snug">
                  I agree to Vows &amp; Vedas using these details to contact me about my enquiry.
                </span>
              </label>

              {/* Submit */}
              <div className="mt-5">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="lpc-submit relative px-14 py-4 bg-gold text-ink text-[11px] tracking-[0.3em] uppercase font-semibold border border-gold rounded-[2px] transition-all duration-300 hover:bg-ink hover:text-gold disabled:opacity-80"
                >
                  <span className={status === "loading" ? "opacity-0" : "opacity-100"}>Send My Enquiry</span>
                  {status === "loading" && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                    </span>
                  )}
                </button>
              </div>

              {error && (
                <p role="alert" className="text-[12px] text-[#9B3324] font-light mt-4">
                  We couldn&rsquo;t send that — please try again, or{" "}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    message us on WhatsApp
                  </a>
                  .
                </p>
              )}
            </form>

            {/* Alternative contact */}
            <div className="mt-6 pt-5 border-t border-ink/10">
              <p className="text-[9px] tracking-[0.28em] uppercase text-ink/40 font-medium mb-3">Or reach us directly</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "lp_enquire_page" })}
                  className="group flex flex-col items-center text-center sm:flex-row sm:text-left gap-2 sm:gap-4 border border-ink/10 rounded-[4px] px-3 py-4 sm:px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[#FAF7F2]"
                >
                  <span className="w-10 h-10 sm:w-11 sm:h-11 bg-[#F5F0E8] border border-[#25D366]/30 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366">
                      <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-center sm:items-start">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">WhatsApp</span>
                    <span className="text-[11px] text-muted mt-0.5">Quick message</span>
                  </span>
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  onClick={() => trackClient("CtaClick", { channel: "email", location: "lp_enquire_page" })}
                  className="group flex flex-col items-center text-center sm:flex-row sm:text-left gap-2 sm:gap-4 border border-ink/10 rounded-[4px] px-3 py-4 sm:px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[#FAF7F2]"
                >
                  <span className="w-10 h-10 sm:w-11 sm:h-11 bg-[#F5F0E8] border border-ink/10 rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                  </span>
                  <span className="flex flex-col items-center sm:items-start">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">Email</span>
                    <span className="text-[11px] text-muted mt-0.5">Write to us</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── IMAGE SIDE ────────────────────────────────────────────── */}
        <div className="relative overflow-hidden hidden md:block">
          <div
            id="lp-contact-img-bg"
            className="absolute inset-[-10%] bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/photos/couple-shots/formpageimg.png')" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(26,20,8,0.72) 0%, rgba(26,20,8,0.42) 50%, rgba(26,20,8,0.15) 100%)" }}
          />
          <div className="absolute top-[35%] left-12 right-16 z-[2] -translate-y-1/2 flex flex-col items-start text-left bg-ink/35 border border-gold/20 rounded-[2px] px-11 py-10 shadow-[0_8px_60px_rgba(26,20,8,0.5)]">
            <Flourish dark className="w-[200px] mb-5" />
            <blockquote className="font-heading text-surface text-[34px] lg:text-[42px] font-light italic leading-[1.15] max-w-[520px]">
              &ldquo;The best weddings begin with a single conversation.&rdquo;
            </blockquote>
            <Flourish dark className="w-[200px] mt-5 rotate-180" />
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Field groups — left gold accent bar on focus, as on the main site */
        .lpc-group {
          position: relative;
          padding-left: 16px;
        }
        .lpc-group::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px;
          height: 70%;
          background: linear-gradient(to bottom, transparent, #c9a234, transparent);
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
        .lpc-group:focus-within::before {
          transform: translateY(-50%) scaleY(1);
        }
        .lpc-label {
          display: block;
          color: rgba(26, 20, 8, 0.55);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.2em;
          line-height: 1.4;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .lpc-group:focus-within .lpc-label {
          color: #c9a234;
        }
        .lpc-optional {
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(26, 20, 8, 0.3);
          font-style: italic;
          font-weight: 400;
          text-transform: none;
        }
        .lpc-input {
          width: 100%;
          min-height: 40px;
          border: 0;
          border-bottom: 1.5px solid rgba(26, 20, 8, 0.22);
          background: transparent;
          color: #1a1408;
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.5;
          padding: 8px 0 7px;
          transition: border-color 0.25s, box-shadow 0.25s;
          outline: none;
          border-radius: 0;
        }
        .lpc-input:focus {
          border-color: #c9a234;
          box-shadow: 0 2px 0 0 #c9a234;
        }
        .lpc-textarea {
          min-height: 68px;
          resize: vertical;
        }
        .lpc-input:-webkit-autofill,
        .lpc-input:-webkit-autofill:focus,
        .lpc-phone-input:-webkit-autofill,
        .lpc-phone-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #faf7f2 inset !important;
          -webkit-text-fill-color: #1a1408 !important;
          border-bottom: 1.5px solid #c9a234 !important;
        }
        .lpc-sep {
          border: none;
          border-top: 1px solid rgba(26, 20, 8, 0.07);
          margin: 18px 0 18px 16px;
        }
        .lpc-phone-field {
          display: flex;
          align-items: stretch;
          border-bottom: 1.5px solid rgba(26, 20, 8, 0.22);
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .lpc-phone-field:focus-within {
          border-color: #c9a234;
          box-shadow: 0 2px 0 0 #c9a234;
        }
        .lpc-dial {
          appearance: none;
          background-color: transparent;
          border: none;
          border-right: 1px solid rgba(26, 20, 8, 0.12);
          min-width: 96px;
          padding: 6px 28px 7px 0;
          font-family: var(--font-body);
          font-size: 13px;
          color: #1a1408;
          cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, #c9a234 50%),
            linear-gradient(135deg, #c9a234 50%, transparent 50%);
          background-position: calc(100% - 14px) calc(50% - 2px), calc(100% - 8px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          outline: none;
          flex-shrink: 0;
        }
        .lpc-phone-input {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          color: #1a1408;
          font-family: var(--font-body);
          font-size: 16px;
          padding: 6px 0 7px 12px;
          outline: none;
        }
        .lpc-phone-input::placeholder {
          color: rgba(26, 20, 8, 0.35);
        }
        .lpc-select {
          appearance: none;
          cursor: pointer;
          background-image: linear-gradient(45deg, transparent 50%, #c9a234 50%),
            linear-gradient(135deg, #c9a234 50%, transparent 50%);
          background-position: calc(100% - 14px) calc(50% - 2px), calc(100% - 8px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 30px;
        }
        /* Eyebrow — gold shimmer sweep, as on the main site */
        .lp-eyebrow {
          background: linear-gradient(90deg, #c9a234 0%, #f0d875 30%, #c9a234 50%, #a6832a 80%, #c9a234 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lpcShimmer 4s ease-in-out infinite;
        }
        /* "Dream Day" — metallic gold gradient */
        .lp-title :global(em) {
          background: linear-gradient(135deg, #e8c96a 0%, #c9a234 35%, #a6832a 65%, #c9a234 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        /* Submit — glow + shimmer sweep */
        .lpc-submit {
          overflow: hidden;
          box-shadow: 0 0 18px rgba(201, 162, 52, 0.35), 0 4px 24px rgba(201, 162, 52, 0.2);
        }
        .lpc-submit::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
          transition: left 0.6s ease;
        }
        .lpc-submit:hover::before {
          left: 160%;
        }
        @keyframes lpcShimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        @media (min-width: 768px) {
          .lpc-input,
          .lpc-phone-input {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
