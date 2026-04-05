"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingBag, Globe, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import AnnouncementBar from "./AnnouncementBar";

const NAV_LINKS = [
  { key: "robes", href: "/category/robes" },
  { key: "tops", href: "/category/tops" },
  { key: "pantalons", href: "/category/pantalons" },
  { key: "vestes", href: "/category/vestes" },
  { key: "accessoires", href: "/category/accessoires" },
  { key: "soldes", href: "/soldes" },
];

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLocale = locale === "fr" ? "en" : "fr";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-sm border-b border-beige/60"
            : "bg-transparent"
        }`}
      >
        <AnnouncementBar />
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Hamburger — mobile left */}
            <button
              className="md:hidden p-2 cursor-pointer text-noir hover:text-bronze transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop nav left */}
            <nav className="hidden md:flex items-center gap-6 flex-1">
              {NAV_LINKS.slice(0, 3).map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href}`}
                  className={`font-dm text-xs tracking-widest uppercase transition-colors duration-200 hover:text-bronze ${
                    link.key === "soldes" ? "text-promo" : "text-noir"
                  }`}
                >
                  {t(link.key as Parameters<typeof t>[0])}
                </Link>
              ))}
            </nav>

            {/* Logo center */}
            <Link
              href={`/${locale}`}
              className="font-cormorant text-2xl md:text-3xl tracking-[0.3em] text-noir hover:text-bronze transition-colors duration-200 uppercase mx-auto md:mx-0"
            >
              HALO
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Desktop nav right */}
              <nav className="hidden md:flex items-center gap-6 mr-4">
                {NAV_LINKS.slice(3).map((link) => (
                  <Link
                    key={link.key}
                    href={`/${locale}${link.href}`}
                    className={`font-dm text-xs tracking-widest uppercase transition-colors duration-200 hover:text-bronze ${
                      link.key === "soldes" ? "text-promo font-medium" : "text-noir"
                    }`}
                  >
                    {t(link.key as Parameters<typeof t>[0])}
                  </Link>
                ))}
              </nav>

              {/* Language switcher */}
              <Link
                href={`/${otherLocale}`}
                className="p-2 text-noir hover:text-bronze transition-colors cursor-pointer flex items-center gap-1"
                aria-label="Changer de langue"
              >
                <Globe size={18} />
                <span className="font-dm text-xs uppercase hidden sm:block">
                  {otherLocale}
                </span>
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="p-2 text-noir hover:text-bronze transition-colors cursor-pointer relative"
                aria-label={t("panier")}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-bronze text-white text-[10px] font-dm w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop sub-nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 pb-3 -mt-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={`sub-${link.key}`}
                href={`/${locale}${link.href}`}
                className={`font-dm text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-bronze ${
                  link.key === "soldes" ? "text-promo" : "text-grege"
                }`}
              >
                {t(link.key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-noir/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-50 w-4/5 max-w-sm bg-white shadow-warm-lg md:hidden animate-slide-in-right flex flex-col pt-20 pb-8 px-8">
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`mobile-${link.key}`}
                  href={`/${locale}${link.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={`font-cormorant text-2xl transition-colors duration-200 hover:text-bronze ${
                    link.key === "soldes" ? "text-promo" : "text-noir"
                  }`}
                >
                  {t(link.key as Parameters<typeof t>[0])}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-8 border-t border-beige">
              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-2 text-grege hover:text-bronze transition-colors font-dm text-sm uppercase tracking-widest"
              >
                <Globe size={16} />
                {otherLocale === "fr" ? "Français" : "English"}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
