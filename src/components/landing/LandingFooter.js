import Image from "next/image";
import { Flourish } from "./Ornaments";
import { WHATSAPP_URL, EMAIL, INSTAGRAM_URL, FACEBOOK_URL } from "./theme";

// Minimal ink footer: identity, contact, legal. No site navigation — the
// landing page keeps its focus to the very end.
export default function LandingFooter() {
  return (
    // pb-28 on phones keeps the sticky CTA bar from covering the contact links
    <footer className="bg-ink text-bg/55 pt-12 pb-28 md:pb-12 px-5 sm:px-8">
      <div className="max-w-[880px] mx-auto flex flex-col items-center text-center gap-5">
        <Flourish dark className="w-[140px]" />
        <div className="relative h-[44px] w-[200px]">
          <Image src="/assets/photos/for -4A.png" alt="Vows & Vedas" fill className="object-contain" sizes="200px" />
        </div>
        <p className="text-[12px] font-light max-w-[380px] leading-relaxed">
          India&rsquo;s premier luxury destination wedding studio.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] tracking-[0.22em] uppercase">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">WhatsApp</a>
          <a href={`mailto:${EMAIL}`} className="hover:text-gold transition-colors">Email</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Instagram</a>
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">Facebook</a>
          <a href="/privacy" className="hover:text-gold transition-colors">Privacy</a>
        </div>
        <p className="text-[10px] tracking-widest">© {new Date().getFullYear()} Vows &amp; Vedas. All rights reserved.</p>
      </div>
    </footer>
  );
}
