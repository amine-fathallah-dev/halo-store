import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "hero" });
  return {
    title: {
      default: `HALO — ${t("subtitle")}`,
      template: "%s | HALO",
    },
    description: t("subtitle"),
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdmin = pathname.includes("/admin");

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {!isAdmin && <Header locale={locale} />}
      <main className="min-h-screen">{children}</main>
      {!isAdmin && <Footer locale={locale} />}
      {!isAdmin && <CartDrawer />}
    </NextIntlClientProvider>
  );
}
