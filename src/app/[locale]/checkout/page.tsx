import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: locale === "fr" ? "Commander" : "Checkout",
  };
}

export default async function CheckoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return <CheckoutClient locale={locale} />;
}
