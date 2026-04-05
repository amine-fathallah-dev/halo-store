import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/types";

export const metadata: Metadata = { title: "Admin — Nouveau produit" };

export default async function NewProductPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <div className="pt-6">
      <Link
        href={`/${locale}/admin/produits`}
        className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        Produits
      </Link>
      <h1 className="font-cormorant text-3xl text-noir mb-8">Nouveau produit</h1>
      <ProductForm
        categories={(categories as Category[]) ?? []}
        locale={locale}
      />
    </div>
  );
}
