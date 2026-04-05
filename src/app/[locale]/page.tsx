import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import HeroSection from "@/components/layout/HeroSection";
import PromoSection from "@/components/layout/PromoSection";
import NewArrivalsSection from "@/components/layout/NewArrivalsSection";
import CategoriesSection from "@/components/layout/CategoriesSection";
import LookbookSection from "@/components/layout/LookbookSection";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  // Fetch promo products
  const { data: promoProducts } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_on_sale", true)
    .eq("is_active", true)
    .order("sale_percentage", { ascending: false })
    .limit(4);

  // Fetch new arrivals
  const { data: newProducts } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_new", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8);

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <div>
      <HeroSection locale={locale} />
      <PromoSection products={(promoProducts as Product[]) ?? []} locale={locale} />
      <NewArrivalsSection products={(newProducts as Product[]) ?? []} locale={locale} />
      <CategoriesSection categories={(categories as Category[]) ?? []} locale={locale} />
      <LookbookSection locale={locale} />
    </div>
  );
}
