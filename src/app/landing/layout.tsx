import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Platform — Business Operating System",
  description:
    "Uma plataforma. Infinitas verticais de negócio. Prontuário, financeiro, agenda, CRM, automação e inteligência em um único sistema multi-tenant.",
  keywords: [
    "Hachi Platform",
    "Business Operating System",
    "ERP Multi-vertical",
    "SaaS",
    "Gestão Empresarial",
    "Multi-tenant",
    "Prontuário Eletrônico",
    "CRM",
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
