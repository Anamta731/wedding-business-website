"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trackClient, getSessionId, getUserId } from "@/lib/clientTelemetry";
import GoldDivider from "@/components/GoldDivider";
import CornerOrnament from "@/components/CornerOrnament";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const DIAL_CODES = [
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+1",   flag: "🇺🇸", name: "US / Canada" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+64",  flag: "🇳🇿", name: "New Zealand" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+32",  flag: "🇧🇪", name: "Belgium" },
  { code: "+45",  flag: "🇩🇰", name: "Denmark" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+39",  flag: "🇮🇹", name: "Italy" },
  { code: "+31",  flag: "🇳🇱", name: "Netherlands" },
  { code: "+47",  flag: "🇳🇴", name: "Norway" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+34",  flag: "🇪🇸", name: "Spain" },
  { code: "+46",  flag: "🇸🇪", name: "Sweden" },
  { code: "+41",  flag: "🇨🇭", name: "Switzerland" },
];

const weddingMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ContactPage() {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [weddingYear, setWeddingYear] = useState("");
  const [chatbotContext, setChatbotContext] = useState(null);
  const [sourcePagePath, setSourcePagePath] = useState("");
  const [referrerUrl, setReferrerUrl] = useState("");
  const [dialCode, setDialCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const formStartedRef = useRef(false);

  // Fire once when the visitor first interacts with any form field — the top of
  // the on-page conversion funnel that pairs with EnquirySubmitted.
  const handleFormStart = () => {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    trackClient("ContactFormStarted", { sourcePagePath: sourcePagePath || "" });
  };

  useEffect(() => {
    const raw = sessionStorage.getItem("chatbot_context");
    if (raw) {
      try { setChatbotContext(JSON.parse(raw)); } catch {}
      sessionStorage.removeItem("chatbot_context");
    }
    const storedPath = sessionStorage.getItem("cta_source_path") || "";
    if (storedPath) setSourcePagePath(window.location.origin + storedPath);
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.host)) setReferrerUrl(ref);
  }, []);

  const currentYear = new Date().getFullYear();
  const weddingYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

  useEffect(() => {
    const handleScroll = () => {
      const bg = document.getElementById("contact-img-bg");
      if (bg) bg.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    const form = e.target;
    try {
      const recaptchaToken = await getRecaptchaToken();
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.fname.value,
          lastName: form.lname.value,
          email: form.email.value,
          phone: phoneNumber ? `${dialCode} ${phoneNumber}` : "",
          destination: form.destination.value,
          weddingDate: form.estimatedWeddingDate.value,
          message: form.message.value,
          chatbotContext,
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
      alert("Something went wrong. Please try again or email us directly.");
    }
  };

  return (
    <div id="contact-layout" className="grid grid-cols-1 md:grid-cols-2 min-h-screen pt-20 md:pt-0">

      {/* ── FORM SIDE ─────────────────────────────────────────────── */}
      <div
        className="contact-form-side px-6 pt-10 pb-28 sm:px-8 md:px-14 lg:px-20 xl:px-24 md:py-24 flex flex-col justify-center relative"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 0% 0%, rgba(201,162,52,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 100% 100%, rgba(201,162,52,0.04) 0%, transparent 70%), #FDFAF5",
          boxShadow: "4px 0 30px rgba(26,20,8,0.06)"
        }}
      >
        <CornerOrnament size={48} inset={16} opacity={0.35} />
        <div className="max-w-[680px] w-full mx-auto">
          <GoldDivider className="mb-5 md:mb-6 opacity-0 translate-y-5 animate-fadeUp" />

          {/* Eyebrow */}
          <p className="form-eyebrow text-[10px] tracking-[0.42em] md:tracking-[0.5em] uppercase text-gold mb-4 md:mb-5 font-medium opacity-0 translate-y-5 animate-fadeUp">
            Let&rsquo;s Begin
          </p>

          {/* Heading — reduced from 7xl to keep proportion */}
          <h1 className="form-title font-heading text-ink text-[38px] sm:text-[44px] md:text-[54px] xl:text-[58px] font-light leading-[1.05] md:leading-[1.1] mb-8 md:mb-9 opacity-0 translate-y-5 animate-fadeUp-delayed">
            Tell Us About<br />Your <em className="italic">Dream Day</em>
          </h1>

          <GoldDivider flip className="mb-10 md:mb-12 opacity-0 translate-y-5 animate-fadeUp-delayed" />

          <form id="contact-form" onSubmit={handleSubmit} onFocusCapture={handleFormStart} className="pt-2">

            {/* ── Cluster 1: Identity ── */}
            <div className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-7">
                <div className="form-group">
                  <label className="form-label" htmlFor="fname">First Name</label>
                  <input type="text" className="form-input" id="fname" name="fname" autoComplete="given-name" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lname">Last Name</label>
                  <input type="text" className="form-input" id="lname" name="lname" autoComplete="family-name" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 md:gap-y-7">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input type="email" className="form-input" id="email" name="email" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <div className="phone-field">
                    <select
                      className="form-select dial-select"
                      value={dialCode}
                      onChange={e => setDialCode(e.target.value)}
                      aria-label="Country dial code"
                      autoComplete="tel-country-code"
                    >
                      {DIAL_CODES.map(c => (
                        <option key={c.code + c.name} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      className="phone-number-input"
                      id="phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="form-cluster-sep" />

            {/* ── Cluster 2: Wedding Details ── */}
            <div className="space-y-7">
              <div className="form-group">
                <label className="form-label" htmlFor="destination">
                  Destination in Mind <span className="form-optional">(Optional)</span>
                </label>
                <input type="text" className="form-input" id="destination" name="destination" autoComplete="off" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="wedding-month">
                  Estimated Wedding Date <span className="form-optional">(Optional)</span>
                </label>
                <div className="date-picker-grid" aria-label="Estimated wedding date">
                  <select
                    className="form-input form-select"
                    id="wedding-month"
                    value={weddingMonth}
                    onChange={e => setWeddingMonth(e.target.value)}
                  >
                    <option value="">Month</option>
                    {weddingMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    className="form-input form-select"
                    id="wedding-year"
                    value={weddingYear}
                    onChange={e => setWeddingYear(e.target.value)}
                  >
                    <option value="">Year</option>
                    {weddingYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="hidden"
                  name="estimatedWeddingDate"
                  value={[weddingMonth, weddingYear].filter(Boolean).join(" ")}
                />
              </div>
            </div>

            <hr className="form-cluster-sep" />

            {/* ── Cluster 3: Message ── */}
            <div className="form-group">
              <label className="form-label" htmlFor="message">
                Tell Us Your Vision <span className="form-optional">(Optional)</span>
              </label>
              <textarea className="form-input form-textarea" id="message" name="message"></textarea>
            </div>

            {/* Submit */}
            <div className="mt-10">
              <button
                className={`form-submit relative px-14 py-4 md:py-5 bg-gold text-[#1A1408] text-[11px] tracking-[0.30em] uppercase font-semibold cursor-none overflow-hidden transition-all duration-300 border border-gold rounded-[2px] hover:bg-[#1A1408] hover:text-gold hover:border-gold ${status === "loading" ? "loading" : ""} ${status === "success" ? "!bg-[#4CAF50] hover:!bg-[#4CAF50] !border-[#4CAF50]" : ""}`}
                type="submit"
              >
                <span className={`submit-text transition-opacity duration-300 ${status !== "idle" ? "opacity-0" : "opacity-100"}`}>
                  Send My Enquiry
                </span>
                {status === "loading" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#1A1408]/30 border-t-[#1A1408] rounded-full animate-spin"></div>
                  </div>
                )}
                {status === "success" && (
                  <span className="absolute inset-0 flex items-center justify-center text-lg">✓</span>
                )}
              </button>
            </div>
          </form>

          {/* Alternative contact */}
          <div className="mt-10 md:mt-12 pt-8 md:pt-10 border-t border-ink/10">
            <p className="text-[9px] tracking-[0.28em] uppercase text-ink/40 font-medium mb-4">Or reach us directly</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="https://wa.me/919654277656"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClient("CtaClick", { channel: "whatsapp", location: "contact_page" })}
                className="contact-opt group flex flex-col items-center text-center sm:flex-row sm:text-left gap-2 sm:gap-4 border border-ink/10 rounded-[4px] px-3 py-4 sm:px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[#FAF7F2] hover:shadow-[0_4px_24px_rgba(201,162,52,0.1)]"
              >
                <span className="opt-icon w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#F5F0E8] border border-[#25D366]/30 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gold group-hover:border-gold shrink-0" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:hidden" fill="#25D366">
                    <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
                  </svg>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 hidden group-hover:block" fill="white">
                    <path d="M12.04 2C6.58 2 2.15 6.34 2.15 11.69c0 1.7.46 3.36 1.32 4.82L2 22l5.62-1.43a10.1 10.1 0 0 0 4.42 1.03c5.46 0 9.9-4.34 9.9-9.69S17.5 2 12.04 2Zm0 17.93a8.36 8.36 0 0 1-4.05-1.05l-.29-.16-3.33.85.89-3.17-.18-.31a7.97 7.97 0 0 1-1.25-4.4c0-4.43 3.68-8.03 8.21-8.03 4.54 0 8.22 3.6 8.22 8.03 0 4.44-3.68 8.24-8.22 8.24Zm4.51-6.02c-.25-.12-1.47-.71-1.7-.79-.23-.09-.4-.12-.56.12-.17.24-.64.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.2-.73-.64-1.23-1.44-1.37-1.68-.14-.24-.01-.37.11-.49.11-.11.25-.29.37-.43.12-.14.17-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.56-1.32-.77-1.81-.2-.47-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.3-.23.24-.87.83-.87 2.03 0 1.19.89 2.35 1.01 2.51.12.16 1.75 2.62 4.24 3.67.59.25 1.05.4 1.41.51.59.18 1.13.16 1.56.1.47-.07 1.47-.59 1.68-1.15.21-.57.21-1.05.14-1.15-.06-.11-.22-.17-.46-.29Z" />
                  </svg>
                </span>
                <span className="flex flex-col items-center sm:items-start">
                  <span className="opt-label text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">WhatsApp</span>
                  <span className="text-[11px] text-muted mt-0.5">Quick message</span>
                </span>
              </Link>

              <Link
                href="mailto:info@vowsandvedas.com"
                onClick={() => trackClient("CtaClick", { channel: "email", location: "contact_page" })}
                className="contact-opt group flex flex-col items-center text-center sm:flex-row sm:text-left gap-2 sm:gap-4 border border-ink/10 rounded-[4px] px-3 py-4 sm:px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[#FAF7F2] hover:shadow-[0_4px_24px_rgba(201,162,52,0.1)]"
              >
                <span className="opt-icon w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#F5F0E8] border border-ink/10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gold group-hover:border-gold shrink-0" aria-hidden="true">
                  <svg viewBox="0 0 48 48" className="w-5 h-5 group-hover:hidden" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3V16.2z"/>
                    <path fill="#1e88e5" d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"/>
                    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.45 35,23.7 36,17"/>
                    <path fill="#c62828" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"/>
                    <path fill="#fbc02d" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"/>
                  </svg>
                  <svg viewBox="0 0 48 48" className="w-5 h-5 hidden group-hover:block" xmlns="http://www.w3.org/2000/svg">
                    <path fill="white" d="M45 16.2l-5 2.75-5 4.75L35 40h7c1.657 0 3-1.343 3-3V16.2z"/>
                    <path fill="white" d="M3 16.2l3.614 1.71L13 23.7V40H6c-1.657 0-3-1.343-3-3V16.2z"/>
                    <polygon fill="white" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.45 35,23.7 36,17"/>
                    <path fill="white" d="M3 12.298V16.2l10 7.5V11.2L9.876 8.859C9.132 8.301 8.228 8 7.298 8 4.924 8 3 9.924 3 12.298z"/>
                    <path fill="white" d="M45 12.298V16.2l-10 7.5V11.2l3.124-2.341C38.868 8.301 39.772 8 40.702 8 43.076 8 45 9.924 45 12.298z"/>
                  </svg>
                </span>
                <span className="flex flex-col items-center sm:items-start">
                  <span className="opt-label text-[10px] tracking-[0.2em] uppercase font-semibold text-ink">Email</span>
                  <span className="text-[11px] text-muted mt-0.5">Write to us</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── IMAGE SIDE ────────────────────────────────────────────── */}
      <div className="contact-image-side relative overflow-hidden hidden md:block">
        <div
          id="contact-img-bg"
          className="absolute inset-[-10%] bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/photos/couple-shots/formpageimg.png')" }}
        />
        {/* Directional gradient — dark on left, fades right for cinematic editorial look */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(26,20,8,0.72) 0%, rgba(26,20,8,0.42) 50%, rgba(26,20,8,0.15) 100%)" }}
        />
        {/* Left-aligned quote sitting on the dark side of the gradient */}
        <div className="contact-quote absolute top-[35%] left-12 right-16 z-[2] -translate-y-1/2 flex flex-col items-start text-left">
          <div className="quote-ornament quote-ornament--top">
            <GoldDivider darkBg className="!opacity-100" />
          </div>
          <blockquote className="font-heading text-surface text-[36px] md:text-[44px] font-light italic leading-[1.15] max-w-[520px]">
            &ldquo;The best weddings begin with a single conversation.&rdquo;
          </blockquote>
          <div className="quote-ornament quote-ornament--bottom">
            <GoldDivider darkBg flip className="!opacity-100" />
          </div>
        </div>
      </div>

      <style jsx>{`

        /* ── Field groups — left gold accent bar on focus ── */
        .form-group {
          position: relative;
          padding-left: 16px;
        }
        .form-group::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2px;
          height: 70%;
          background: linear-gradient(to bottom, transparent, #C9A234, transparent);
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
        }
        .form-group:focus-within::before {
          transform: translateY(-50%) scaleY(1);
        }

        /* ── Labels ── */
        .form-label {
          display: block;
          color: rgba(26, 20, 8, 0.55);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.20em;
          line-height: 1.4;
          margin-bottom: 0;
          text-transform: uppercase;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }
        .form-group:focus-within .form-label {
          color: var(--color-gold);
          text-shadow: 0 0 12px rgba(201, 162, 52, 0.3);
        }

        /* Optional tag — whispered footnote */
        .form-optional {
          font-size: 9px;
          letter-spacing: 1px;
          color: rgba(26, 20, 8, 0.30);
          font-style: italic;
          font-weight: 400;
          text-transform: none;
        }

        /* ── Inputs ── */
        .form-input {
          width: 100%;
          min-height: 46px;
          border: 0;
          border-bottom: 1.5px solid rgba(26, 20, 8, 0.22);
          background: transparent;
          color: var(--color-ink);
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.5;
          padding: 20px 0 14px;
          transition: border-color .25s, box-shadow .25s;
        }
        .form-input:focus {
          border-color: var(--color-gold);
          box-shadow: 0 2px 0 0 #C9A234;
          outline: none;
        }
        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }

        /* ── Autofill override — paint over Chrome's blue with warm cream ── */
        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover,
        .form-input:-webkit-autofill:focus,
        .form-input:-webkit-autofill:active,
        .phone-number-input:-webkit-autofill,
        .phone-number-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #FAF7F2 inset !important;
          box-shadow: 0 0 0 1000px #FAF7F2 inset !important;
          -webkit-text-fill-color: #1A1408 !important;
          border-bottom: 1.5px solid var(--color-gold) !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ── Cluster separator ── */
        .form-cluster-sep {
          border: none;
          border-top: 1px solid rgba(26, 20, 8, 0.07);
          margin: 40px 0 40px 16px;
        }

        /* ── Submit button — glow + shimmer sweep + ink-wash hover ── */
        .form-submit {
          box-shadow:
            0 0 18px rgba(201, 162, 52, 0.35),
            0 4px 24px rgba(201, 162, 52, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .form-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
          transition: left 0.6s ease;
        }
        .form-submit:hover::before { left: 160%; }
        .form-submit:hover {
          box-shadow:
            0 0 28px rgba(201, 162, 52, 0.5),
            0 8px 40px rgba(26, 20, 8, 0.4),
            inset 0 1px 0 rgba(201, 162, 52, 0.1);
          transform: translateY(-2px);
        }

        /* ── "Dream Day" — metallic gold gradient on the italic em ── */
        .form-title em {
          background: linear-gradient(135deg, #E8C96A 0%, #C9A234 35%, #A6832A 65%, #C9A234 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 8px rgba(201, 162, 52, 0.25));
        }

        /* ── Eyebrow "LET'S BEGIN" — gold shimmer sweep ── */
        .form-eyebrow {
          background: linear-gradient(90deg, #C9A234 0%, #F0D875 30%, #C9A234 50%, #A6832A 80%, #C9A234 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 4s ease-in-out infinite;
        }

        /* ── Phone field — unified single-border container ── */
        .phone-field {
          display: flex;
          align-items: stretch;
          border-bottom: 1.5px solid rgba(26, 20, 8, 0.22);
          transition: border-color .25s, box-shadow .25s;
        }
        .phone-field:focus-within {
          border-color: var(--color-gold);
          box-shadow: 0 2px 0 0 #C9A234;
        }
        .dial-select {
          appearance: none;
          background-color: transparent;
          border: none;
          border-right: 1px solid rgba(26, 20, 8, 0.12);
          min-width: 100px;
          padding: 8px 32px 14px 0;
          font-family: var(--font-body);
          font-size: 13px;
          letter-spacing: 0.04em;
          color: var(--color-ink);
          cursor: pointer;
          background-image:
            linear-gradient(45deg, transparent 50%, #C9A234 50%),
            linear-gradient(135deg, #C9A234 50%, transparent 50%);
          background-position:
            calc(100% - 14px) calc(50% - 2px),
            calc(100% - 8px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          outline: none;
          flex-shrink: 0;
        }
        .phone-number-input {
          flex: 1;
          min-width: 0;
          border: none;
          background: transparent;
          color: var(--color-ink);
          font-family: var(--font-body);
          font-size: 15px;
          padding: 8px 0 14px 12px;
          outline: none;
        }
        .phone-number-input::placeholder { color: rgba(26, 20, 8, 0.35); }

        /* ── Date selects ── */
        .date-picker-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(104px, 0.65fr);
          gap: 18px;
        }
        .form-select {
          appearance: none;
          cursor: pointer;
          background-image:
            linear-gradient(45deg, transparent 50%, #C9A234 50%),
            linear-gradient(135deg, #C9A234 50%, transparent 50%);
          background-position:
            calc(100% - 14px) calc(50% - 2px),
            calc(100% - 8px) calc(50% - 2px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 30px;
        }

        /* ── Quote card — frosted dark glass ── */
        .contact-quote {
          background: rgba(26, 20, 8, 0.35);
          border: 1px solid rgba(201, 162, 52, 0.2);
          border-radius: 2px;
          padding: 40px 44px 44px;
          box-shadow:
            0 0 0 1px rgba(201, 162, 52, 0.08),
            0 8px 60px rgba(26, 20, 8, 0.5),
            inset 0 1px 0 rgba(201, 162, 52, 0.12);
        }

        /* ── Quote ornaments — glow + breathing pulse ── */
        .quote-ornament { animation: ornamentPulse 4s ease-in-out infinite; }
        .quote-ornament--top  { margin-bottom: 22px; }
        .quote-ornament--bottom { margin-top: 22px; }

        /* ── Animations ── */
        .animate-fadeUp { animation: fadeUp .8s .3s both; }
        .animate-fadeUp-delayed { animation: fadeUp .9s .5s both; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ornamentPulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(201,162,52,0.6)) drop-shadow(0 0 14px rgba(201,162,52,0.25));
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(201,162,52,0.9)) drop-shadow(0 0 24px rgba(201,162,52,0.45));
          }
        }

        /* ── Mobile overrides ── */
        @media (max-width: 767px) {
          .form-group { padding-left: 12px; }
          .form-cluster-sep { margin-left: 12px; }
          .form-input { min-height: 44px; font-size: 16px; }
          .form-textarea { min-height: 104px; }
          .date-picker-grid { grid-template-columns: 1fr; gap: 14px; }
        }
      `}</style>
    </div>
  );
}
