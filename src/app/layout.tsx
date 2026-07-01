import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hachi ERP — Gestão Integrada para Clínicas de Reabilitação",
  description:
    "Sistema completo de gestão para clínicas de reabilitação em dependência química. Prontuário eletrônico, financeiro, agendamento e comunicação integrados.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
