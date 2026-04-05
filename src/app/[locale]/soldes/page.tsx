import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ShopClient from "@/components/shop/ShopClient";
import type { Product, Category } from "@/types";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: locale === "fr" ? "Soldes" : "Sale",
    description: locale === "fr" ? "Toutes nos promotions" : "All our promotions",
  };
}

export default async function SoldesPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .eq("is_on_sale", true)
      .order("sale_percentage", { ascending: false }),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  return (
    <ShopClient
      products={(products as Product[]) ?? []}
      categories={(categories as Category[]) ?? []}
      locale={locale}
      searchParams={{ ...searchParams, promoOnly: "true" }}
    />
  );
}
