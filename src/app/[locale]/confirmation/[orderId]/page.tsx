import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Package, MapPin, ShoppingBag } from "lucide-react";
import type { Order, OrderItem } from "@/types";

export const metadata: Metadata = { title: "Commande confirmée" };

export default async function ConfirmationPage({
  params: { locale, orderId },
}: {
  params: { locale: string; orderId: string };
}) {
  const t = await getTranslations({ locale, namespace: "confirmation" });
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const o = order as Order & { items: OrderItem[] };

  return (
    <div className="pt-28 md:pt-36 pb-20 min-h-screen flex items-start justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Success icon */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-bronze/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-bronze" />
          </div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-noir mb-3">
            {t("title")}
          </h1>
          <p className="font-dm text-grege">{t("subtitle")}</p>
        </div>

        {/* Order number */}
        <div className="bg-white rounded-3xl p-6 shadow-warm mb-4 text-center">
          <p className="font-dm text-xs tracking-widest uppercase text-grege mb-2">
            {t("orderNumber")}
          </p>
          <p className="font-cormorant text-3xl text-bronze">#{o.order_number}</p>
        </div>

        {/* Message */}
        <div className="bg-beige rounded-3xl p-6 mb-4 flex gap-3">
          <Package size={20} className="text-bronze flex-shrink-0 mt-0.5" />
          <p className="font-dm text-sm text-noir">{t("message")}</p>
        </div>

        {/* Order items */}
        <div className="bg-white rounded-3xl p-6 shadow-warm mb-4">
          <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">
            {locale === "fr" ? "Articles commandés" : "Ordered items"}
          </p>
          <ul className="space-y-3">
            {o.items?.map((item) => (
              <li key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="font-cormorant text-base text-noir">{item.product_name}</p>
                  <p className="font-dm text-xs text-grege">
                    {item.size} · {item.color} · ×{item.quantity}
                  </p>
                </div>
                <p className="font-dm text-sm text-bronze">
                  {(item.unit_price * item.quantity).toFixed(3)} DT
                </p>
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-beige mt-4 flex justify-between font-cormorant text-xl">
            <span>{locale === "fr" ? "Total" : "Total"}</span>
            <span className="text-bronze">{o.total.toFixed(3)} DT</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-3xl p-6 shadow-warm mb-8 flex gap-3">
          <MapPin size={20} className="text-bronze flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-dm text-xs tracking-widest uppercase text-grege mb-2">
              {locale === "fr" ? "Adresse de livraison" : "Shipping address"}
            </p>
            <p className="font-dm text-sm text-noir font-medium">{o.customer_name}</p>
            <p className="font-dm text-sm text-grege">{o.address_full}</p>
            <p className="font-dm text-sm text-grege">
              {o.city}, {o.governorate}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}/shop`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            {t("backToShop")}
          </Link>
        </div>
      </div>
    </div>
  );
}
