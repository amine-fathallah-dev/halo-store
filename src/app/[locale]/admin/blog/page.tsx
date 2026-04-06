import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import type { BlogPost } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Blog" };

export default async function AdminBlogPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createAdminClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cormorant text-3xl text-noir">Blog</h1>
        <Link href={`/${locale}/admin/blog/new`} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
          <Plus size={16} />
          Nouvel article
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-warm overflow-hidden">
        {(!posts || posts.length === 0) ? (
          <div className="p-10 text-center">
            <p className="font-dm text-grege">Aucun article</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  {["Titre", "Slug", "Statut", "Date", ""].map((h) => (
                    <th key={h} className="text-left py-4 px-4 text-xs text-grege uppercase tracking-widest font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(posts as BlogPost[]).map((post) => (
                  <tr key={post.id} className="border-b border-beige/50 hover:bg-background transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-noir">{post.title_fr}</p>
                      <p className="text-xs text-grege">{post.title_en}</p>
                    </td>
                    <td className="py-3 px-4 text-grege">{post.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.is_published ? "bg-green-100 text-green-700" : "bg-beige text-grege"
                      }`}>
                        {post.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-grege">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/${locale}/admin/blog/${post.id}/modifier`}
                        className="text-grege hover:text-bronze transition-colors cursor-pointer"
                      >
                        <Pencil size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
