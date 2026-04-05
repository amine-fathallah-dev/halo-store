"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations("hero");

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80')`,
        }}
        role="img"
        aria-label="Collection HALO"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-noir/20 via-transparent to-noir/60" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="font-dm text-white/70 text-xs tracking-[0.4em] uppercase mb-6 animate-fade-in">
          Nouvelle collection
        </p>
        <h1 className="font-cormorant text-6xl md:text-8xl lg:text-9xl text-white font-light leading-none mb-6 animate-fade-in">
          {t("slogan")}
        </h1>
        <p className="font-dm text-white/80 text-sm md:text-base tracking-wide mb-10 animate-fade-in">
          {t("subtitle")}
        </p>
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white border border-white/30 font-dm text-xs tracking-widest uppercase px-8 py-4 rounded-full hover:bg-white hover:text-noir transition-all duration-300 cursor-pointer"
        >
          {t("cta")}
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-px h-8 bg-white/40" />
      </div>
    </section>
  );
}
