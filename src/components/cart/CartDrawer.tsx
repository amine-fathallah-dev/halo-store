"use client";

import { useCartStore } from "@/store/cart";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SHIPPING_FEE } from "@/types";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal } =
    useCartStore();

  const subtotal = getSubtotal();
  const total = getTotal();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-noir/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed z-50 bg-white shadow-warm-lg transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 md:bottom-auto md:top-0 md:right-0 md:left-auto
          md:h-full md:w-[420px]
          rounded-t-3xl md:rounded-none
          ${isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
          <h2 className="font-cormorant text-2xl text-noir">{t("title")}</h2>
          <button
            onClick={closeCart}
            className="p-2 text-grege hover:text-noir transition-colors cursor-pointer rounded-full hover:bg-beige"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-80px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
              <ShoppingBag size={48} className="text-beige" />
              <p className="font-cormorant text-2xl text-noir">{t("empty")}</p>
              <p className="font-dm text-sm text-grege">{t("emptyDesc")}</p>
              <button onClick={closeCart} className="btn-secondary mt-2">
                {t("continueShopping")}
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <ul className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => {
                  const name =
                    locale === "fr"
                      ? item.product.name_fr
                      : item.product.name_en;
                  const cover =
                    item.product.images?.find((i) => i.is_cover) ??
                    item.product.images?.[0];
                  const price =
                    item.product.is_on_sale && item.product.sale_price
                      ? item.product.sale_price
                      : item.product.base_price;

                  return (
                    <li
                      key={item.variant.id}
                      className="flex gap-3 bg-background rounded-2xl p-3"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-[106px] rounded-xl overflow-hidden bg-beige flex-shrink-0">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-cormorant text-grege text-xs">HALO</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-cormorant text-base text-noir leading-tight mb-1 truncate">
                          {name}
                        </p>
                        <p className="font-dm text-xs text-grege mb-2">
                          {item.variant.size} · {item.variant.color}
                        </p>
                        <p className="font-dm text-sm text-bronze font-medium mb-3">
                          {price.toFixed(3)} DT
                        </p>

                        {/* Qty */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 border border-beige rounded-full px-2 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity - 1)
                              }
                              className="text-grege hover:text-noir cursor-pointer transition-colors"
                              aria-label="Diminuer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-dm text-sm w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.variant.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.variant.stock}
                              className="text-grege hover:text-noir cursor-pointer transition-colors disabled:opacity-30"
                              aria-label="Augmenter"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.variant.id)}
                            className="text-grege hover:text-promo transition-colors cursor-pointer p-1"
                            aria-label={t("remove")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Summary + CTA */}
              <div className="px-6 py-5 border-t border-beige space-y-3">
                <div className="flex justify-between font-dm text-sm">
                  <span className="text-grege">{t("subtotal")}</span>
                  <span className="text-noir">{subtotal.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between font-dm text-sm">
                  <span className="text-grege">{t("shipping")}</span>
                  <span className="text-noir">{SHIPPING_FEE} DT</span>
                </div>
                <div className="flex justify-between font-cormorant text-xl pt-2 border-t border-beige">
                  <span className="text-noir">{t("total")}</span>
                  <span className="text-bronze">{total.toFixed(3)} DT</span>
                </div>

                <Link
                  href={`/${locale}/checkout`}
                  onClick={closeCart}
                  className="btn-primary w-full mt-3"
                >
                  {t("checkout")}
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors text-center py-2 cursor-pointer"
                >
                  {t("continueShopping")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
