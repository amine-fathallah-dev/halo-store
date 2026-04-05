import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";

interface NewArrivalsSectionProps {
  products: Product[];
  locale: string;
}

export default async function NewArrivalsSection({
  products,
  locale,
}: NewArrivalsSectionProps) {
  const t = await getTranslations({ locale, namespace: "sections" });

  if (products.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Collection</p>
          <h2 className="section-title">{t("nouveautes")}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/${locale}/shop`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            Voir tout
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
