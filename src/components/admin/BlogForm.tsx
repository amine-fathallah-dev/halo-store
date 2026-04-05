"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { slugify } from "@/lib/utils";
import { saveBlogPost } from "@/app/actions/blog";
import Toast, { type ToastType } from "@/components/ui/Toast";
import ImageUpload, { type UploadedImage } from "./ImageUpload";

// Dynamic import to avoid SSR issues with TipTap
const RichEditor = dynamic(() => import("./RichEditor"), { ssr: false, loading: () => (
  <div className="border border-beige rounded-2xl h-[400px] bg-background animate-pulse" />
)});

interface BlogFormData {
  title_fr: string;
  title_en: string;
  slug: string;
  content_fr: string;
  content_en: string;
  is_published: boolean;
  published_at: string;
}

interface BlogFormProps {
  locale: string;
  postId?: string;
  initialData?: Partial<BlogFormData>;
  initialCover?: UploadedImage | null;
}

export default function BlogForm({ locale, postId, initialData, initialCover }: BlogFormProps) {
  const router = useRouter();
  const isEditing = !!postId;
  const [activeTab, setActiveTab] = useState<"fr" | "en">("fr");

  const [form, setForm] = useState<BlogFormData>({
    title_fr: "",
    title_en: "",
    slug: "",
    content_fr: "",
    content_en: "",
    is_published: false,
    published_at: new Date().toISOString().slice(0, 16),
    ...initialData,
  });

  const [cover, setCover] = useState<UploadedImage[]>(initialCover ? [initialCover] : []);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto slug from title FR
  useEffect(() => {
    if (!isEditing && form.title_fr) {
      setForm((f) => ({ ...f, slug: slugify(form.title_fr) }));
    }
  }, [form.title_fr, isEditing]);

  const update = (field: keyof BlogFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: "" }));
    };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title_fr.trim()) errs.title_fr = "Requis";
    if (!form.title_en.trim()) errs.title_en = "Requis";
    if (!form.slug.trim()) errs.slug = "Requis";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        title_fr: form.title_fr.trim(),
        title_en: form.title_en.trim(),
        slug: form.slug.trim(),
        content_fr: form.content_fr,
        content_en: form.content_en,
        cover_image_url: cover[0]?.url ?? null,
        is_published: form.is_published,
        published_at: form.is_published ? form.published_at || new Date().toISOString() : null,
      };

      const result = await saveBlogPost(payload, postId);
      if (result.error) throw new Error(result.error);

      setToast({
        message: isEditing ? "Article modifié !" : "Article créé !",
        type: "success",
      });
      setTimeout(() => router.push(`/${locale}/admin/blog`), 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: "Une erreur est survenue.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Titles + slug */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-6">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Titre FR *
              </label>
              <input
                type="text"
                value={form.title_fr}
                onChange={update("title_fr")}
                className={`input-field ${errors.title_fr ? "border-promo" : ""}`}
                placeholder="Ex: Les tendances du printemps 2025"
              />
              {errors.title_fr && <p className="text-promo text-xs mt-1 font-dm">{errors.title_fr}</p>}
            </div>
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Titre EN *
              </label>
              <input
                type="text"
                value={form.title_en}
                onChange={update("title_en")}
                className={`input-field ${errors.title_en ? "border-promo" : ""}`}
                placeholder="Ex: Spring 2025 Trends"
              />
              {errors.title_en && <p className="text-promo text-xs mt-1 font-dm">{errors.title_en}</p>}
            </div>
            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={update("slug")}
                className={`input-field font-mono text-xs ${errors.slug ? "border-promo" : ""}`}
                placeholder="tendances-printemps-2025"
              />
              {errors.slug && <p className="text-promo text-xs mt-1 font-dm">{errors.slug}</p>}
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-2">Image de couverture</h2>
          <p className="font-dm text-xs text-grege mb-6">Une seule image, format paysage recommandé (16:9)</p>
          <ImageUpload
            images={cover}
            onChange={(imgs) => setCover(imgs.slice(0, 1))}
            folder="blog"
          />
        </div>

        {/* Content editor FR/EN tabs */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cormorant text-2xl text-noir">Contenu</h2>
            <div className="flex border border-beige rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab("fr")}
                className={`px-4 py-2 font-dm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === "fr" ? "bg-bronze text-white" : "text-grege hover:text-noir"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`px-4 py-2 font-dm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                  activeTab === "en" ? "bg-bronze text-white" : "text-grege hover:text-noir"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {activeTab === "fr" ? (
            <RichEditor
              key="content-fr"
              value={form.content_fr}
              onChange={(html) => setForm((f) => ({ ...f, content_fr: html }))}
              placeholder="Contenu en français..."
            />
          ) : (
            <RichEditor
              key="content-en"
              value={form.content_en}
              onChange={(html) => setForm((f) => ({ ...f, content_en: html }))}
              placeholder="Content in English..."
            />
          )}
        </div>

        {/* Publication settings */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-warm">
          <h2 className="font-cormorant text-2xl text-noir mb-6">Publication</h2>
          <div className="flex flex-wrap gap-6 items-start">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
                  form.is_published ? "bg-bronze" : "bg-beige"
                }`}
                onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                role="switch"
                aria-checked={form.is_published}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.is_published ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="font-dm text-sm text-noir">Publié</span>
            </label>

            <div>
              <label className="block font-dm text-xs uppercase tracking-widest text-grege mb-2">
                Date de publication
              </label>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={update("published_at")}
                className="input-field w-auto"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
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
              : "Créer l'article"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-ghost">
            Annuler
          </button>
        </div>
      </form>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
