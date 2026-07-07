import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Hotel — Gestão Inteligente para Hotelaria",
  description: "Reservas, check-in/out, gestão de UHs, tarifas e portal do hóspede em uma plataforma.",
};

const features = [
  { icon: "🗓️", title: "Motor de Reservas", desc: "Reservas diretas com calendário de disponibilidade" },
  { icon: "🔑", title: "Check-in / Check-out", desc: "Processo ágil com registro digital completo" },
  { icon: "🛏️", title: "Gestão de UHs", desc: "Status, manutenção e housekeeping integrados" },
  { icon: "💰", title: "Tarifas Dinâmicas", desc: "Preços por temporada, tipo de UH e canal" },
  { icon: "📱", title: "Portal do Hóspede", desc: "Autoatendimento, solicitações e avaliações" },
  { icon: "📊", title: "Revenue Management", desc: "Ocupação, RevPAR e indicadores em tempo real" },
];

export default function HotelLandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Hachi<span className="text-purple-600">Hotel</span>
          </span>
          <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Entrar</a>
        </div>
      </header>

      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Gestão Inteligente para Hotéis e Pousadas
          </h1>
          <p className="mt-6 text-lg text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
            Reservas, check-in/out, gestão de UHs, tarifas e portal do hóspede em uma plataforma.
          </p>
          <a href="mailto:contato@hachiplatform.com?subject=Demonstração Hachi Hotel" className="mt-8 inline-block rounded-lg bg-purple-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors">
            Solicitar Demonstração
          </a>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Tudo que seu hotel precisa
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Pronto para modernizar sua hotelaria?
          </h2>
          <p className="mt-3 text-gray-600">Agende uma demonstração gratuita e veja como a Hachi pode transformar sua gestão.</p>
          <a href="mailto:contato@hachiplatform.com?subject=Demonstração Hachi Hotel" className="mt-6 inline-block rounded-lg bg-purple-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-purple-700 transition-colors">
            Solicitar Demonstração
          </a>
        </div>
      </section>

      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Hachi Platform. Todos os direitos reservados.</p>
          <p className="mt-1">Hachi Hotel é um produto da plataforma Hachi.</p>
        </div>
      </footer>
    </main>
  );
}
