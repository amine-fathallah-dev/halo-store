import type { Metadata } from "next";
import { getCategories } from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";
import ShopClient from "@/components/shop/ShopClient";
import type { Product, Category } from "@/types";

export const revalidate = 3600;

const getSoldesProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .eq("is_on_sale", true)
      .order("sale_percentage", { ascending: false });
    return data ?? [];
  },
  ["products-soldes"],
  { revalidate: 3600, tags: ["products"] }
);

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
  const [products, categories] = await Promise.all([
    getSoldesProducts(),
    getCategories(),
  ]);

  return (
    <ShopClient
      products={products as Product[]}
      categories={categories as Category[]}
      locale={locale}
      searchParams={{ ...searchParams, promoOnly: "true" }}
    />
  );
}
