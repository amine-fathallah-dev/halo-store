import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BlogForm from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "Admin — Nouvel article" };

export default function NewBlogPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="pt-6">
      <Link
        href={`/${locale}/admin/blog`}
        className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        Blog
      </Link>
      <h1 className="font-cormorant text-3xl text-noir mb-8">Nouvel article</h1>
      <BlogForm locale={locale} />
    </div>
  );
}
