"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Minus, Plus, X, ChevronLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import ProductCard from "./ProductCard";
import type { Product, ProductVariant } from "@/types";

interface ProductDetailProps {
  product: Product;
  similar: Product[];
  locale: string;
}

export default function ProductDetail({ product, similar, locale }: ProductDetailProps) {
  const t = useTranslations("product");
  const { addItem } = useCartStore();

  const name = locale === "fr" ? product.name_fr : product.name_en;
  const description = locale === "fr" ? product.description_fr : product.description_en;
  const descriptionLong = locale === "fr" ? product.description_long_fr : product.description_long_en;

  const sortedImages = [...(product.images ?? [])].sort((a, b) => a.position - b.position);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const sizes = [...new Set(product.variants?.map((v) => v.size) ?? [])];
  const colors = [...new Set(product.variants?.map((v) => v.color) ?? [])];

  const getVariant = (): ProductVariant | null => {
    if (!selectedSize) return null;
    return (
      product.variants?.find(
        (v) =>
          v.size === selectedSize &&
          (colors.length <= 1 || v.color === selectedColor)
      ) ?? null
    );
  };

  const selectedVariant = getVariant();
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const isSizeOutOfStock = (size: string) => {
    const variants = product.variants?.filter((v) => v.size === size);
    return variants?.every((v) => v.stock === 0) ?? false;
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const variant = getVariant();
    if (!variant || variant.stock === 0) return;
    addItem(product, variant, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const displayPrice =
    product.is_on_sale && product.sale_price ? product.sale_price : product.base_price;

  return (
    <div className="pt-28 md:pt-36 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-2 font-dm text-xs tracking-widest uppercase text-grege hover:text-bronze transition-colors mb-8 cursor-pointer"
        >
          <ChevronLeft size={14} />
          {locale === "fr" ? "Retour" : "Back"}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-beige">
              {sortedImages[activeImage] ? (
                <Image
                  src={sortedImages[activeImage].url}
                  alt={`${name} - image ${activeImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-cormorant text-grege text-4xl">HALO</span>
                </div>
              )}
              {product.is_on_sale && product.sale_percentage && (
                <div className="absolute top-4 left-4">
                  <span className="badge-promo">-{product.sale_percentage}%</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImage === i ? "border-bronze" : "border-transparent hover:border-grege"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${name} thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            {/* Name & price */}
            <div>
              {product.category && (
                <p className="font-dm text-xs tracking-widest uppercase text-grege mb-2">
                  {locale === "fr"
                    ? product.category.name_fr
                    : product.category.name_en}
                </p>
              )}
              <h1 className="font-cormorant text-4xl md:text-5xl text-noir font-light leading-tight mb-4">
                {name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="font-cormorant text-3xl text-bronze">
                  {displayPrice.toFixed(3)} DT
                </span>
                {product.is_on_sale && product.sale_price && (
                  <span className="font-dm text-lg text-grege line-through">
                    {product.base_price.toFixed(3)} DT
                  </span>
                )}
              </div>
              {description && (
                <p className="font-dm text-sm text-grege leading-relaxed mt-3">
                  {description}
                </p>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-dm text-xs tracking-widest uppercase text-noir">
                    {t("color")}
                    {selectedColor && (
                      <span className="text-grege ml-2 normal-case tracking-normal">
                        — {selectedColor}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 font-dm text-xs border rounded-full transition-all cursor-pointer ${
                        selectedColor === color
                          ? "bg-noir text-white border-noir"
                          : "border-beige text-noir hover:border-grege"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-dm text-xs tracking-widest uppercase text-noir">
                  {t("size")}
                  {selectedSize && (
                    <span className="text-grege ml-2 normal-case tracking-normal">
                      — {selectedSize}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="font-dm text-xs text-bronze underline underline-offset-2 cursor-pointer hover:text-noir transition-colors"
                >
                  {t("sizeGuide")}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const outOfStock = isSizeOutOfStock(size);
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`w-14 h-12 font-dm text-sm border rounded-xl transition-all ${
                        outOfStock
                          ? "border-beige text-grege line-through cursor-not-allowed opacity-50"
                          : selectedSize === size
                          ? "bg-noir text-white border-noir cursor-pointer"
                          : "border-beige text-noir hover:border-bronze cursor-pointer"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {selectedSize && isOutOfStock && (
                <p className="font-dm text-xs text-promo mt-2">{t("outOfStock")}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <p className="font-dm text-xs tracking-widest uppercase text-noir mb-3">
                {t("quantity")}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-beige rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-grege hover:text-noir transition-colors cursor-pointer hover:bg-background"
                    aria-label="Diminuer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 font-dm text-sm w-8 text-center">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(quantity + 1, selectedVariant?.stock ?? 10)
                      )
                    }
                    className="px-4 py-3 text-grege hover:text-noir transition-colors cursor-pointer hover:bg-background"
                    aria-label="Augmenter"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {selectedVariant && selectedVariant.stock > 0 && (
                  <p className="font-dm text-xs text-grege">
                    {selectedVariant.stock} {t("inStock")}
                  </p>
                )}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || isOutOfStock}
              className={`w-full py-4 font-dm text-sm tracking-widest uppercase rounded-full transition-all duration-200 ${
                !selectedSize
                  ? "bg-beige text-grege cursor-not-allowed"
                  : isOutOfStock
                  ? "bg-beige text-grege cursor-not-allowed"
                  : addedToCart
                  ? "bg-noir text-white cursor-pointer"
                  : "bg-bronze text-white hover:bg-noir cursor-pointer"
              }`}
            >
              {!selectedSize
                ? t("selectSize")
                : isOutOfStock
                ? t("outOfStock")
                : addedToCart
                ? (locale === "fr" ? "Ajouté !" : "Added!")
                : t("addToCart")}
            </button>

            {/* Long description */}
            {descriptionLong && (
              <div className="pt-4 border-t border-beige">
                <p className="font-dm text-xs tracking-widest uppercase text-grege mb-3">
                  {t("composition")}
                </p>
                <p className="font-dm text-sm text-noir leading-relaxed">
                  {descriptionLong}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div className="mt-20">
            <h2 className="section-title mb-10 text-center">{t("similar")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size guide modal */}
      {sizeGuideOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-noir/60 backdrop-blur-sm"
            onClick={() => setSizeGuideOpen(false)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-8 w-full max-w-lg shadow-warm-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-cormorant text-2xl">{t("sizeGuide")}</h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="p-2 cursor-pointer text-grege hover:text-noir"
              >
                <X size={20} />
              </button>
            </div>
            <table className="w-full font-dm text-sm">
              <thead>
                <tr className="border-b border-beige">
                  <th className="text-left py-2 text-grege font-normal tracking-widest text-xs uppercase">
                    Taille
                  </th>
                  <th className="text-center py-2 text-grege font-normal tracking-widest text-xs uppercase">
                    Poitrine (cm)
                  </th>
                  <th className="text-center py-2 text-grege font-normal tracking-widest text-xs uppercase">
                    Taille (cm)
                  </th>
                  <th className="text-center py-2 text-grege font-normal tracking-widest text-xs uppercase">
                    Hanches (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "XS", chest: "78-82", waist: "60-64", hips: "86-90" },
                  { size: "S", chest: "82-86", waist: "64-68", hips: "90-94" },
                  { size: "M", chest: "86-90", waist: "68-72", hips: "94-98" },
                  { size: "L", chest: "90-94", waist: "72-76", hips: "98-102" },
                  { size: "XL", chest: "94-100", waist: "76-82", hips: "102-108" },
                  { size: "XXL", chest: "100-108", waist: "82-90", hips: "108-116" },
                ].map((row) => (
                  <tr key={row.size} className="border-b border-beige/50">
                    <td className="py-3 font-medium text-bronze">{row.size}</td>
                    <td className="py-3 text-center">{row.chest}</td>
                    <td className="py-3 text-center">{row.waist}</td>
                    <td className="py-3 text-center">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
