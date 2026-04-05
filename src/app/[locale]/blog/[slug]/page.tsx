import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import type { BlogPost } from "@/types";

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title_fr, title_en")
    .eq("slug", slug)
    .single();
  const title = data ? (locale === "fr" ? data.title_fr : data.title_en) : slug;
  return { title };
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const p = post as BlogPost;
  const title = locale === "fr" ? p.title_fr : p.title_en;
  const content = locale === "fr" ? p.content_fr : p.content_en;

  return (
    <article className="pt-28 md:pt-36 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-10 cursor-pointer"
        >
          <ChevronLeft size={14} />
          Blog
        </Link>

        {p.cover_image_url && (
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-10 bg-beige">
            <Image
              src={p.cover_image_url}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
        )}

        <header className="mb-10">
          {p.published_at && (
            <p className="font-dm text-xs text-grege tracking-widest uppercase mb-4">
              {new Date(p.published_at).toLocaleDateString(
                locale === "fr" ? "fr-FR" : "en-US",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </p>
          )}
          <h1 className="font-cormorant text-4xl md:text-5xl text-noir font-light leading-tight">
            {title}
          </h1>
        </header>

        {content && (
          <div
            className="prose prose-slate max-w-none font-dm text-sm leading-relaxed text-noir/80
              prose-headings:font-cormorant prose-headings:text-noir prose-headings:font-light
              prose-a:text-bronze prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </article>
  );
}
