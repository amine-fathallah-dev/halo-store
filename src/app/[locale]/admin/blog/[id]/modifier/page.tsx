import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BlogForm from "@/components/admin/BlogForm";
import type { UploadedImage } from "@/components/admin/ImageUpload";

export const metadata: Metadata = { title: "Admin — Modifier article" };

export default async function EditBlogPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const initialData = {
    title_fr: post.title_fr,
    title_en: post.title_en,
    slug: post.slug,
    content_fr: post.content_fr ?? "",
    content_en: post.content_en ?? "",
    is_published: post.is_published,
    published_at: post.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  };

  const initialCover: UploadedImage | null = post.cover_image_url
    ? { url: post.cover_image_url, position: 0, is_cover: true }
    : null;

  return (
    <div className="pt-6">
      <Link
        href={`/${locale}/admin/blog`}
        className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        Blog
      </Link>
      <h1 className="font-cormorant text-3xl text-noir mb-8">
        Modifier : {post.title_fr}
      </h1>
      <BlogForm
        locale={locale}
        postId={id}
        initialData={initialData}
        initialCover={initialCover}
      />
    </div>
  );
}
