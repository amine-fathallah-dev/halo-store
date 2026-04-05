import { createAdminClient } from "@/lib/supabase/server";
import { Package, ShoppingCart, Clock } from "lucide-react";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  governorate: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "en_attente"),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Produits actifs", value: totalProducts ?? 0, icon: Package, color: "text-bronze" },
    { label: "Commandes totales", value: totalOrders ?? 0, icon: ShoppingCart, color: "text-bronze" },
    { label: "En attente", value: pendingOrders ?? 0, icon: Clock, color: "text-promo" },
  ];

  return (
    <div className="pt-6">
      <h1 className="font-cormorant text-3xl text-noir mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-warm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-dm text-xs tracking-widest uppercase text-grege">{stat.label}</p>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="font-cormorant text-4xl text-noir">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-3xl p-6 shadow-warm">
        <h2 className="font-cormorant text-2xl text-noir mb-6">Commandes récentes</h2>
        {(!recentOrders || recentOrders.length === 0) ? (
          <p className="font-dm text-sm text-grege">Aucune commande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  {["#", "Client", "Gouvernorat", "Total", "Statut", "Date"].map((h) => (
                    <th key={h} className="text-left py-3 pr-4 text-xs text-grege uppercase tracking-widest font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentOrders as OrderRow[]).map((order) => (
                  <tr key={order.id} className="border-b border-beige/50 hover:bg-background transition-colors">
                    <td className="py-3 pr-4 text-bronze font-medium">#{order.order_number}</td>
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4 text-grege">{order.governorate}</td>
                    <td className="py-3 pr-4">{order.total.toFixed(3)} DT</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "en_attente"
                          ? "bg-bronze/10 text-bronze"
                          : order.status === "livree"
                          ? "bg-green-100 text-green-700"
                          : order.status === "annulee"
                          ? "bg-promo/10 text-promo"
                          : "bg-grege/20 text-grege"
                      }`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-grege">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
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
