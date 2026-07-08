import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Users, BedDouble, DollarSign, Shield, MessageSquare,
  ArrowRight, Clock, CheckCircle2, Activity
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Recovery — Sistema para Comunidades Terapêuticas",
  description: "Prontuário eletrônico, portal da família e gestão completa para CTs. Conforme ANVISA RDC 29, LGPD e SISNAD.",
  keywords: ["comunidade terapêutica", "prontuário eletrônico CT", "gestão CT", "ANVISA RDC 29", "software reabilitação"],
};

const features = [
  { name: "Prontuário Multidisciplinar", desc: "Evoluções médicas, psicológicas, sociais e terapêuticas com timeline completa.", icon: FileHeart },
  { name: "Portal da Família", desc: "Familiares acompanham tratamento, pagamentos e comunicados em tempo real.", icon: Users },
  { name: "Controle de Leitos", desc: "Mapa de ocupação, admissões, altas e transferências em um painel visual.", icon: BedDouble },
  { name: "Financeiro", desc: "Mensalidades, contratos automáticos e cobrança via Pix integrada.", icon: DollarSign },
  { name: "Conformidade LGPD", desc: "Criptografia AES-256, audit log, consentimento e exportação de dados.", icon: Shield },
  { name: "WhatsApp Integrado", desc: "Comunicação automatizada com famílias: avisos, cobranças e relatórios.", icon: MessageSquare },
];

export default function RecoveryLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-teal-600">Hachi</span> Recovery</span>
          </Link>
          <Link href="/onboarding" className="bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Prontuário eletrônico e gestão completa para Comunidades Terapêuticas
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Da admissão à alta, tudo digital. Conforme ANVISA, LGPD e SISNAD.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "30s", label: "Gerar contrato" },
              { value: "15min", label: "Admissão completa" },
              { value: "24/7", label: "Acesso familiar" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-teal-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">
            Prontuários físicos, cobranças manuais, famílias sem informação
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Sua CT ainda gasta horas com papelada, perde informações clínicas e recebe ligações de famílias preocupadas? Existe um caminho melhor.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre sua CT", desc: "Configure leitos, equipe e regras em minutos." },
              { step: "2", title: "Digitalize a operação", desc: "Prontuários, contratos e cobranças automatizados." },
              { step: "3", title: "Conecte as famílias", desc: "Portal com atualizações e pagamentos em tempo real." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos especializados para CTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-base text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Conformidade regulatória</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["ANVISA RDC 29", "CFM 1.638", "SISNAD", "LGPD", "COREN", "CRP"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-teal-50 text-teal-800 border border-teal-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-2xl text-center text-gray-900 mb-10 font-[Space_Grotesk,system-ui,sans-serif]">Perguntas frequentes</h2>
          <div className="space-y-6">
            {[
              { q: "O sistema atende a RDC 29 da ANVISA?", a: "Sim. Prontuário, equipe mínima, PTS e documentação são modelados conforme a resolução." },
              { q: "As famílias conseguem acessar remotamente?", a: "Sim. O Portal da Família permite acompanhar evolução, pagamentos e comunicados 24/7." },
              { q: "Quanto tempo leva para implantar?", a: "A configuração básica leva menos de 1 hora. Migração de dados existentes em até 7 dias." },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-base text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{faq.q}</h3>
                <p className="text-sm text-gray-600 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-teal-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-teal-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Comece hoje. Resultado amanhã.</h2>
          <p className="text-base text-teal-100 mt-3">Setup em minutos, sem necessidade de TI.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Recovery — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
