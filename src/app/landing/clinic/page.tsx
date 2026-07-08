/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Calendar, CreditCard, Users, ClipboardList, Video,
  ArrowRight, Heart, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Clinic — Sistema para Clínicas Médicas",
  description: "Prontuário, agenda multi-profissional, convênios TISS e teleconsulta em uma plataforma para clínicas.",
  keywords: ["sistema clínica", "prontuário eletrônico", "agenda médica", "TISS", "teleconsulta", "software clínica"],
};

export default function ClinicLanding() {
  return (
    <div className="min-h-screen font-[Noto_Sans,system-ui,sans-serif]" style={{ background: "#ECFEFF", color: "#164E63" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Noto+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#ECFEFF", borderColor: "#67E8F9" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6" style={{ color: "#0891B2" }} />
            <span className="font-bold text-xl font-[Figtree,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#0891B2", borderColor: "#67E8F9" }}>Clinic</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Figtree,system-ui,sans-serif]" style={{ background: "#0891B2" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Figtree,system-ui,sans-serif]">
            O sistema que sua clínica precisa para crescer com organização
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            Prontuário, agenda, convênios e teleconsulta numa plataforma que médicos realmente usam.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Figtree,system-ui,sans-serif]" style={{ background: "#0891B2" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=600&fit=crop"
            alt="Ambiente médico moderno com tecnologia integrada"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#67E8F9" }}>
          {[
            { value: "8+", label: "Convênios integrados" },
            { value: "6", label: "Tipos de agendamento" },
            { value: "100%", label: "Cloud e seguro" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#67E8F9" }}>
              <div className="font-bold text-2xl font-[Figtree,system-ui,sans-serif]" style={{ color: "#0891B2" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#164E63" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Figtree,system-ui,sans-serif]">
            Agendas em papel, prontuários perdidos, convênios sem controle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Agendamento caótico", desc: "Ligações, conflitos de horário e pacientes esperando sem necessidade." },
              { title: "Prontuário inacessível", desc: "Informação clínica em papel, sem histórico completo na consulta." },
              { title: "Faturamento manual", desc: "Guias TISS preenchidas à mão, glosas e repasses sem controle." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#0C4A5E", borderColor: "#67E8F9" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#D97706" }} />
                <h3 className="font-semibold text-lg text-white font-[Figtree,system-ui,sans-serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Figtree,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure a clínica", desc: "Profissionais, salas, convênios e horários em minutos." },
              { step: "2", title: "Opere no digital", desc: "Pacientes agendam online, prontuário preenchido na consulta." },
              { step: "3", title: "Cresça com dados", desc: "Relatórios, CRM e automação para fidelizar pacientes." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto font-[Figtree,system-ui,sans-serif] text-white" style={{ background: "#0891B2" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Figtree,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#67E8F9" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Figtree,system-ui,sans-serif]">Feito para clínicas de verdade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Prontuário Eletrônico", desc: "Anamnese, prescrições, laudos e CID com templates.", icon: FileHeart },
              { name: "Agenda Multi-profissional", desc: "6 tipos de agendamento: consulta, retorno, procedimento e mais.", icon: Calendar },
              { name: "Convênios TISS", desc: "Faturamento automático com guias TISS e controle de glosas.", icon: CreditCard },
              { name: "Anamnese Digital", desc: "Formulários que o paciente preenche antes da consulta.", icon: ClipboardList },
              { name: "CRM de Pacientes", desc: "Pipeline de leads, follow-up por WhatsApp e retenção.", icon: Users },
              { name: "Teleconsulta", desc: "Atendimento remoto integrado ao prontuário com gravação.", icon: Video },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#67E8F9" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#0891B2" }} />
                  <h3 className="font-semibold text-base font-[Figtree,system-ui,sans-serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[Figtree,system-ui,sans-serif]">Segurança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["LGPD", "CFM 2.314", "TISS 3.05", "Criptografia AES-256", "ANVISA"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#67E8F9" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#0891B2" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #0891B2, #22D3EE)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Figtree,system-ui,sans-serif]">Sua clínica no digital em menos de 1 hora</h2>
          <p className="text-base text-white/80 mt-4">Sem instalação. Sem contrato de fidelidade.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Figtree,system-ui,sans-serif]" style={{ color: "#0891B2" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#ECFEFF", borderColor: "#67E8F9" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
