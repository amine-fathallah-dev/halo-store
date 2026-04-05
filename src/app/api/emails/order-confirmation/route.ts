import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import type { OrderItem } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const itemsHtml = order.items
      ?.map(
        (item: OrderItem) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E8DFD0">${item.product_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E8DFD0;text-align:center">${item.size}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E8DFD0;text-align:center">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E8DFD0;text-align:right;color:#A07850">${(item.unit_price * item.quantity).toFixed(3)} DT</td>
          </tr>`
      )
      .join("");

  const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'DM Sans',system-ui,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-family:Georgia,serif;font-size:36px;letter-spacing:8px;color:#1A1A18;margin:0">HALO</h1>
    </div>
    <div style="background:#fff;border-radius:24px;padding:32px;box-shadow:0 2px 12px rgba(160,120,80,0.08)">
      <h2 style="font-family:Georgia,serif;font-size:28px;color:#1A1A18;font-weight:300;margin:0 0 8px">
        Votre commande est confirmée ✨
      </h2>
      <p style="color:#C5B9A8;font-size:13px;margin:0 0 24px">Merci pour votre confiance, ${order.customer_name} !</p>
      <div style="background:#FAF8F5;border-radius:16px;padding:16px;margin-bottom:24px;text-align:center">
        <p style="font-size:11px;color:#C5B9A8;margin:0 0 4px;text-transform:uppercase;letter-spacing:3px">Numéro de commande</p>
        <p style="font-family:Georgia,serif;font-size:28px;color:#A07850;margin:0">#${order.order_number}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <thead>
          <tr style="border-bottom:2px solid #E8DFD0">
            <th style="padding:8px 12px;text-align:left;font-size:10px;color:#C5B9A8;text-transform:uppercase;letter-spacing:2px;font-weight:normal">Article</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;color:#C5B9A8;text-transform:uppercase;letter-spacing:2px;font-weight:normal">Taille</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;color:#C5B9A8;text-transform:uppercase;letter-spacing:2px;font-weight:normal">Qté</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;color:#C5B9A8;text-transform:uppercase;letter-spacing:2px;font-weight:normal">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="border-top:1px solid #E8DFD0;padding-top:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;color:#C5B9A8">Sous-total</span>
          <span style="font-size:13px">${order.subtotal.toFixed(3)} DT</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span style="font-size:13px;color:#C5B9A8">Livraison</span>
          <span style="font-size:13px">7.000 DT</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="font-family:Georgia,serif;font-size:20px">Total</span>
          <span style="font-family:Georgia,serif;font-size:20px;color:#A07850">${order.total.toFixed(3)} DT</span>
        </div>
      </div>
      <div style="background:#FAF8F5;border-radius:16px;padding:16px;margin-top:24px">
        <p style="font-size:11px;color:#C5B9A8;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px">Adresse de livraison</p>
        <p style="font-size:13px;color:#1A1A18;margin:0">${order.address_full}</p>
        <p style="font-size:13px;color:#C5B9A8;margin:4px 0 0">${order.city}, ${order.governorate}</p>
      </div>
      <div style="background:#E8DFD0;border-radius:16px;padding:16px;margin-top:16px">
        <p style="font-size:13px;color:#1A1A18;margin:0">💛 Notre équipe vous contactera prochainement pour confirmer la livraison.</p>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#C5B9A8;margin-top:24px">© 2024 HALO — Livraison en Tunisie</p>
  </div>
</body>
</html>`;

    const adminHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;padding:20px;background:#FAF8F5">
  <h2 style="color:#A07850">🛍️ Nouvelle commande #${order.order_number}</h2>
  <p><strong>Client:</strong> ${order.customer_name}</p>
  <p><strong>Téléphone:</strong> ${order.customer_phone}</p>
  <p><strong>Email:</strong> ${order.customer_email}</p>
  <p><strong>Adresse:</strong> ${order.address_full}, ${order.city}, ${order.governorate}</p>
  <p><strong>Total:</strong> ${order.total.toFixed(3)} DT</p>
  <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/fr/admin/commandes/${order.id}" style="color:#A07850">→ Voir la commande</a></p>
</body>
</html>`;

    // Send to customer
    if (order.customer_email) {
      await resend.emails.send({
        from: "HALO <commandes@halostore.tn>",
        to: order.customer_email,
        subject: `Votre commande HALO #${order.order_number} est confirmée ✨`,
        html: clientHtml,
      });
    }

    // Send to admin
    if (process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: "HALO <commandes@halostore.tn>",
        to: process.env.ADMIN_EMAIL,
        subject: `🛍️ Nouvelle commande #${order.order_number} — ${order.customer_name}`,
        html: adminHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
