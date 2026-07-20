"use client";

import { WHATSAPP_URL } from "@/components/landing/theme";

// Safety net for all landing pages: if a landing route crashes at runtime,
// only this fallback renders — the rest of the site is untouched.
export default function LandingError({ error, reset }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center py-24">
        <p className="text-[10px] tracking-[0.42em] uppercase text-gold font-medium mb-5">
          Vows &amp; Vedas
        </p>
        <h1 className="font-heading text-ink text-4xl md:text-5xl font-light leading-tight mb-4">
          This page took a <em className="italic">pause</em>
        </h1>
        <p className="text-sm text-muted font-light leading-relaxed mb-10">
          Something went wrong loading this page. Reload to try again, or reach
          us directly — we&rsquo;re always happy to talk weddings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-10 py-4 bg-gold text-ink text-[11px] tracking-[0.3em] uppercase font-semibold border border-gold rounded-[2px] transition-colors duration-300 hover:bg-ink hover:text-gold"
          >
            Reload page
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 text-ink/70 text-[11px] tracking-[0.3em] uppercase font-semibold border border-ink/20 rounded-[2px] transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </div>
  );
}
