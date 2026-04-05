import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: locale === "fr" ? "Blog" : "Blog",
    description: locale === "fr" ? "Inspirations mode & lifestyle HALO" : "HALO fashion & lifestyle inspirations",
  };
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="pt-28 md:pt-36 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Journal</p>
          <h1 className="section-title">Blog</h1>
        </div>

        {(!posts || posts.length === 0) ? (
          <div className="text-center py-20">
            <p className="font-cormorant text-3xl text-grege">
              {locale === "fr" ? "Articles à venir" : "Articles coming soon"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts as BlogPost[]).map((post) => {
              const title = locale === "fr" ? post.title_fr : post.title_en;
              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group block bg-white rounded-3xl overflow-hidden shadow-warm hover:shadow-warm-md transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-[16/9] bg-beige overflow-hidden">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-cormorant text-grege text-3xl">HALO</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {post.published_at && (
                      <p className="font-dm text-xs text-grege tracking-widest uppercase mb-2">
                        {new Date(post.published_at).toLocaleDateString(
                          locale === "fr" ? "fr-FR" : "en-US",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </p>
                    )}
                    <h2 className="font-cormorant text-2xl text-noir group-hover:text-bronze transition-colors duration-200 leading-tight">
                      {title}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
