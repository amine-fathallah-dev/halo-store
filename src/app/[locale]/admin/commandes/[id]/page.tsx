import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import OrderDetailClient from "@/components/admin/OrderDetailClient";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Commande" };

export default async function OrderDetailPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*), status_history:order_status_history(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return <OrderDetailClient order={order as Order} locale={locale} />;
}
