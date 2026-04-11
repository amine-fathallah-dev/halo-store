import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const REVALIDATE = 3600;

export const getProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return data ?? [];
  },
  ["products-all"],
  { revalidate: REVALIDATE, tags: ["products"] }
);

export const getPromoProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("is_on_sale", true)
      .eq("is_active", true)
      .order("sale_percentage", { ascending: false })
      .limit(4);
    return data ?? [];
  },
  ["products-promo"],
  { revalidate: REVALIDATE, tags: ["products"] }
);

export const getNewProducts = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("is_new", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return data ?? [];
  },
  ["products-new"],
  { revalidate: REVALIDATE, tags: ["products"] }
);

export const getCategories = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    return data ?? [];
  },
  ["categories-all"],
  { revalidate: REVALIDATE, tags: ["categories"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data ?? null;
  },
  ["product-by-slug"],
  { revalidate: REVALIDATE, tags: ["products"] }
);

export const getSimilarProducts = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .neq("id", excludeId)
      .limit(4);
    return data ?? [];
  },
  ["products-similar"],
  { revalidate: REVALIDATE, tags: ["products"] }
);
