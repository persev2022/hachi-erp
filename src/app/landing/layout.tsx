import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Platform — Business Operating System",
  description:
    "Plataforma multi-vertical com prontuário, financeiro, agenda, CRM e automação. 8 verticais, um único sistema. Comece grátis.",
  keywords: [
    "plataforma multi-vertical",
    "sistema de gestão empresarial",
    "SaaS brasileiro",
    "prontuário eletrônico",
    "gestão clínica",
    "software para restaurantes",
    "sistema hoteleiro",
    "gestão escolar",
  ],
  openGraph: {
    title: "Hachi Platform — Business Operating System",
    description: "Uma plataforma. Infinitas verticais de negócio. Prontuário, financeiro, agenda, CRM e automação em um único sistema.",
    locale: "pt_BR",
    type: "website",
    url: "https://hachi-erp.vercel.app/landing",
    siteName: "Hachi Platform",
    images: [
      {
        url: "https://hachi-erp.vercel.app/images/hachi-logo.png",
        width: 512,
        height: 512,
        alt: "Hachi Platform Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hachi Platform — Business Operating System",
    description: "Uma plataforma. Infinitas verticais de negócio.",
    images: ["https://hachi-erp.vercel.app/images/hachi-logo.png"],
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
