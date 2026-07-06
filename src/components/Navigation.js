"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import ProfileDropdown from "@/components/global/ProfileDropdown";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSubmenu(null);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/portfolio" },
    {
      name: "Destinations",
      href: "/destinations",
      submenu: [
        { name: "Beach and Backwaters", href: "/destinations/beach-weddings" },
        { name: "Hills Weddings", href: "/destinations/hills-weddings" },
        { name: "Royal and Heritage", href: "/destinations/royal-and-heritage" },
        { name: "Cities and Metropolitans", href: "/destinations/cities-and-metropolitans" },
      ],
    },
    { name: "FAQ", href: "/faq" },
  ];

  const isHome = pathname === "/";
  // Nav is transparent only on the home page before scrolling
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center h-[88px] md:h-[104px] px-3 sm:px-6 lg:px-8 transition-all duration-300 ${
          isTransparent
            ? "bg-transparent"
            : "bg-[#FDFAF5]/96 backdrop-blur-md shadow-sm border-b border-black/8"
        }`}
      >
        {/* Left — Logo */}
        <div className="flex-1 flex items-center">
          <Link
            href="/"
            className="relative h-[40px] w-[188px] md:h-[48px] md:w-[226px] shrink-0 transition-transform duration-300 hover:scale-[1.03]"
          >
            {/* Transparent nav — white logo on dark hero */}
            <Image
              src="/assets/photos/for -4A.png"
              alt="Vows & Vedas"
              fill
              priority
              className={`object-contain transition-opacity duration-300 ${isTransparent ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Scrolled nav — gold logo on cream nav */}
            <Image
              src="/assets/photos/for -4.png"
              alt="Vows & Vedas"
              fill
              priority
              className={`object-contain transition-opacity duration-300 ${isTransparent ? 'opacity-0' : 'opacity-100'}`}
            />
          </Link>
        </div>

        {/* Centre — Nav Links */}
        <ul className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.name} className="relative py-1 group">
                <Link
                  href={link.href}
                  className={`text-[11px] lg:text-[12px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 hover:text-gold ${
                    isActive ? "text-gold" : isTransparent ? "text-white/90" : "text-muted"
                  }`}
                >
                  {link.name}
                </Link>
                <div
                  className={`absolute bottom-0 left-0 h-[1.5px] bg-gold transition-all duration-300 ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-50"
                  }`}
                />
                {link.submenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="w-[210px] bg-[#FDFAF5] border border-ink/8 shadow-xl">
                      <ul className="p-2 flex flex-col gap-1">
                        {link.submenu.map((sublink) => (
                          <li key={sublink.name}>
                            <Link
                              href={sublink.href}
                              className="block px-4 py-2.5 text-[9px] tracking-[0.2em] uppercase text-muted transition-all duration-300 border border-transparent rounded-[4px] hover:border-gold hover:bg-gold/8 hover:text-gold hover:translate-x-1"
                            >
                              {sublink.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Right — Profile + CTA + Mobile Hamburger */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          <Link
            href="/contact"
            className={`hidden sm:inline-flex items-center text-[9px] lg:text-[10px] uppercase tracking-[0.22em] font-medium px-3 py-[6px] lg:px-4 lg:py-[7px] border transition-all duration-300 overflow-hidden relative group whitespace-nowrap ${
              isTransparent
                ? "border-white/60 text-white"
                : "border-gold text-ink"
            }`}
          >
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              Plan Your Wedding
            </span>
            <div className="absolute inset-0 bg-gold translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
          </Link>

          <div className="hidden md:block">
            <ProfileDropdown />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className={`md:hidden flex items-center justify-center w-10 h-10 ${
              isTransparent ? "text-white" : "text-ink"
            }`}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[110] bg-[#FDFAF5] flex flex-col transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between px-4 py-2 h-[88px] border-b border-ink/8">
          <Link href="/" className="relative h-[40px] w-[188px]" onClick={() => setMobileOpen(false)}>
            <Image
              src="/assets/photos/for -4.png"
              alt="Vows & Vedas"
              fill
              className="object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center w-10 h-10 text-ink"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isSubOpen = mobileSubmenu === link.name;
            return (
              <li key={link.name} className="border-b border-ink/8 last:border-b-0">
                {link.submenu ? (
                  <>
                    <div className="flex items-stretch">
                      <Link
                        href={link.href}
                        className={`flex-1 py-4 text-[13px] uppercase tracking-[0.22em] font-medium transition-colors ${
                          isActive ? "text-gold" : "text-ink"
                        }`}
                      >
                        {link.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileSubmenu(isSubOpen ? null : link.name)}
                        aria-label={`Toggle ${link.name} submenu`}
                        aria-expanded={isSubOpen}
                        className="flex items-center justify-center w-12 text-muted"
                      >
                        <ChevronDown
                          size={17}
                          strokeWidth={1.5}
                          className={`transition-transform duration-300 ${isSubOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        isSubOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <ul className="flex flex-col gap-1 pb-4 pl-2">
                        {link.submenu.map((sublink) => (
                          <li key={sublink.name}>
                            <Link
                              href={sublink.href}
                              className="block py-2.5 text-[11px] tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors"
                            >
                              {sublink.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`block py-4 text-[13px] uppercase tracking-[0.22em] font-medium transition-colors ${
                      isActive ? "text-gold" : "text-ink"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="px-6 py-5 border-t border-ink/8 flex items-center gap-4">
          <ProfileDropdown />
          <Link
            href="/contact"
            className="flex-1 text-center text-[10px] uppercase tracking-[0.22em] font-medium px-4 py-3 border border-gold text-ink hover:bg-gold hover:text-white transition-colors duration-300"
          >
            Plan Your Wedding
          </Link>
        </div>
      </div>
    </>
  );
}
