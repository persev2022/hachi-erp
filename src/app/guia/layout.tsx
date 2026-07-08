import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guia Hachi Platform — Marquinhos",
  description: "Guia completo da Hachi Platform para CS, Onboarding, Suporte e Apresentações",
};

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
