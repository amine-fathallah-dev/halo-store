import { createAdminClient } from "@/lib/supabase/server";
import { Package, ShoppingCart, Clock, TrendingUp, CheckCircle, Truck, XCircle, Eye } from "lucide-react";
import type { Metadata } from "next";
import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";
import Link from "next/link";

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: "bg-bronze/10 text-bronze",
  confirmee: "bg-blue-100 text-blue-700",
  en_preparation: "bg-yellow-100 text-yellow-700",
  expediee: "bg-purple-100 text-purple-700",
  livree: "bg-green-100 text-green-700",
  annulee: "bg-red-100 text-red-700",
};

export default async function AdminDashboard({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = createAdminClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    { count: totalProducts },
    { data: allOrders },
    { data: recentOrders },
    { count: todayOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("orders").select("id, total, status"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, governorate, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayIso),
  ]);

  const orders = (allOrders ?? []) as { id: string; total: number; status: string }[];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "en_attente").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmee").length;
  const inPreparationOrders = orders.filter((o) => o.status === "en_preparation").length;
  const shippedOrders = orders.filter((o) => o.status === "expediee").length;
  const deliveredOrders = orders.filter((o) => o.status === "livree").length;
  const cancelledOrders = orders.filter((o) => o.status === "annulee").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "annulee")
    .reduce((sum, o) => sum + o.total, 0);
  const deliveredRevenue = orders
    .filter((o) => o.status === "livree")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="pt-6">
      <h1 className="font-cormorant text-3xl text-noir mb-8">Dashboard</h1>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-warm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-dm text-xs tracking-widest uppercase text-grege">Commandes</p>
            <ShoppingCart size={18} className="text-bronze" />
          </div>
          <p className="font-cormorant text-4xl text-noir">{totalOrders}</p>
          <p className="font-dm text-xs text-grege mt-1">{todayOrders ?? 0} aujourd&apos;hui</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-warm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-dm text-xs tracking-widest uppercase text-grege">En attente</p>
            <Clock size={18} className="text-promo" />
          </div>
          <p className="font-cormorant text-4xl text-noir">{pendingOrders}</p>
          <p className="font-dm text-xs text-grege mt-1">{confirmedOrders} confirmées</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-warm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-dm text-xs tracking-widest uppercase text-grege">Produits actifs</p>
            <Package size={18} className="text-bronze" />
          </div>
          <p className="font-cormorant text-4xl text-noir">{totalProducts ?? 0}</p>
          <p className="font-dm text-xs text-grege mt-1">&nbsp;</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-warm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-dm text-xs tracking-widest uppercase text-grege">CA livré</p>
            <TrendingUp size={18} className="text-bronze" />
          </div>
          <p className="font-cormorant text-3xl text-bronze">{deliveredRevenue.toFixed(3)}</p>
          <p className="font-dm text-xs text-grege mt-1">DT confirmés</p>
        </div>
      </div>

      {/* Revenue + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* CA total card */}
        <div className="bg-white rounded-2xl p-5 shadow-warm flex flex-col justify-between">
          <div>
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-1">CA total (hors annulées)</p>
            <p className="font-cormorant text-5xl text-noir mt-2">{totalRevenue.toFixed(3)}</p>
            <p className="font-dm text-sm text-grege">DT</p>
          </div>
          <div className="mt-4 pt-4 border-t border-beige grid grid-cols-2 gap-2">
            <div>
              <p className="font-dm text-xs text-grege">Livrées</p>
              <p className="font-cormorant text-2xl text-green-600">{deliveredOrders}</p>
            </div>
            <div>
              <p className="font-dm text-xs text-grege">Annulées</p>
              <p className="font-cormorant text-2xl text-promo">{cancelledOrders}</p>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-warm">
          <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">Répartition par statut</p>
          <div className="space-y-3">
            {[
              { status: "en_attente" as OrderStatus, count: pendingOrders, icon: Clock },
              { status: "confirmee" as OrderStatus, count: confirmedOrders, icon: CheckCircle },
              { status: "en_preparation" as OrderStatus, count: inPreparationOrders, icon: Package },
              { status: "expediee" as OrderStatus, count: shippedOrders, icon: Truck },
              { status: "livree" as OrderStatus, count: deliveredOrders, icon: CheckCircle },
              { status: "annulee" as OrderStatus, count: cancelledOrders, icon: XCircle },
            ].map(({ status, count, icon: Icon }) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-dm w-32 text-center ${STATUS_COLORS[status]}`}>
                  {ORDER_STATUS_LABELS[status]}
                </span>
                <div className="flex-1 bg-beige rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-bronze rounded-full transition-all"
                    style={{ width: totalOrders > 0 ? `${(count / totalOrders) * 100}%` : "0%" }}
                  />
                </div>
                <span className="font-dm text-sm text-noir w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-3xl shadow-warm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-beige">
          <h2 className="font-cormorant text-2xl text-noir">Commandes récentes</h2>
          <Link
            href={`/${locale}/admin/commandes`}
            className="font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors"
          >
            Voir toutes
          </Link>
        </div>
        {(!recentOrders || recentOrders.length === 0) ? (
          <div className="p-10 text-center">
            <p className="font-dm text-sm text-grege">Aucune commande</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  {["#", "Client", "Gouvernorat", "Total", "Statut", "Date", ""].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs text-grege uppercase tracking-widest font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentOrders as OrderRow[]).map((order) => (
                  <tr key={order.id} className="border-b border-beige/50 hover:bg-background transition-colors">
                    <td className="py-3 px-4 text-bronze font-medium">#{order.order_number}</td>
                    <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                    <td className="py-3 px-4 text-grege">{order.governorate}</td>
                    <td className="py-3 px-4">{order.total.toFixed(3)} DT</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-grege whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/${locale}/admin/commandes/${order.id}`}
                        className="text-grege hover:text-bronze transition-colors"
                        aria-label="Voir"
                      >
                        <Eye size={15} />
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
