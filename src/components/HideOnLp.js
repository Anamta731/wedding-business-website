"use client";
import { usePathname } from "next/navigation";

// Renders nothing on landing pages (/lp/*). Wrapping a Server Component in
// this gate keeps it a Server Component — only this tiny gate hydrates,
// so the main site ships no extra client JS for the wrapped child.
export default function HideOnLp({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/lp")) return null;
  return children;
}
