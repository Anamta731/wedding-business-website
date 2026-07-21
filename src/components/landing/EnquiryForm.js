"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trackClient, getSessionId, getUserId } from "@/lib/clientTelemetry";
import { CornerFrame, Lotus } from "./Ornaments";
import { WHATSAPP_URL, ENQUIRE_ID } from "./theme";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// min/max = expected national number length (digits, without the dial code)
// for that country's mobile numbers — used to validate the phone field.
const DIAL_CODES = [
  { code: "+91", label: "🇮🇳 +91", name: "India", min: 10, max: 10 },
  { code: "+44", label: "🇬🇧 +44", name: "UK", min: 10, max: 10 },
  { code: "+1", label: "🇺🇸 +1", name: "US / Canada", min: 10, max: 10 },
  { code: "+971", label: "🇦🇪 +971", name: "UAE", min: 9, max: 9 },
  { code: "+65", label: "🇸🇬 +65", name: "Singapore", min: 8, max: 8 },
  { code: "+61", label: "🇦🇺 +61", name: "Australia", min: 9, max: 9 },
  { code: "+49", label: "🇩🇪 +49", name: "Germany", min: 10, max: 11 },
  { code: "+33", label: "🇫🇷 +33", name: "France", min: 9, max: 9 },
  { code: "+31", label: "🇳🇱 +31", name: "Netherlands", min: 9, max: 9 },
  { code: "+34", label: "🇪🇸 +34", name: "Spain", min: 9, max: 9 },
];

