"use client";

import Link from "next/link";
import {
  FileHeart, Calendar, Users, Activity, ClipboardList, Video
} from "lucide-react";

const features = [
  { name: "Prontuário Terapêutico", desc: "Registro multidisciplinar com evoluções, PTI e timeline completa.", icon: FileHeart },
  { name: "Agenda Terapêutica", desc: "Sessões individuais e em grupo, escalas de equipe e lembretes.", icon: Calendar },
  { name: "Portal da Família", desc: "Acompanhamento do tratamento e comunicação segura com familiares.", icon: Users },
  { name: "Monitoramento Clínico", desc: "Sinais vitais, medicação, intercorrências e alertas automáticos.", icon: Activity },
  { name: "Plano Terapêutico Individual", desc: "PTI com metas, fases do tratamento e avaliações periódicas.", icon: ClipboardList },
  { name: "Teleconsulta", desc: "Atendimento remoto integrado com prontuário e agenda.", icon: Video },
];

const coreModules = ["Financeiro", "Agenda", "CRM", "Documentos", "Estoque", "Comunicação", "Relatórios", "Automação"];

export default function RecoveryLanding() {
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
            <span className="text-teal-600">Hachi</span> Recovery
          </Link>
          <Link href="/onboarding" className="bg-teal-600 text-white text-sm font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-700 transition">
            Começar Agora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900">
            Gestão completa para <span className="text-teal-600">Comunidades Terapêuticas</span>
          </h1>
          <p className="mt-4 font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Prontuário eletrônico, plano terapêutico individual, portal da família e compliance em uma plataforma cloud-native para CTs e centros de reabilitação.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-teal-600 text-white font-display font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition">
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
                <div key={f.name} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition">
                  <Icon className="h-8 w-8 text-teal-600 mb-3" />
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
      <section className="py-16 px-6 bg-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Pronto para transformar sua CT?</h2>
          <Link href="/onboarding" className="mt-6 inline-flex items-center gap-2 bg-white text-teal-700 font-display font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition">
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
