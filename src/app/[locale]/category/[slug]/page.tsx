import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ShopClient from "@/components/shop/ShopClient";
import type { Product, Category } from "@/types";

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name_fr, name_en")
    .eq("slug", slug)
    .single();

  const name = data ? (locale === "fr" ? data.name_fr : data.name_en) : slug;
  return { title: name };
}

export default async function CategoryPage({
  params: { locale, slug },
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const [{ data: category }, { data: products }, { data: categories }] = await Promise.all([
    supabase.from("categories").select("*").eq("slug", slug).single(),
    supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .eq("category_id",
        (await supabase.from("categories").select("id").eq("slug", slug).single()).data?.id ?? ""
      )
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  if (!category) notFound();

  return (
    <ShopClient
      products={(products as Product[]) ?? []}
      categories={(categories as Category[]) ?? []}
      locale={locale}
      searchParams={{ ...searchParams, category: slug }}
    />
  );
}
