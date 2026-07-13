import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Restaurant — Sistema para Restaurantes e Food Service",
  description: "PDV, comandas, delivery, controle de estoque e ficha técnica. Sistema completo para restaurantes, bares e food service.",
  openGraph: {
    title: "Hachi Restaurant — Sistema para Restaurantes e Food Service",
    description: "PDV, delivery e gestão completa para restaurantes.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/restaurant",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Restaurant" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
