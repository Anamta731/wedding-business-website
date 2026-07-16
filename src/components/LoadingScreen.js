"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LoadingScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Ad visitors on landing pages (/lp/*) shouldn't wait behind the intro screen
  if (pathname?.startsWith("/lp")) return null;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-[#1C1C1C] flex items-center justify-center z-[99999] transition-opacity duration-700 ease-in-out">
      <div className="font-heading text-[var(--gold)] text-[clamp(18px,3vw,28px)] tracking-[0.4em] font-light animate-pulse">
        ✦ &nbsp; VOWS & VEDAS &nbsp; ✦
      </div>
    </div>
  );
}
