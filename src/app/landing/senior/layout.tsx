import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Senior — Sistema para ILPIs e Casas de Repouso",
  description: "Controle de medicação, prontuário geriátrico, gestão de residentes e comunicação com famílias. Software para instituições de longa permanência.",
  openGraph: {
    title: "Hachi Senior — Sistema para ILPIs e Casas de Repouso",
    description: "Medicação, prontuário geriátrico e gestão de residentes.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing/senior",
    siteName: "Hachi Platform",
    images: [{ url: "https://hachi-erp.vercel.app/images/hachi-logo.png", width: 512, height: 512, alt: "Hachi Senior" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
