import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Recovery — Sistema para Comunidades Terapêuticas",
  description: "Prontuário eletrônico, gestão de acolhidos, controle financeiro e comunicação com famílias. Software especializado para CTs e centros de reabilitação.",
  openGraph: {
    title: "Hachi Recovery — Sistema para Comunidades Terapêuticas",
    description: "Prontuário, financeiro, agenda e portal da família em um único sistema.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/recovery",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Recovery" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