// The RSVP card — the landing page's signature element and its entire goal.
// Posts to the same /api/contact pipeline as the main site's contact page,
// tagged with this landing page's own path so every lead is attributable.
export default function EnquiryForm({ heading, subheading }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(false);
  const [dialCode, setDialCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sourcePagePath, setSourcePagePath] = useState("");
  const [referrerUrl, setReferrerUrl] = useState("");
  const formStartedRef = useRef(false);
  const country = DIAL_CODES.find((c) => c.code === dialCode) || DIAL_CODES[0];

  useEffect(() => {
    setSourcePagePath(window.location.origin + window.location.pathname);
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.host)) setReferrerUrl(ref);
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
    // Phone is optional, but if given it must match the country's expected length.
    if (phoneNumber && (phoneNumber.length < country.min || phoneNumber.length > country.max)) {
      setPhoneError(
        country.min === country.max
          ? `Please enter a ${country.min}-digit ${country.name} number.`
          : `Please enter a ${country.min}–${country.max} digit ${country.name} number.`
      );
      return;
    }
    setPhoneError("");
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
          weddingDate: "",
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
    <div id={ENQUIRE_ID} className="rsvp-card relative scroll-mt-24">
      {/* Lotus crest — straddles the card's top border, zero footprint */}
      <div className="absolute z-10 left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <Lotus className="w-[56px] drop-shadow-[0_2px_8px_rgba(26,20,8,0.25)]" />
      </div>

      <div className="rsvp-inner relative px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
        <CornerFrame size={28} inset={8} opacity={0.7} />
        <h2 className="font-heading text-ink text-[24px] sm:text-[26px] font-light leading-[1.12] text-center mb-1 sm:mb-1.5">
          {heading}
        </h2>
        <p className="text-center text-[12px] sm:text-[12.5px] text-muted font-light leading-relaxed mb-3.5 sm:mb-4 max-w-[300px] mx-auto">
          {subheading}
        </p>

        <form onSubmit={handleSubmit} onFocusCapture={handleFormStart} noValidate={false}>
          {/* Honeypot — invisible to humans; bots fill it and get flagged server-side */}
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}
          >
            <label htmlFor="lp_company_website">Do not fill this field</label>
            <input type="text" id="lp_company_website" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="lp-name">Full name</label>
            <input className="rsvp-input" type="text" id="lp-name" name="name" autoComplete="name" required />
          </div>

          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="lp-phone">Phone</label>
            <div className="flex items-stretch gap-3">
              <select
                className="rsvp-input !w-[92px] shrink-0 cursor-pointer"
                value={dialCode}
                onChange={(e) => { setDialCode(e.target.value); if (phoneError) setPhoneError(""); }}
                aria-label="Country dial code"
                autoComplete="tel-country-code"
              >
                {DIAL_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                className="rsvp-input flex-1 min-w-0"
                type="tel"
                id="lp-phone"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={country.max}
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "")); if (phoneError) setPhoneError(""); }}
                aria-invalid={phoneError ? "true" : undefined}
              />
            </div>
            {phoneError && (
              <p role="alert" className="text-[10.5px] text-[#9B3324] font-light mt-1">{phoneError}</p>
            )}
          </div>

          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="lp-email">Email</label>
            <input className="rsvp-input" type="email" id="lp-email" name="email" autoComplete="email" required />
          </div>

          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="lp-destination">
              Destination in mind <span className="rsvp-optional">(optional)</span>
            </label>
            <input className="rsvp-input" type="text" id="lp-destination" name="destination" autoComplete="off" placeholder="Udaipur, Goa, the hills…" />
          </div>

          <div className="rsvp-field">
            <label className="rsvp-label" htmlFor="lp-message">
              Your vision <span className="rsvp-optional">(optional)</span>
            </label>
            <textarea className="rsvp-input rsvp-textarea" id="lp-message" name="message" rows={2} placeholder="Guest count, dates, the feeling you want…" />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="relative block mx-auto mt-4 sm:mt-5 px-10 py-3 bg-gold text-ink text-[10.5px] tracking-[0.28em] uppercase font-semibold border border-gold rounded-full transition-all duration-300 hover:bg-ink hover:text-gold hover:scale-[1.04] disabled:opacity-80 shadow-[0_0_22px_rgba(201,162,52,0.55),0_6px_20px_rgba(201,162,52,0.3)] hover:shadow-[0_0_30px_rgba(201,162,52,0.7),0_8px_26px_rgba(201,162,52,0.35)]"
          >
            <span className={status === "loading" ? "opacity-0" : "opacity-100"}>Send my enquiry</span>
            {status === "loading" && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              </span>
            )}
          </button>

          {/* Consent — required before sending */}
          <label className="flex items-start gap-2.5 mt-4 cursor-pointer max-w-[320px] mx-auto">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-[2px] w-3.5 h-3.5 shrink-0 accent-[#C9A234] cursor-pointer"
            />
            <span className="text-[10.5px] text-muted font-light leading-snug text-left">
              I agree to Vows &amp; Vedas using these details to contact me about my enquiry.
            </span>
          </label>

          {error && (
            <p role="alert" className="text-center text-[11.5px] text-[#9B3324] font-light mt-3">
              We couldn&rsquo;t send that — please try again, or{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                message us on WhatsApp
              </a>
              .
            </p>
          )}
        </form>

        <p className="text-center text-[10px] sm:text-[10.5px] text-muted font-light mt-2.5 sm:mt-3">
          Our planners reply within 24 hours · Your details stay private
        </p>
      </div>

      <style jsx>{`
        /* The invitation card: ivory stock with a double gold hairline frame */
        .rsvp-card {
          background: #fdfaf5;
          border: 1px solid rgba(201, 162, 52, 0.6);
          border-radius: 3px;
          padding: 5px;
          box-shadow: 0 24px 70px rgba(26, 20, 8, 0.35), 0 4px 18px rgba(26, 20, 8, 0.18),
            0 0 40px rgba(201, 162, 52, 0.18);
        }
        .rsvp-inner {
          border: 1px solid rgba(201, 162, 52, 0.32);
          border-radius: 2px;
          background:
            radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201, 162, 52, 0.06) 0%, transparent 70%),
            #fdfaf5;
        }
        /* Compact on phones so the whole card fits one screen; roomier ≥640px */
        .rsvp-card :global(.rsvp-field) {
          margin-bottom: 9px;
        }
        .rsvp-card :global(.rsvp-label) {
          display: block;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(26, 20, 8, 0.55);
          margin-bottom: 1px;
        }
        .rsvp-card :global(.rsvp-optional) {
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: none;
          font-style: italic;
          font-weight: 400;
          color: rgba(26, 20, 8, 0.32);
        }
        .rsvp-card :global(.rsvp-input) {
          width: 100%;
          border: 0;
          border-bottom: 1.5px solid rgba(26, 20, 8, 0.2);
          background: transparent;
          color: #1a1408;
          font-family: var(--font-body);
          font-size: 16px; /* ≥16px prevents iOS auto-zoom on focus */
          line-height: 1.4;
          padding: 4px 0 5px;
          transition: border-color 0.25s;
          outline: none;
          border-radius: 0;
        }
        .rsvp-card :global(.rsvp-input:focus) {
          border-color: #c9a234;
        }
        .rsvp-card :global(.rsvp-input::placeholder) {
          color: rgba(26, 20, 8, 0.3);
          font-size: 13px;
        }
        .rsvp-card :global(.rsvp-textarea) {
          resize: none;
        }
        .rsvp-card :global(.rsvp-input:-webkit-autofill),
        .rsvp-card :global(.rsvp-input:-webkit-autofill:focus) {
          -webkit-box-shadow: 0 0 0 1000px #faf7f2 inset !important;
          -webkit-text-fill-color: #1a1408 !important;
          border-bottom: 1.5px solid #c9a234 !important;
        }
        @media (min-width: 640px) {
          .rsvp-card :global(.rsvp-field) {
            margin-bottom: 11px;
          }
          .rsvp-card :global(.rsvp-label) {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .rsvp-card :global(.rsvp-input) {
            padding: 6px 0 7px;
          }
          .rsvp-card :global(.rsvp-textarea) {
            min-height: 56px;
          }
        }
        @media (min-width: 768px) {
          .rsvp-card :global(.rsvp-input) {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
