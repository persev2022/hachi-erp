"use client";

import Link from "next/link";
import {
  UserPlus, BookOpen, Users, Calendar, MessageSquare, Wallet
} from "lucide-react";

const features = [
  { name: "Matrícula Online", desc: "Processo de matrícula digital com documentação e contratos automáticos.", icon: UserPlus },
  { name: "Boletim Digital", desc: "Notas, frequência, avaliações e histórico escolar em tempo real.", icon: BookOpen },
  { name: "Portal dos Pais", desc: "Acesso seguro para pais acompanharem desempenho e comunicados.", icon: Users },
  { name: "Agenda Escolar", desc: "Calendário de aulas, eventos, provas e atividades extracurriculares.", icon: Calendar },
  { name: "Comunicação", desc: "Mensagens para turmas, avisos individuais e newsletter automática.", icon: MessageSquare },
  { name: "Financeiro Escolar", desc: "Mensalidades, boletos, inadimplência e renegociação automatizada.", icon: Wallet },
];

const coreModules = ["Financeiro", "Agenda", "CRM", "Documentos", "Estoque", "Comunicação", "Relatórios", "Automação"];

export default function EducationLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="font-display font-bold text-xl text-gray-900">
            <span className="text-indigo-600">Hachi</span> Education
          </Link>
          <Link href="/onboarding" className="bg-indigo-600 text-white text-sm font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition">
            Começar Agora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900">
            Gestão escolar moderna para <span className="text-indigo-600">Escolas e Cursos</span>
          </h1>
          <p className="mt-4 font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Matrícula digital, boletim online, portal dos pais e financeiro escolar integrados para instituições de ensino de todos os portes.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white font-display font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition">
            Começar Agora
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12">Recursos Específicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition">
                  <Icon className="h-8 w-8 text-indigo-600 mb-3" />
                  <h3 className="font-display font-semibold text-base text-gray-900">{f.name}</h3>
                  <p className="font-body text-sm text-gray-500 mt-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Incluído do Core</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {coreModules.map((m) => (
              <span key={m} className="font-body text-sm bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Pronto para digitalizar sua instituição de ensino?</h2>
          <Link href="/onboarding" className="mt-6 inline-flex items-center gap-2 bg-white text-indigo-700 font-display font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition">
            Começar Agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="font-body text-sm text-gray-500">Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
