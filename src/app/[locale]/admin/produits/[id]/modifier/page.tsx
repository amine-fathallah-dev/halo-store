import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/types";
import type { UploadedImage } from "@/components/admin/ImageUpload";

export const metadata: Metadata = { title: "Admin — Modifier produit" };

export default async function EditProductPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*), images:product_images(*)")
      .eq("id", id)
      .single(),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  if (!product) notFound();

  const initialData = {
    name_fr: product.name_fr,
    name_en: product.name_en,
    slug: product.slug,
    category_id: product.category_id,
    description_fr: product.description_fr ?? "",
    description_en: product.description_en ?? "",
    description_long_fr: product.description_long_fr ?? "",
    description_long_en: product.description_long_en ?? "",
    base_price: product.base_price.toString(),
    sale_price: product.sale_price?.toString() ?? "",
    is_on_sale: product.is_on_sale,
    is_new: product.is_new,
    is_active: product.is_active,
  };

  const initialVariants = (product.variants ?? []).map((v: {
    id: string;
    size: string;
    color: string;
    stock: number;
    sku: string;
  }) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stock: v.stock,
    sku: v.sku,
  }));

  const sortedImages = [...(product.images ?? [])].sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );
  const initialImages: UploadedImage[] = sortedImages.map((img: {
    url: string;
    position: number;
    is_cover: boolean;
  }) => ({
    url: img.url,
    position: img.position,
    is_cover: img.is_cover,
  }));

  return (
    <div className="pt-6">
      <Link
        href={`/${locale}/admin/produits`}
        className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        Produits
      </Link>
      <h1 className="font-cormorant text-3xl text-noir mb-8">
        Modifier : {product.name_fr}
      </h1>
      <ProductForm
        categories={(categories as Category[]) ?? []}
        locale={locale}
        productId={id}
        initialData={initialData}
        initialVariants={initialVariants}
        initialImages={initialImages}
      />
    </div>
  );
}
