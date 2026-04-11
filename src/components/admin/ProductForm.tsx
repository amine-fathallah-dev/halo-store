"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { saveProduct } from "@/app/actions/products";
import ImageUpload, { type UploadedImage } from "./ImageUpload";
import Toast, { type ToastType } from "@/components/ui/Toast";
import type { Category } from "@/types";
import { SIZES, SCARF_SIZES, NO_SIZE_CATEGORY_SLUGS, SCARF_CATEGORY_SLUGS } from "@/types";

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface ProductFormData {
  name_fr: string;
  name_en: string;
  slug: string;
  category_id: string;
  description_fr: string;
  description_en: string;
  description_long_fr: string;
  description_long_en: string;
  base_price: string;
  sale_price: string;
  is_on_sale: boolean;
  is_new: boolean;
  is_active: boolean;
}

interface ProductFormProps {
  categories: Category[];
  locale: string;
  productId?: string;
  initialData?: Partial<ProductFormData>;
  initialVariants?: VariantRow[];
  initialImages?: UploadedImage[];
}

export default function ProductForm({
  categories,
  locale,
  productId,
  initialData,
  initialVariants = [],
  initialImages = [],
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [form, setForm] = useState<ProductFormData>({
    name_fr: "",
    name_en: "",
    slug: "",
    category_id: categories[0]?.id ?? "",
    description_fr: "",
    description_en: "",
    description_long_fr: "",
    description_long_en: "",
    base_price: "",
    sale_price: "",
    is_on_sale: false,
    is_new: true,
    is_active: true,
    ...initialData,
  });

  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants.length > 0
      ? initialVariants
      : [{ size: "M", color: "", stock: 0, sku: "" }]
  );
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name_fr
  useEffect(() => {
    if (!isEditing && form.name_fr) {
      setForm((f) => ({ ...f, slug: slugify(form.name_fr) }));
    }
  }, [form.name_fr, isEditing]);

  // Auto-calculate sale percentage
  const salePercentage =
    form.is_on_sale && form.sale_price && form.base_price
      ? Math.round((1 - parseFloat(form.sale_price) / parseFloat(form.base_price)) * 100)
      : null;

  const update = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: "" }));
    };

  const toggle = (field: keyof ProductFormData) => () =>
    setForm((f) => ({ ...f, [field]: !f[field] }));

  // Detect product type from selected category
  const selectedCategory = categories.find((c) => c.id === form.category_id);
  const isAccessoire = NO_SIZE_CATEGORY_SLUGS.includes(selectedCategory?.slug ?? "");
  const isFoulard = SCARF_CATEGORY_SLUGS.includes(selectedCategory?.slug ?? "");
  const availableSizes = isFoulard ? SCARF_SIZES : SIZES;

  const addVariant = () =>
    setVariants((v) => [...v, { size: isAccessoire ? "Unique" : availableSizes[0], color: "", stock: 0, sku: "" }]);

  const removeVariant = (i: number) =>
    setVariants((v) => v.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, field: keyof VariantRow, value: string | number) =>
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name_fr.trim()) errs.name_fr = "Requis";
    if (!form.name_en.trim()) errs.name_en = "Requis";
    if (!form.slug.trim()) errs.slug = "Requis";
    if (!form.category_id) errs.category_id = "Requis";
    if (!form.base_price || isNaN(parseFloat(form.base_price))) errs.base_price = "Prix invalide";
    if (form.is_on_sale && (!form.sale_price || isNaN(parseFloat(form.sale_price)))) {
      errs.sale_price = "Prix promo requis";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        name_fr: form.name_fr.trim(),
        name_en: form.name_en.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id,
        description_fr: form.description_fr.trim(),
        description_en: form.description_en.trim(),
        description_long_fr: form.description_long_fr.trim(),
        description_long_en: form.description_long_en.trim(),
        base_price: parseFloat(form.base_price),
        sale_price: form.is_on_sale && form.sale_price ? parseFloat(form.sale_price) : null,
        is_on_sale: form.is_on_sale,
        sale_percentage: salePercentage,
        is_new: form.is_new,
        is_active: form.is_active,
      };

      const variantRows = variants.map((v) => ({
        size: v.size,
        color: v.color,
        stock: v.stock,
        sku: v.sku || `${form.slug}-${v.size}-${v.color}`.toLowerCase(),
      }));

      const imgRows = images.map((img, i) => ({
        url: img.url,
        position: i,
        is_cover: img.is_cover,
      }));

      const result = await saveProduct(payload, variantRows, imgRows, productId);
      if (result.error) throw new Error(result.error);

      setToast({
        message: isEditing ? "Produit modifié avec succès !" : "Produit créé avec succès !",
        type: "success",
      });
      setTimeout(() => router.push(`/${locale}/admin/produits`), 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: "Une erreur est survenue. Réessayez.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({
    value,
    onToggle,
    label,
  }: {
    value: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
          value ? "bg-bronze" : "bg-beige"
        }`}
        onClick={onToggle}
        role="switch"
        aria-checked={value}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
      <span className="font-dm text-sm text-noir">{label}</span>
    </label>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* General info */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-6">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Names */}
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Nom FR *
              </label>
              <input
                type="text"
                value={form.name_fr}
                onChange={update("name_fr")}
                className={`input-field ${errors.name_fr ? "border-promo" : ""}`}
                placeholder="Ex: Robe midi florals"
              />
              {errors.name_fr && <p className="text-promo text-xs mt-1 font-dm">{errors.name_fr}</p>}
            </div>
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Nom EN *
              </label>
              <input
                type="text"
                value={form.name_en}
                onChange={update("name_en")}
                className={`input-field ${errors.name_en ? "border-promo" : ""}`}
                placeholder="Ex: Floral midi dress"
              />
              {errors.name_en && <p className="text-promo text-xs mt-1 font-dm">{errors.name_en}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={update("slug")}
                className={`input-field font-mono text-xs ${errors.slug ? "border-promo" : ""}`}
                placeholder="robe-midi-florals"
              />
              {errors.slug && <p className="text-promo text-xs mt-1 font-dm">{errors.slug}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Catégorie *
              </label>
              <select
                value={form.category_id}
                onChange={update("category_id")}
                className={`input-field ${errors.category_id ? "border-promo" : ""}`}
              >
                <option value="">— Choisir —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_fr}
                  </option>
                ))}
              </select>
            </div>

            {/* Descriptions FR */}
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Description courte FR *
              </label>
              <textarea
                value={form.description_fr}
                onChange={update("description_fr")}
                rows={3}
                className="input-field resize-none"
                placeholder="Description courte affichée sur la page produit..."
              />
            </div>
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Description courte EN *
              </label>
              <textarea
                value={form.description_en}
                onChange={update("description_en")}
                rows={3}
                className="input-field resize-none"
                placeholder="Short description displayed on the product page..."
              />
            </div>

            {/* Long descriptions */}
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Description longue FR
              </label>
              <textarea
                value={form.description_long_fr}
                onChange={update("description_long_fr")}
                rows={5}
                className="input-field resize-none"
                placeholder="Composition, matières, entretien..."
              />
            </div>
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Description longue EN
              </label>
              <textarea
                value={form.description_long_en}
                onChange={update("description_long_en")}
                rows={5}
                className="input-field resize-none"
                placeholder="Composition, materials, care..."
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-6">Prix</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Prix de base (DT) *
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.base_price}
                onChange={update("base_price")}
                className={`input-field ${errors.base_price ? "border-promo" : ""}`}
                placeholder="49.900"
              />
              {errors.base_price && <p className="text-promo text-xs mt-1 font-dm">{errors.base_price}</p>}
            </div>

            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Prix promo (DT)
                {salePercentage !== null && (
                  <span className="ml-2 text-promo">— -{salePercentage}%</span>
                )}
              </label>
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.sale_price}
                onChange={update("sale_price")}
                disabled={!form.is_on_sale}
                className={`input-field ${!form.is_on_sale ? "opacity-40" : ""} ${errors.sale_price ? "border-promo" : ""}`}
                placeholder="34.900"
              />
              {errors.sale_price && <p className="text-promo text-xs mt-1 font-dm">{errors.sale_price}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <ToggleSwitch value={form.is_on_sale} onToggle={toggle("is_on_sale")} label="En promotion" />
            <ToggleSwitch value={form.is_new} onToggle={toggle("is_new")} label="Nouveau produit (badge NEW)" />
            <ToggleSwitch value={form.is_active} onToggle={toggle("is_active")} label="Produit actif (visible sur le site)" />
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="font-cormorant text-2xl text-noir">Variantes</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 font-dm text-sm text-bronze hover:text-noir transition-colors cursor-pointer border border-bronze/30 hover:border-bronze px-3 py-2 rounded-xl"
            >
              <Plus size={14} />
              <span>Ajouter une variante</span>
            </button>
          </div>

          {/* Type indicator */}
          {(isAccessoire || isFoulard) && (
            <div className="mb-4 px-3 py-2 bg-bronze/10 rounded-xl font-dm text-xs text-bronze">
              {isAccessoire ? "Accessoire — pas de taille, une variante par couleur" : "Foulard — tailles en dimensions"}
            </div>
          )}

          <div className="space-y-3">
            {/* Desktop header */}
            <div className={`hidden md:grid gap-3 ${isAccessoire ? "grid-cols-[1fr_80px_1fr_40px]" : "grid-cols-[120px_1fr_80px_1fr_40px]"}`}>
              {(isAccessoire ? ["Couleur", "Stock", "SKU", ""] : ["Taille", "Couleur", "Stock", "SKU", ""]).map((h) => (
                <p key={h} className="font-dm text-xs uppercase tracking-widest text-grege">{h}</p>
              ))}
            </div>

            {variants.map((v, i) => (
              <div key={i} className="bg-background rounded-2xl p-3">
                {/* Mobile layout */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-dm text-xs text-grege uppercase tracking-widest">
                      Variante {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      disabled={variants.length === 1}
                      className="text-grege hover:text-promo transition-colors cursor-pointer disabled:opacity-30 p-1"
                      aria-label="Supprimer la variante"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {!isAccessoire && (
                      <div>
                        <label className="block font-dm text-xs text-grege mb-1">Taille</label>
                        <select
                          value={v.size}
                          onChange={(e) => updateVariant(i, "size", e.target.value)}
                          className="input-field py-2 text-sm"
                        >
                          {availableSizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block font-dm text-xs text-grege mb-1">Couleur</label>
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => updateVariant(i, "color", e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="Ex: Noir..."
                      />
                    </div>
                    <div>
                      <label className="block font-dm text-xs text-grege mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                        className="input-field py-2 text-sm"
                      />
                    </div>
                    <div className={isAccessoire ? "" : "col-span-2"}>
                      <label className="block font-dm text-xs text-grege mb-1">SKU</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, "sku", e.target.value)}
                        className="input-field py-2 text-sm font-mono"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop layout */}
                <div className={`hidden md:grid gap-3 items-center ${isAccessoire ? "grid-cols-[1fr_80px_1fr_40px]" : "grid-cols-[120px_1fr_80px_1fr_40px]"}`}>
                  {!isAccessoire && (
                    <select
                      value={v.size}
                      onChange={(e) => updateVariant(i, "size", e.target.value)}
                      className="input-field py-2 text-sm"
                      aria-label="Taille"
                    >
                      {availableSizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => updateVariant(i, "color", e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="Ex: Noir, Blanc..."
                    aria-label="Couleur"
                  />
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                    className="input-field py-2 text-sm"
                    aria-label="Stock"
                  />
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="input-field py-2 text-sm font-mono"
                    placeholder="Auto"
                    aria-label="SKU"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={variants.length === 1}
                    className="text-grege hover:text-promo transition-colors cursor-pointer disabled:opacity-30 p-2 flex items-center justify-center"
                    aria-label="Supprimer la variante"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-2">Images</h2>
          <p className="font-dm text-xs text-grege mb-6">
            La première image sera utilisée comme couverture. Survolez une image pour la réorganiser.
          </p>
          <ImageUpload images={images} onChange={setImages} folder="products" />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? "Enregistrement..."
              : isEditing
              ? "Enregistrer les modifications"
              : "Créer le produit"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost"
          >
            Annuler
          </button>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
