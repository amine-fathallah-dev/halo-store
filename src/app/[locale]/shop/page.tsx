import type { Metadata } from "next";
import { getProducts, getCategories } from "@/lib/queries";
import ShopClient from "@/components/shop/ShopClient";
import type { Product, Category } from "@/types";

export const revalidate = 3600;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: locale === "fr" ? "Boutique" : "Shop",
    description: locale === "fr"
      ? "Découvrez toute la collection HALO"
      : "Discover the full HALO collection",
  };
}

export default async function ShopPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ShopClient
      products={products as Product[]}
      categories={categories as Category[]}
      locale={locale}
      searchParams={searchParams}
    />
  );
}
