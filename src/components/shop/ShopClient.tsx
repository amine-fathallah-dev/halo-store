"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product, Category } from "@/types";
import { SIZES } from "@/types";

interface ShopClientProps {
  products: Product[];
  categories: Category[];
  locale: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

type SortOption = "newest" | "price_asc" | "price_desc" | "best_sellers";

const COLORS = [
  { name: "Noir", value: "noir", hex: "#1A1A18" },
  { name: "Blanc", value: "blanc", hex: "#FFFFFF" },
  { name: "Beige", value: "beige", hex: "#E8DFD0" },
  { name: "Bronze", value: "bronze", hex: "#A07850" },
  { name: "Rouge", value: "rouge", hex: "#8B2E2E" },
  { name: "Bleu", value: "bleu", hex: "#2D4A7A" },
  { name: "Vert", value: "vert", hex: "#4A6741" },
  { name: "Rose", value: "rose", hex: "#D4A5A5" },
];

export default function ShopClient({ products, categories, locale, searchParams }: ShopClientProps) {
  const t = useTranslations("filters");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    (searchParams.category as string) || "all"
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [promoOnly, setPromoOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category?.slug === selectedCategory);
    }
    if (promoOnly) {
      result = result.filter((p) => p.is_on_sale);
    }
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) => selectedSizes.includes(v.size) && v.stock > 0)
      );
    }
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) =>
          selectedColors.some((c) => v.color.toLowerCase().includes(c))
        )
      );
    }
    result = result.filter((p) => {
      const price = p.is_on_sale && p.sale_price ? p.sale_price : p.base_price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          const pa = a.is_on_sale && a.sale_price ? a.sale_price : a.base_price;
          const pb = b.is_on_sale && b.sale_price ? b.sale_price : b.base_price;
          return pa - pb;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const pa = a.is_on_sale && a.sale_price ? a.sale_price : a.base_price;
          const pb = b.is_on_sale && b.sale_price ? b.sale_price : b.base_price;
          return pb - pa;
        });
        break;
      default:
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [products, selectedCategory, promoOnly, selectedSizes, selectedColors, priceRange, sortBy]);

  const toggleSize = (size: string) =>
    setSelectedSizes((s) => (s.includes(size) ? s.filter((x) => x !== size) : [...s, size]));

  const toggleColor = (color: string) =>
    setSelectedColors((c) => (c.includes(color) ? c.filter((x) => x !== color) : [...c, color]));

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 500]);
    setPromoOnly(false);
    setSortBy("newest");
  };

  const hasFilters =
    selectedCategory !== "all" ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    promoOnly;

  const FiltersPanel = () => (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">
          {t("category")}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`w-full text-left font-dm text-sm py-1.5 transition-colors cursor-pointer ${
              selectedCategory === "all" ? "text-bronze font-medium" : "text-noir hover:text-bronze"
            }`}
          >
            {t("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left font-dm text-sm py-1.5 transition-colors cursor-pointer ${
                selectedCategory === cat.slug ? "text-bronze font-medium" : "text-noir hover:text-bronze"
              }`}
            >
              {locale === "fr" ? cat.name_fr : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">{t("size")}</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-12 h-10 font-dm text-xs border rounded-xl transition-all cursor-pointer ${
                selectedSizes.includes(size)
                  ? "bg-bronze text-white border-bronze"
                  : "border-beige text-noir hover:border-bronze"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">{t("color")}</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => toggleColor(color.value)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                selectedColors.includes(color.value)
                  ? "border-bronze scale-110"
                  : "border-transparent hover:border-grege"
              } ${color.value === "blanc" ? "border-beige" : ""}`}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="font-dm text-xs tracking-widest uppercase text-grege mb-4">{t("price")}</p>
        <input
          type="range"
          min={0}
          max={500}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full"
          aria-label="Prix maximum"
        />
        <div className="flex justify-between font-dm text-xs text-grege mt-2">
          <span>0 DT</span>
          <span className="text-bronze">{priceRange[1]} DT</span>
        </div>
      </div>

      {/* Promo toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
            promoOnly ? "bg-bronze" : "bg-beige"
          }`}
          onClick={() => setPromoOnly((p) => !p)}
          role="switch"
          aria-checked={promoOnly}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              promoOnly ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </div>
        <span className="font-dm text-sm text-noir">{t("promoOnly")}</span>
      </label>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full btn-ghost text-promo hover:text-promo justify-center border border-promo/20 rounded-xl py-2"
        >
          <X size={14} />
          {t("clearFilters")}
        </button>
      )}
    </div>
  );

  return (
    <div className="pt-32 md:pt-40 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">
              {locale === "fr" ? "Boutique" : "Shop"}
            </h1>
            <p className="font-dm text-sm text-grege mt-1">
              {filtered.length} {t("results")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input-field w-auto text-xs py-2 px-3 min-h-0 rounded-xl"
              aria-label={t("sortBy")}
            >
              <option value="newest">{t("newest")}</option>
              <option value="price_asc">{t("priceLow")}</option>
              <option value="price_desc">{t("priceHigh")}</option>
            </select>

            {/* Filters toggle (mobile) */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="md:hidden flex items-center gap-2 border border-beige rounded-xl px-3 py-2 font-dm text-sm cursor-pointer hover:border-bronze transition-colors relative"
            >
              <SlidersHorizontal size={16} />
              {t("title")}
              {hasFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-bronze rounded-full" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop filters sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-warm sticky top-28">
              <p className="font-cormorant text-xl text-noir mb-6">{t("title")}</p>
              <FiltersPanel />
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-cormorant text-3xl text-noir mb-3">
                  {locale === "fr" ? "Aucun produit trouvé" : "No products found"}
                </p>
                <button onClick={clearFilters} className="btn-secondary mt-4">
                  {t("clearFilters")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-noir/40 md:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto md:hidden animate-slide-in-bottom">
            <div className="flex items-center justify-between mb-6">
              <p className="font-cormorant text-2xl">{t("title")}</p>
              <button onClick={() => setFiltersOpen(false)} className="p-2 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <FiltersPanel />
            <button
              className="btn-primary w-full mt-6"
              onClick={() => setFiltersOpen(false)}
            >
              {locale === "fr" ? `Voir ${filtered.length} résultat(s)` : `See ${filtered.length} result(s)`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
