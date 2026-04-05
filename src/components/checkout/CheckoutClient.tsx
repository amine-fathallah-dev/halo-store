"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import { SHIPPING_FEE } from "@/types";
import { Banknote, ChevronRight, ShieldCheck } from "lucide-react";

const GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
];

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  address: string;
  postalCode: string;
}

export default function CheckoutClient({ locale }: { locale: string }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const { items, getSubtotal, getTotal, clearCart } = useCartStore();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    governorate: "",
    city: "",
    address: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const total = getTotal();

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.firstName.trim()) newErrors.firstName = t("required");
    if (!form.lastName.trim()) newErrors.lastName = t("required");
    if (!form.phone.trim()) newErrors.phone = t("required");
    if (!form.email.trim() || !form.email.includes("@")) newErrors.email = t("required");
    if (!form.governorate) newErrors.governorate = t("required");
    if (!form.city.trim()) newErrors.city = t("required");
    if (!form.address.trim()) newErrors.address = t("required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const orderNumber = `HAL${Date.now().toString().slice(-8)}`;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          status: "en_attente",
          customer_name: `${form.firstName} ${form.lastName}`,
          customer_phone: form.phone,
          customer_email: form.email,
          address_full: form.address,
          city: form.city,
          governorate: form.governorate,
          postal_code: form.postalCode,
          subtotal,
          shipping_fee: SHIPPING_FEE,
          total,
        })
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        product_name: locale === "fr" ? item.product.name_fr : item.product.name_en,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        unit_price:
          item.product.is_on_sale && item.product.sale_price
            ? item.product.sale_price
            : item.product.base_price,
      }));

      await supabase.from("order_items").insert(orderItems);

      // Insert initial status history
      await supabase.from("order_status_history").insert({
        order_id: order.id,
        status: "en_attente",
        changed_by: "customer",
      });

      // Send confirmation emails
      await fetch("/api/emails/order-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      clearCart();
      router.push(`/${locale}/confirmation/${order.id}`);
    } catch (err) {
      console.error("Order error:", err);
      setLoading(false);
    }
  };

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-20 flex flex-col items-center justify-center min-h-screen px-4">
        <p className="font-cormorant text-3xl text-noir mb-4">
          {locale === "fr" ? "Panier vide" : "Empty cart"}
        </p>
        <a href={`/${locale}/shop`} className="btn-primary mt-4">
          {locale === "fr" ? "Découvrir la collection" : "Discover the collection"}
        </a>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h1 className="section-title mb-10">{t("title")}</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
            {/* Form fields */}
            <div className="space-y-8">
              {/* Personal info */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
                <h2 className="font-cormorant text-2xl text-noir mb-6">{t("personalInfo")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("firstName")} *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={update("firstName")}
                      className={`input-field ${errors.firstName ? "border-promo" : ""}`}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("lastName")} *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={update("lastName")}
                      className={`input-field ${errors.lastName ? "border-promo" : ""}`}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("phone")} *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update("phone")}
                      placeholder="+216 XX XXX XXX"
                      className={`input-field ${errors.phone ? "border-promo" : ""}`}
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("email")} *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      className={`input-field ${errors.email ? "border-promo" : ""}`}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
                <h2 className="font-cormorant text-2xl text-noir mb-6">{t("shippingAddress")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("governorate")} *
                    </label>
                    <select
                      value={form.governorate}
                      onChange={update("governorate")}
                      className={`input-field ${errors.governorate ? "border-promo" : ""}`}
                    >
                      <option value="">— Choisir —</option>
                      {GOVERNORATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {errors.governorate && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.governorate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("city")} *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={update("city")}
                      className={`input-field ${errors.city ? "border-promo" : ""}`}
                      autoComplete="address-level2"
                    />
                    {errors.city && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.city}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("address")} *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={update("address")}
                      className={`input-field ${errors.address ? "border-promo" : ""}`}
                      autoComplete="street-address"
                    />
                    {errors.address && (
                      <p className="text-promo text-xs mt-1 font-dm">{errors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                      {t("postalCode")}
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={update("postalCode")}
                      className="input-field"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
                <h2 className="font-cormorant text-2xl text-noir mb-6">{t("payment")}</h2>
                <div className="flex items-center gap-4 p-4 border-2 border-bronze rounded-2xl bg-bronze/5">
                  <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center flex-shrink-0">
                    <Banknote size={20} className="text-bronze" />
                  </div>
                  <div>
                    <p className="font-dm text-sm text-noir font-medium">{t("cashOnDelivery")}</p>
                    <p className="font-dm text-xs text-grege mt-0.5">{t("cashOnDeliveryDesc")}</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full bg-bronze flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary — sticky */}
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="bg-white rounded-3xl p-6 shadow-warm">
                <h2 className="font-cormorant text-2xl text-noir mb-6">{t("summary")}</h2>

                {/* Items */}
                <ul className="space-y-3 mb-6">
                  {items.map((item) => {
                    const name = locale === "fr" ? item.product.name_fr : item.product.name_en;
                    const cover =
                      item.product.images?.find((i) => i.is_cover) ?? item.product.images?.[0];
                    const price =
                      item.product.is_on_sale && item.product.sale_price
                        ? item.product.sale_price
                        : item.product.base_price;

                    return (
                      <li key={item.variant.id} className="flex gap-3">
                        <div className="relative w-14 h-[74px] rounded-xl overflow-hidden bg-beige flex-shrink-0">
                          {cover && (
                            <Image src={cover.url} alt={name} fill className="object-cover" sizes="56px" />
                          )}
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-bronze text-white text-[10px] rounded-full flex items-center justify-center font-dm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-cormorant text-sm text-noir truncate">{name}</p>
                          <p className="font-dm text-xs text-grege">{item.variant.size} · {item.variant.color}</p>
                          <p className="font-dm text-sm text-bronze mt-1">
                            {(price * item.quantity).toFixed(3)} DT
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2 pt-4 border-t border-beige">
                  <div className="flex justify-between font-dm text-sm">
                    <span className="text-grege">{t("subtotal")}</span>
                    <span>{subtotal.toFixed(3)} DT</span>
                  </div>
                  <div className="flex justify-between font-dm text-sm">
                    <span className="text-grege">{locale === "fr" ? "Livraison" : "Shipping"}</span>
                    <span>{SHIPPING_FEE} DT</span>
                  </div>
                  <div className="flex justify-between font-cormorant text-2xl pt-3 border-t border-beige">
                    <span>{locale === "fr" ? "Total" : "Total"}</span>
                    <span className="text-bronze">{total.toFixed(3)} DT</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? t("processing") : (
                    <>
                      {t("confirmOrder")}
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <ShieldCheck size={14} className="text-grege" />
                  <p className="font-dm text-xs text-grege">
                    {locale === "fr" ? "Commande sécurisée" : "Secure order"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
