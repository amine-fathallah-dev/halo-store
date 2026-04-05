"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    changed_by: "admin",
  });

  return { error: null };
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: notes })
    .eq("id", orderId);

  if (error) return { error: error.message };
  return { error: null };
}
