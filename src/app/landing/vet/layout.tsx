import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Vet — Sistema para Clínicas Veterinárias",
  description: "Prontuário animal, carteira de vacinação, agenda e financeiro. Software completo para clínicas e hospitais veterinários.",
  openGraph: {
    title: "Hachi Vet — Sistema para Clínicas Veterinárias",
    description: "Prontuário animal, vacinas e gestão veterinária.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/vet",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Vet" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
