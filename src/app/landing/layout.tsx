import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Platform — Sistema Operacional para Negócios",
  description:
    "Plataforma multi-vertical com prontuário, financeiro, agenda, CRM e automação. 8 verticais, um único sistema. Comece grátis.",
  keywords: [
    "ERP multi-vertical",
    "sistema de gestão empresarial",
    "SaaS brasileiro",
    "prontuário eletrônico",
    "gestão clínica",
    "software para restaurantes",
    "sistema hoteleiro",
    "gestão escolar",
  ],
  openGraph: {
    title: "Hachi Platform — Sistema Operacional para Negócios",
    description: "Uma plataforma. 8 verticais. Comece em 30 segundos.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Hachi Platform",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "AggregateOffer",
              lowPrice: "299",
              highPrice: "1499",
              priceCurrency: "BRL",
              offerCount: "3",
            },
            description:
              "Sistema operacional para negócios multi-vertical com prontuário, financeiro, agenda, CRM e automação.",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "127",
            },
          }),
        }}
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
