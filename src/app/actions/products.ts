"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

interface ProductPayload {
  name_fr: string;
  name_en: string;
  slug: string;
  category_id: string;
  description_fr: string;
  description_en: string;
  description_long_fr: string;
  description_long_en: string;
  base_price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number | null;
  is_new: boolean;
  is_active: boolean;
}

interface VariantRow {
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface ImageRow {
  product_id: string;
  url: string;
  position: number;
  is_cover: boolean;
}

export async function saveProduct(
  payload: ProductPayload,
  variants: Omit<VariantRow, "product_id">[],
  images: Omit<ImageRow, "product_id">[],
  productId?: string
) {
  const supabase = createAdminClient();

  let pid = productId;

  if (productId) {
    const { error } = await supabase.from("products").update(payload).eq("id", productId);
    if (error) return { error: error.message };
    await supabase.from("product_variants").delete().eq("product_id", productId);
    await supabase.from("product_images").delete().eq("product_id", productId);
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error || !data) return { error: error?.message ?? "Insert failed" };
    pid = data.id;
  }

  if (variants.length > 0) {
    await supabase.from("product_variants").insert(variants.map((v) => ({ ...v, product_id: pid })));
  }

  if (images.length > 0) {
    await supabase.from("product_images").insert(images.map((img) => ({ ...img, product_id: pid })));
  }

  revalidatePath("/", "layout");

  return { error: null, id: pid };
}
