import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";

interface PromoSectionProps {
  products: Product[];
  locale: string;
}

export default async function PromoSection({ products, locale }: PromoSectionProps) {
  const t = await getTranslations({ locale, namespace: "sections" });

  if (products.length === 0) return null;

  return (
    <section className="bg-beige py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-subtitle mb-3">Soldes</p>
            <h2 className="section-title">{t("promotions")}</h2>
          </div>
          <Link
            href={`/${locale}/soldes`}
            className="hidden md:flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-bronze hover:text-noir transition-colors cursor-pointer"
          >
            {t("promotionsLink")}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href={`/${locale}/soldes`} className="btn-secondary inline-flex">
            {t("promotionsLink")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
