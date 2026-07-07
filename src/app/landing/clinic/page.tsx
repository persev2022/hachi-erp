import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hachi Clinic — Gestão Inteligente para Clínicas",
  description: "Prontuário eletrônico, agenda de profissionais, financeiro e comunicação em uma plataforma.",
};

const features = [
  { icon: "📋", title: "Prontuário Clínico", desc: "Registros eletrônicos completos por paciente" },
  { icon: "📅", title: "Agenda Multi-profissional", desc: "Gestão de horários, salas e profissionais" },
  { icon: "💰", title: "Financeiro + Convênios", desc: "Faturamento TISS, guias e controle financeiro" },
  { icon: "👥", title: "CRM de Pacientes", desc: "Acompanhamento e retenção de pacientes" },
  { icon: "📄", title: "Documentos Automatizados", desc: "Laudos, atestados e receitas em um clique" },
  { icon: "💬", title: "WhatsApp Integrado", desc: "Confirmações, lembretes e comunicação direta" },
];

export default function ClinicLandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Hachi<span className="text-blue-600">Clinic</span>
          </span>
          <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Entrar
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Hachi Clinic — Gestão Inteligente para Clínicas
          </h1>
          <p className="mt-6 text-lg text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
            Prontuário eletrônico, agenda de profissionais, financeiro e comunicação em uma plataforma.
          </p>
          <a
            href="mailto:contato@hachiplatform.com?subject=Demonstração Hachi Clinic"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Solicitar Demonstração
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-12 text-center text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Tudo que sua clínica precisa
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

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Pronto para modernizar sua clínica?
          </h2>
          <p className="mt-3 text-gray-600">
            Agende uma demonstração gratuita e veja como a Hachi pode transformar sua gestão.
          </p>
          <a
            href="mailto:contato@hachiplatform.com?subject=Demonstração Hachi Clinic"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Solicitar Demonstração
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Hachi Platform. Todos os direitos reservados.</p>
          <p className="mt-1">Hachi Clinic é um produto da plataforma Hachi.</p>
        </div>
      </footer>
    </main>
  );
}
