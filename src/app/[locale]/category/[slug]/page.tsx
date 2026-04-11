import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/queries";
import ShopClient from "@/components/shop/ShopClient";
import type { Product, Category } from "@/types";

export const revalidate = 3600;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const categories = await getCategories();
  const cat = categories.find((c: Category) => c.slug === slug);
  const name = cat ? (locale === "fr" ? cat.name_fr : cat.name_en) : slug;
  return { title: name };
}

export default async function CategoryPage({
  params: { locale, slug },
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const category = (categories as Category[]).find((c) => c.slug === slug);
  if (!category) notFound();

  const categoryProducts = (products as Product[]).filter(
    (p) => p.category?.id === category.id || (p as Product & { category_id: string }).category_id === category.id
  );

  return (
    <ShopClient
      products={categoryProducts}
      categories={categories as Category[]}
      locale={locale}
      searchParams={{ ...searchParams, category: slug }}
    />
  );
}
