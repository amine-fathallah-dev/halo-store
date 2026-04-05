import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "@/components/shop/ProductDetail";
import type { Product } from "@/types";

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name_fr, name_en, description_fr, description_en")
    .eq("slug", slug)
    .single();

  if (!data) return {};

  const name = locale === "fr" ? data.name_fr : data.name_en;
  const description = locale === "fr" ? data.description_fr : data.description_en;

  return {
    title: name,
    description,
  };
}

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  // Similar products
  const { data: similar } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("category_id", product.category_id)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  return (
    <ProductDetail
      product={product as Product}
      similar={(similar as Product[]) ?? []}
      locale={locale}
    />
  );
}
