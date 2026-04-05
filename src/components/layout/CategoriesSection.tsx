import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Category } from "@/types";

const CATEGORY_IMAGES: Record<string, string> = {
  robes: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80",
  tops: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
  pantalons: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
  vestes: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80",
  accessoires: "https://images.unsplash.com/photo-1611010344444-5f9e4d86a6d8?w=800&q=80",
};

interface CategoriesSectionProps {
  categories: Category[];
  locale: string;
}

export default async function CategoriesSection({
  categories,
  locale,
}: CategoriesSectionProps) {
  const t = await getTranslations({ locale, namespace: "sections" });

  const cats = categories.length > 0 ? categories : [
    { id: "1", slug: "robes", name_fr: "Robes", name_en: "Dresses", display_order: 1, image_url: "" },
    { id: "2", slug: "tops", name_fr: "Tops & Blouses", name_en: "Tops & Blouses", display_order: 2, image_url: "" },
    { id: "3", slug: "pantalons", name_fr: "Pantalons & Jupes", name_en: "Pants & Skirts", display_order: 3, image_url: "" },
    { id: "4", slug: "vestes", name_fr: "Vestes & Manteaux", name_en: "Jackets & Coats", display_order: 4, image_url: "" },
    { id: "5", slug: "accessoires", name_fr: "Accessoires", name_en: "Accessories", display_order: 5, image_url: "" },
  ];

  const [main, ...rest] = cats;

  return (
    <section className="bg-beige py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Shop</p>
          <h2 className="section-title">{t("categories")}</h2>
        </div>

        {/* Asymmetric layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main large card */}
          <Link
            href={`/${locale}/category/${main.slug}`}
            className="col-span-2 md:col-span-1 md:row-span-2 group cursor-pointer"
          >
            <div className="relative h-[300px] md:h-full min-h-[400px] rounded-3xl overflow-hidden bg-grege">
              <Image
                src={main.image_url || CATEGORY_IMAGES[main.slug] || CATEGORY_IMAGES.robes}
                alt={locale === "fr" ? main.name_fr : main.name_en}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="font-cormorant text-white text-3xl md:text-4xl">
                  {locale === "fr" ? main.name_fr : main.name_en}
                </p>
              </div>
            </div>
          </Link>

          {/* 4 small cards */}
          {rest.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}/category/${cat.slug}`}
              className="group cursor-pointer"
            >
              <div className="relative h-[180px] md:h-[200px] rounded-2xl overflow-hidden bg-grege">
                <Image
                  src={cat.image_url || CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.accessoires}
                  alt={locale === "fr" ? cat.name_fr : cat.name_en}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="font-cormorant text-white text-xl">
                    {locale === "fr" ? cat.name_fr : cat.name_en}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
