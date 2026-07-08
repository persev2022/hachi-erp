import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText, ScrollText, Users, Calendar, Globe, Zap,
  ArrowRight, Briefcase, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Services — Sistema para Prestadores de Serviço",
  description: "Propostas, contratos, CRM e portal do cliente em um sistema profissional. Organize sua operação de serviços.",
  keywords: ["sistema prestador serviço", "CRM consultoria", "gestão contratos", "software agência", "proposta comercial"],
};

const features = [
  { name: "Propostas Comerciais", desc: "Templates profissionais com cálculo automático, PDF e assinatura digital.", icon: FileText },
  { name: "Gestão de Contratos", desc: "Vencimentos, renovações, aditivos e alertas automáticos de expiração.", icon: ScrollText },
  { name: "CRM de Clientes", desc: "Pipeline comercial, follow-up automatizado, scoring e histórico completo.", icon: Users },
  { name: "Agenda de Serviços", desc: "Visitas, atendimentos, alocação de equipe e lembretes integrados.", icon: Calendar },
  { name: "Portal do Cliente", desc: "Acesso a propostas, contratos, chamados, faturas e relatórios.", icon: Globe },
  { name: "Automação de Processos", desc: "Workflows para onboarding, cobrança, follow-up e renovação.", icon: Zap },
];

export default function ServicesLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-slate-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-slate-600">Hachi</span> Services</span>
          </Link>
          <Link href="/onboarding" className="bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Organize propostas, contratos e projetos em um único lugar
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            CRM, automação e portal do cliente para consultorias, agências e prestadores que querem escalar com processo.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-slate-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-700/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "2x", label: "Mais conversão" },
              { value: "0", label: "Contratos perdidos" },
              { value: "100%", label: "Rastreabilidade" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-slate-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
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
            Propostas no email, contratos sem versionamento, cobranças manuais
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Cada proposta que se perde no inbox é receita que escapa. Cada contrato vencido sem alerta é churn evitável.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Centralize clientes", desc: "CRM com pipeline, histórico e scoring em um painel." },
              { step: "2", title: "Automatize processos", desc: "Propostas, contratos e cobranças com workflows prontos." },
              { step: "3", title: "Escale com dados", desc: "Relatórios de conversão, churn e receita recorrente." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
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
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos para prestadores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-slate-600 mb-3" />
                  <h3 className="font-semibold text-base text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Profissional e integrado</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Assinatura digital", "Pix/Boleto", "WhatsApp", "NFS-e", "LGPD"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Profissionalize sua operação. Comece agora.</h2>
          <p className="text-base text-slate-300 mt-3">Sem contrato longo. Cancele quando quiser.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-slate-800 font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Services — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
