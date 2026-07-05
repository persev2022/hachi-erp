import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP Enterprise para Comunidades Terapêuticas | Plataforma Completa de Gestão",
  description:
    "A plataforma mais completa para gestão de comunidades terapêuticas, clínicas de reabilitação e centros terapêuticos. Prontuário eletrônico, gestão financeira, portal da família, LGPD e muito mais.",
  keywords: [
    "ERP Saúde",
    "ERP Comunidade Terapêutica",
    "Prontuário Eletrônico",
    "Sistema para Clínica",
    "LGPD",
    "Portal da Família",
    "ERP Hospitalar",
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
