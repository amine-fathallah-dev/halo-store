import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Eye } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Commandes" };

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: "bg-bronze/10 text-bronze",
  confirmee: "bg-blue-100 text-blue-700",
  en_preparation: "bg-yellow-100 text-yellow-700",
  expediee: "bg-purple-100 text-purple-700",
  livree: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string; page?: string };
}) {
  const supabase = createAdminClient();
  const page = parseInt(searchParams.page ?? "1");
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / perPage);

  const statuses: OrderStatus[] = [
    "en_attente", "confirmee", "en_preparation", "expediee", "livree", "annulee",
  ];

  return (
    <div className="pt-6">
      <h1 className="font-cormorant text-3xl text-noir mb-6">Commandes</h1>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href={`/${locale}/admin/commandes`}
          className={`px-3 py-1.5 font-dm text-xs rounded-full border transition-colors cursor-pointer ${
            !searchParams.status ? "bg-noir text-white border-noir" : "border-beige text-noir hover:border-grege"
          }`}
        >
          Toutes
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/commandes?status=${s}`}
            className={`px-3 py-1.5 font-dm text-xs rounded-full border transition-colors cursor-pointer ${
              searchParams.status === s
                ? "bg-noir text-white border-noir"
                : "border-beige text-noir hover:border-grege"
            }`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-warm overflow-hidden">
        {(!orders || orders.length === 0) ? (
          <div className="p-10 text-center">
            <p className="font-dm text-grege">Aucune commande</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  {["#Commande", "Client", "Téléphone", "Gouvernorat", "Total", "Statut", "Date", ""].map((h) => (
                    <th key={h} className="text-left py-4 px-4 text-xs text-grege uppercase tracking-widest font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders as Order[]).map((order) => (
                  <tr key={order.id} className="border-b border-beige/50 hover:bg-background transition-colors">
                    <td className="py-3 px-4 text-bronze font-medium">#{order.order_number}</td>
                    <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                    <td className="py-3 px-4 text-grege">{order.customer_phone}</td>
                    <td className="py-3 px-4 text-grege">{order.governorate}</td>
                    <td className="py-3 px-4 font-medium">{order.total.toFixed(3)} DT</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status as OrderStatus]}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-grege whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/${locale}/admin/commandes/${order.id}`}
                        className="text-grege hover:text-bronze transition-colors cursor-pointer"
                        aria-label="Voir la commande"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-beige">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/${locale}/admin/commandes?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ""}`}
                className={`w-8 h-8 flex items-center justify-center rounded-full font-dm text-sm transition-colors cursor-pointer ${
                  p === page ? "bg-bronze text-white" : "text-grege hover:text-bronze"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
