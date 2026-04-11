import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const revalidate = 3600;
import HeroSection from "@/components/layout/HeroSection";
import PromoSection from "@/components/layout/PromoSection";
import NewArrivalsSection from "@/components/layout/NewArrivalsSection";
import CategoriesSection from "@/components/layout/CategoriesSection";
import LookbookSection from "@/components/layout/LookbookSection";
import { getPromoProducts, getNewProducts, getCategories } from "@/lib/queries";
import type { Product, Category } from "@/types";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title: `HALO — ${t("subtitle")}`,
    description: t("subtitle"),
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [promoProducts, newProducts, categories] = await Promise.all([
    getPromoProducts(),
    getNewProducts(),
    getCategories(),
  ]);

  return (
    <div>
      <HeroSection locale={locale} />
      <PromoSection products={promoProducts as Product[]} locale={locale} />
      <NewArrivalsSection products={newProducts as Product[]} locale={locale} />
      <CategoriesSection categories={categories as Category[]} locale={locale} />
      <LookbookSection locale={locale} />
    </div>
  );
}
