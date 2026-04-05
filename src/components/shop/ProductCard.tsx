"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations("product");

  const name = locale === "fr" ? product.name_fr : product.name_en;
  const coverImage = product.images?.find((i) => i.is_cover) ?? product.images?.[0];

  return (
    <Link href={`/${locale}/shop/${product.slug}`} className="group block">
      <div className="product-card">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-beige">
          {coverImage ? (
            <Image
              src={coverImage.url}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-cormorant text-grege text-2xl">HALO</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_on_sale && product.sale_percentage && (
              <span className="badge-promo">-{product.sale_percentage}%</span>
            )}
            {product.is_new && !product.is_on_sale && (
              <span className="badge-new">NEW</span>
            )}
          </div>

          {/* Add to cart overlay */}
          <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/10 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button className="bg-white text-noir font-dm text-xs tracking-widest uppercase px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-bronze hover:text-white transition-colors duration-200 shadow-warm cursor-pointer">
              <ShoppingBag size={14} />
              {t("addToCart")}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="font-cormorant text-lg text-noir leading-tight mb-2 group-hover:text-bronze transition-colors duration-200">
            {name}
          </p>
          <div className="flex items-center gap-2">
            {product.is_on_sale && product.sale_price ? (
              <>
                <span className="font-dm text-bronze font-medium">
                  {product.sale_price.toFixed(3)} DT
                </span>
                <span className="font-dm text-grege text-sm line-through">
                  {product.base_price.toFixed(3)} DT
                </span>
              </>
            ) : (
              <span className="font-dm text-bronze font-medium">
                {product.base_price.toFixed(3)} DT
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
