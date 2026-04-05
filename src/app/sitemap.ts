import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://halostore.tn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: posts }] = await Promise.all([
    supabase.from("products").select("slug, created_at").eq("is_active", true),
    supabase.from("categories").select("slug"),
    supabase.from("blog_posts").select("slug, published_at").eq("is_published", true),
  ]);

  const locales = ["fr", "en"];
  const staticPaths = ["", "/shop", "/soldes", "/blog"];

  const staticRoutes = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.8,
    }))
  );

  const productRoutes = locales.flatMap((locale) =>
    (products ?? []).map((p) => ({
      url: `${BASE_URL}/${locale}/shop/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const categoryRoutes = locales.flatMap((locale) =>
    (categories ?? []).map((c) => ({
      url: `${BASE_URL}/${locale}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }))
  );

  const blogRoutes = locales.flatMap((locale) =>
    (posts ?? []).map((p) => ({
      url: `${BASE_URL}/${locale}/blog/${p.slug}`,
      lastModified: new Date(p.published_at ?? new Date()),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  );

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
