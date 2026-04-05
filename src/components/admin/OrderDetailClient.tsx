"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem, OrderStatus, OrderStatusHistory } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";

const STATUS_FLOW: OrderStatus[] = [
  "en_attente", "confirmee", "en_preparation", "expediee", "livree",
];

interface OrderDetailClientProps {
  order: Order & { items?: OrderItem[]; status_history?: OrderStatusHistory[] };
  locale: string;
}

export default function OrderDetailClient({ order, locale }: OrderDetailClientProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.admin_notes ?? "");
  const [saving, setSaving] = useState(false);

  const currentIndex = STATUS_FLOW.indexOf(status);

  const updateStatus = async (newStatus: OrderStatus) => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: newStatus,
      changed_by: "admin",
    });
    setStatus(newStatus);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", order.id);
    setSaving(false);
  };

  return (
    <div className="pt-6">
      <Link
        href={`/${locale}/admin/commandes`}
        className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        Commandes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cormorant text-3xl text-noir">
            Commande #{order.order_number}
          </h1>
          <p className="font-dm text-xs text-grege mt-1">
            {new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status timeline */}
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-6">
              Statut de la commande
            </p>
            <div className="flex items-center gap-0 mb-6">
              {STATUS_FLOW.map((s, i) => {
                const isDone = STATUS_FLOW.indexOf(status) >= i;
                return (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone ? "bg-bronze border-bronze" : "bg-white border-beige"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isDone ? "bg-white" : "bg-beige"}`} />
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-px ${isDone && i < currentIndex ? "bg-bronze" : "bg-beige"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              {STATUS_FLOW.map((s) => (
                <p key={s} className={`font-dm text-[10px] text-center flex-1 ${status === s ? "text-bronze font-medium" : "text-grege"}`}>
                  {ORDER_STATUS_LABELS[s]}
                </p>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap mt-6">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={s === status || saving}
                  className={`px-3 py-1.5 font-dm text-xs rounded-full border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    s === status
                      ? "bg-bronze text-white border-bronze"
                      : "border-beige text-noir hover:border-bronze"
                  }`}
                >
                  {ORDER_STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => updateStatus("annulee")}
                disabled={status === "annulee" || saving}
                className="px-3 py-1.5 font-dm text-xs rounded-full border border-promo/30 text-promo hover:bg-promo hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">Articles</p>
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  <th className="text-left py-2 text-xs text-grege font-normal uppercase tracking-widest">Produit</th>
                  <th className="text-center py-2 text-xs text-grege font-normal uppercase tracking-widest">Taille</th>
                  <th className="text-center py-2 text-xs text-grege font-normal uppercase tracking-widest">Qté</th>
                  <th className="text-right py-2 text-xs text-grege font-normal uppercase tracking-widest">Prix</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="border-b border-beige/50">
                    <td className="py-3">
                      <p className="font-cormorant text-base">{item.product_name}</p>
                      <p className="text-xs text-grege">{item.color}</p>
                    </td>
                    <td className="py-3 text-center">{item.size}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right text-bronze">
                      {(item.unit_price * item.quantity).toFixed(3)} DT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pt-4 border-t border-beige space-y-1">
              <div className="flex justify-between font-dm text-sm">
                <span className="text-grege">Sous-total</span>
                <span>{order.subtotal.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between font-dm text-sm">
                <span className="text-grege">Livraison</span>
                <span>{order.shipping_fee.toFixed(3)} DT</span>
              </div>
              <div className="flex justify-between font-cormorant text-xl pt-2">
                <span>Total</span>
                <span className="text-bronze">{order.total.toFixed(3)} DT</span>
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-3">Notes internes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[100px] resize-none"
              placeholder="Notes visibles uniquement par l'admin..."
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="btn-secondary mt-3 text-sm px-5 py-2"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">Client</p>
            <div className="space-y-2 font-dm text-sm">
              <p className="font-medium text-noir">{order.customer_name}</p>
              <p className="text-grege">{order.customer_phone}</p>
              <p className="text-grege">{order.customer_email}</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">Livraison</p>
            <div className="space-y-1 font-dm text-sm">
              <p className="text-noir">{order.address_full}</p>
              <p className="text-grege">{order.city}, {order.governorate}</p>
              {order.postal_code && <p className="text-grege">{order.postal_code}</p>}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-warm">
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">Historique</p>
            <ul className="space-y-2">
              {order.status_history?.map((h) => (
                <li key={h.id} className="flex items-start gap-2 font-dm text-xs">
                  <span className="text-bronze">{ORDER_STATUS_LABELS[h.status]}</span>
                  <span className="text-grege ml-auto">
                    {new Date(h.changed_at).toLocaleDateString("fr-FR")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
