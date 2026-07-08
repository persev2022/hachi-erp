/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText, ScrollText, Users, Calendar, Globe, Zap,
  ArrowRight, Briefcase, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Services — Prestadores de Serviço",
  description: "Propostas, contratos, CRM e portal do cliente em um sistema profissional para consultores e agências.",
  keywords: ["sistema prestador serviço", "CRM consultoria", "gestão contratos", "software agência", "proposta comercial"],
};

export default function ServicesLanding() {
  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ background: "#F8FAFC", color: "#334155" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#F8FAFC", borderColor: "#CBD5E1" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" style={{ color: "#334155" }} />
            <span className="font-bold text-xl font-[Inter,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#334155", borderColor: "#CBD5E1" }}>Services</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Inter,system-ui,sans-serif]" style={{ background: "#334155" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Inter,system-ui,sans-serif]">
            Organize propostas, contratos e projetos em um único lugar
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            CRM, automação e portal do cliente para consultorias e agências que querem escalar com processo.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Inter,system-ui,sans-serif]" style={{ background: "#334155" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop"
            alt="Escritório moderno com equipe profissional colaborando"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#CBD5E1" }}>
          {[
            { value: "2x", label: "Mais conversão" },
            { value: "0", label: "Contratos perdidos" },
            { value: "100%", label: "Rastreabilidade" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#CBD5E1" }}>
              <div className="font-bold text-2xl font-[Inter,system-ui,sans-serif]" style={{ color: "#334155" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#1E293B" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Inter,system-ui,sans-serif]">
            Propostas no email, contratos sem versão, cobranças manuais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Propostas perdidas", desc: "No inbox, sem follow-up, receita escapando." },
              { title: "Contratos vencidos", desc: "Sem alerta de renovação, churn evitável." },
              { title: "Cobrança manual", desc: "Sem régua automática, inadimplência crescente." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#0F172A", borderColor: "#475569" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#F59E0B" }} />
                <h3 className="font-semibold text-lg text-white font-[Inter,system-ui,sans-serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-400">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Inter,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Centralize clientes", desc: "CRM com pipeline, histórico e scoring." },
              { step: "2", title: "Automatize processos", desc: "Propostas, contratos e cobranças com workflows." },
              { step: "3", title: "Escale com dados", desc: "Relatórios de conversão, churn e MRR." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#334155" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Inter,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#CBD5E1" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Inter,system-ui,sans-serif]">Recursos para prestadores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Propostas Comerciais", desc: "Templates com cálculo, PDF e assinatura digital.", icon: FileText },
              { name: "Gestão de Contratos", desc: "Vencimentos, renovações e alertas automáticos.", icon: ScrollText },
              { name: "CRM de Clientes", desc: "Pipeline, follow-up, scoring e histórico.", icon: Users },
              { name: "Agenda de Serviços", desc: "Visitas, alocação de equipe e lembretes.", icon: Calendar },
              { name: "Portal do Cliente", desc: "Propostas, contratos, chamados e faturas.", icon: Globe },
              { name: "Automação", desc: "Workflows para onboarding, cobrança e renovação.", icon: Zap },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#CBD5E1" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#334155" }} />
                  <h3 className="font-semibold text-base font-[Inter,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm mt-2 opacity-70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl mb-8 font-[Inter,system-ui,sans-serif]">Profissional e integrado</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Assinatura digital", "Pix/Boleto", "WhatsApp", "NFS-e", "LGPD"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#CBD5E1" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#334155" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #334155, #64748B)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Inter,system-ui,sans-serif]">Profissionalize sua operação. Comece agora.</h2>
          <p className="text-base text-white/80 mt-4">Sem contrato longo. Cancele quando quiser.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Inter,system-ui,sans-serif]" style={{ color: "#334155" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#F8FAFC", borderColor: "#CBD5E1" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
