import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Clinic — Sistema para Clínicas e Consultórios",
  description: "Agendamento online, prontuário eletrônico, TISS, faturamento e gestão de pacientes. Software completo para clínicas médicas.",
  openGraph: {
    title: "Hachi Clinic — Sistema para Clínicas e Consultórios",
    description: "Prontuário, agendamento, TISS e faturamento para clínicas.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/clinic",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Clinic" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
