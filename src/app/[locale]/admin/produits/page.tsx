import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";

interface ProductRow {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  base_price: number;
  sale_price?: number | null;
  is_on_sale: boolean;
  sale_percentage?: number | null;
  is_active: boolean;
  images?: { url: string; is_cover: boolean }[];
  category?: { name_fr: string };
}

export const metadata: Metadata = { title: "Admin — Produits" };

export default async function AdminProductsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, images:product_images(*), category:categories(name_fr)")
    .order("created_at", { ascending: false });

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cormorant text-3xl text-noir">Produits</h1>
        <Link
          href={`/${locale}/admin/produits/new`}
          className="btn-primary text-sm px-4 py-2.5 inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Ajouter</span>
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-3xl shadow-warm p-10 text-center">
          <p className="font-dm text-grege mb-4">Aucun produit</p>
          <Link href={`/${locale}/admin/produits/new`} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <Plus size={16} />
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {(products as ProductRow[]).map((p) => {
              const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0];
              return (
                <div key={p.id} className="bg-white rounded-2xl shadow-warm p-4 flex items-center gap-4">
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-beige flex-shrink-0">
                    {cover ? (
                      <Image src={cover.url} alt={p.name_fr} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-cormorant text-grege text-xs">H</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-dm font-medium text-noir text-sm truncate">{p.name_fr}</p>
                    <p className="font-dm text-xs text-grege truncate">{p.category?.name_fr ?? "—"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-dm text-sm text-bronze">{p.base_price.toFixed(3)} DT</p>
                      {p.is_on_sale && p.sale_percentage && (
                        <span className="text-xs text-promo font-dm">-{p.sale_percentage}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-dm ${
                      p.is_active ? "bg-green-100 text-green-700" : "bg-beige text-grege"
                    }`}>
                      {p.is_active ? "Actif" : "Archivé"}
                    </span>
                    <Link
                      href={`/${locale}/admin/produits/${p.id}/modifier`}
                      className="text-grege hover:text-bronze transition-colors cursor-pointer"
                      aria-label="Modifier"
                    >
                      <Pencil size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-3xl shadow-warm overflow-hidden">
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  {["photo", "Produit", "Catégorie", "Prix", "Promo", "Statut", "actions"].map((h) => (
                    <th key={h} className="text-left py-4 px-4 text-xs text-grege uppercase tracking-widest font-normal">
                      {["photo", "actions"].includes(h) ? "" : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(products as ProductRow[]).map((p) => {
                  const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0];
                  return (
                    <tr key={p.id} className="border-b border-beige/50 hover:bg-background transition-colors">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-beige">
                          {cover ? (
                            <Image src={cover.url} alt={p.name_fr} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-cormorant text-grege text-xs">H</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-noir">{p.name_fr}</p>
                        <p className="text-xs text-grege">{p.slug}</p>
                      </td>
                      <td className="py-3 px-4 text-grege">{p.category?.name_fr ?? "—"}</td>
                      <td className="py-3 px-4">
                        <p className="text-bronze">{p.base_price.toFixed(3)} DT</p>
                        {p.sale_price && (
                          <p className="text-xs text-grege line-through">{p.sale_price.toFixed(3)} DT</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {p.is_on_sale && p.sale_percentage ? (
                          <span className="badge-promo text-xs">-{p.sale_percentage}%</span>
                        ) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          p.is_active ? "bg-green-100 text-green-700" : "bg-beige text-grege"
                        }`}>
                          {p.is_active ? "Actif" : "Archivé"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/${locale}/admin/produits/${p.id}/modifier`}
                          className="text-grege hover:text-bronze transition-colors cursor-pointer"
                          aria-label="Modifier"
                        >
                          <Pencil size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
