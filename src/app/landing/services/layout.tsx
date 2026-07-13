import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Services — Sistema para Prestadores de Serviços",
  description: "Propostas, contratos, timesheet, CRM e faturamento. Plataforma para consultorias, agências e prestadores de serviços.",
  openGraph: {
    title: "Hachi Services — Sistema para Prestadores de Serviços",
    description: "Propostas, timesheet e CRM para serviços profissionais.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/services",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Services" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
