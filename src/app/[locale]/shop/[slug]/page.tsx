import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { getProductBySlug, getSimilarProducts } from "@/lib/queries";
import ProductDetail from "@/components/shop/ProductDetail";
import type { Product } from "@/types";

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);

  const locales = ["fr", "en"];
  return (data ?? []).flatMap((p) =>
    locales.map((locale) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: locale === "fr" ? product.name_fr : product.name_en,
    description: locale === "fr" ? product.description_fr : product.description_en,
  };
}

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const similar = await getSimilarProducts(product.category_id, product.id);

  return (
    <ProductDetail
      product={product as Product}
      similar={similar as Product[]}
      locale={locale}
    />
  );
}
