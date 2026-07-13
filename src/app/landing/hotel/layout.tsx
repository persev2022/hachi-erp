import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Hotel — Sistema de Gestão Hoteleira (PMS)",
  description: "Reservas, check-in/out, tarifas dinâmicas, housekeeping e channel manager. PMS completo para hotéis e pousadas.",
  openGraph: {
    title: "Hachi Hotel — Sistema de Gestão Hoteleira (PMS)",
    description: "Reservas, tarifas e housekeeping para hotéis e pousadas.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/hotel",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Hotel" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
