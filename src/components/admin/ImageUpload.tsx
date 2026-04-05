"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, GripVertical, Star } from "lucide-react";

export interface UploadedImage {
  url: string;
  position: number;
  is_cover: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  folder?: string;
}

export default function ImageUpload({ images, onChange, folder = "products" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const supabase = createClient();
    const newImages: UploadedImage[] = [...images];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("halo-images")
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (error || !data) continue;

      const { data: { publicUrl } } = supabase.storage
        .from("halo-images")
        .getPublicUrl(data.path);

      newImages.push({
        url: publicUrl,
        position: newImages.length,
        is_cover: newImages.length === 0,
      });
    }

    onChange(newImages);
    setUploading(false);
  }, [images, onChange, folder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const remove = (index: number) => {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, position: i, is_cover: i === 0 }));
    onChange(updated);
  };

  const setCover = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, is_cover: i === index }));
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated.map((img, i) => ({ ...img, position: i, is_cover: i === 0 ? true : false })));
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          dragOver ? "border-bronze bg-bronze/5" : "border-beige hover:border-grege"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-bronze border-t-transparent rounded-full animate-spin" />
            <p className="font-dm text-sm text-grege">Téléchargement...</p>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto text-grege mb-3" />
            <p className="font-dm text-sm text-noir">
              Glissez vos images ici ou <span className="text-bronze underline">cliquez pour parcourir</span>
            </p>
            <p className="font-dm text-xs text-grege mt-1">JPG, PNG, WebP — Max 5MB par image</p>
          </>
        )}
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={img.url}
              className={`relative group rounded-xl overflow-hidden bg-beige border-2 transition-colors ${
                img.is_cover ? "border-bronze" : "border-transparent"
              }`}
            >
              <div className="aspect-[3/4]">
                <Image
                  src={img.url}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </div>

              {/* Cover badge */}
              {img.is_cover && (
                <div className="absolute top-1.5 left-1.5 bg-bronze text-white text-[10px] font-dm px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={8} fill="white" />
                  Couv.
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-noir/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_cover && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    className="bg-bronze text-white p-1.5 rounded-lg cursor-pointer hover:bg-white hover:text-bronze transition-colors"
                    title="Définir comme couverture"
                  >
                    <Star size={12} />
                  </button>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    className="bg-white/20 text-white p-1.5 rounded-lg cursor-pointer hover:bg-white hover:text-noir transition-colors"
                    title="Déplacer avant"
                  >
                    <GripVertical size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="bg-promo text-white p-1.5 rounded-lg cursor-pointer hover:bg-white hover:text-promo transition-colors"
                  title="Supprimer"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
