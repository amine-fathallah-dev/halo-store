import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export default async function LookbookSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "sections" });

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-noir min-h-[500px]">
          {/* Image */}
          <div className="relative h-[300px] md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"
              alt="Lookbook HALO"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center px-10 py-12 md:px-16">
            <p className="font-dm text-bronze text-xs tracking-[0.4em] uppercase mb-4">
              {t("lookbook")}
            </p>
            <h2 className="font-cormorant text-4xl md:text-5xl text-white font-light leading-tight mb-6">
              {locale === "fr"
                ? "Chaque pièce raconte une histoire"
                : "Every piece tells a story"}
            </h2>
            <p className="font-dm text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              {locale === "fr"
                ? "Découvrez nos inspirations, nos coulisses et notre vision de la mode contemporaine."
                : "Discover our inspirations, behind-the-scenes and our vision of contemporary fashion."}
            </p>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-bronze font-dm text-xs tracking-widest uppercase hover:gap-3 transition-all duration-200 cursor-pointer"
            >
              {locale === "fr" ? "Lire le blog" : "Read the blog"}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
