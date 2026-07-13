import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Education — Sistema para Escolas e Cursos",
  description: "Matrícula, boletim, grade curricular, comunicação com pais e gestão financeira escolar. Plataforma educacional completa.",
  openGraph: {
    title: "Hachi Education — Sistema para Escolas e Cursos",
    description: "Matrícula, boletim e gestão escolar em um sistema.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/education",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Education" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
