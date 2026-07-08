/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Calendar, CreditCard, Users, ClipboardList, Video,
  ArrowRight, Heart, CheckCircle2, AlertTriangle, Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Clinic — Sistema para Clínicas Médicas",
  description: "Prontuário, agenda multi-profissional, convênios TISS e teleconsulta em uma plataforma para clínicas.",
  keywords: ["sistema clínica", "prontuário eletrônico", "agenda médica", "TISS", "teleconsulta", "software clínica"],
};

export default function ClinicLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="h-6 w-6 text-cyan-600" />
            <span className="font-semibold text-lg tracking-tight">Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">Clinic</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors shadow-sm">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Para clínicas médicas
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              O sistema que sua clínica<br className="hidden sm:block" />
              <span className="text-cyan-600">precisa para crescer.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Prontuário, agenda, convênios TISS e teleconsulta numa plataforma que médicos realmente usam.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-600/20">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 to-slate-100/50 rounded-3xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&h=500&fit=crop"
              alt="Interior moderno de clínica médica"
              loading="lazy"
              className="relative rounded-2xl shadow-2xl ring-1 ring-black/5 w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 px-6 border-y border-slate-100">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8">
          {[
            { value: "8+", label: "Convênios integrados" },
            { value: "6", label: "Tipos de agendamento" },
            { value: "100%", label: "Cloud e seguro" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight">
            Agendas em papel, prontuários perdidos, convênios sem controle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Agendamento caótico", desc: "Ligações, conflitos de horário e pacientes esperando sem necessidade." },
              { title: "Prontuário inacessível", desc: "Informação clínica em papel, sem histórico completo na consulta." },
              { title: "Faturamento manual", desc: "Guias TISS preenchidas à mão, glosas e repasses sem controle." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400 mb-4" />
                <h3 className="font-semibold text-white text-lg">{p.title}</h3>
                <p className="text-sm mt-2 text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28 px-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {[
              { step: "1", title: "Configure a clínica", desc: "Profissionais, salas, convênios e horários em minutos." },
              { step: "2", title: "Opere no digital", desc: "Pacientes agendam online, prontuário preenchido na consulta." },
              { step: "3", title: "Cresça com dados", desc: "Relatórios, CRM e automação para fidelizar pacientes." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">{s.step}</div>
                <h3 className="font-semibold text-lg mt-5">{s.title}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight">Feito para clínicas de verdade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Prontuário Eletrônico", desc: "Anamnese, prescrições, laudos e CID com templates.", icon: FileHeart, color: "from-cyan-500 to-cyan-600" },
              { name: "Agenda Multi-profissional", desc: "6 tipos de agendamento: consulta, retorno, procedimento e mais.", icon: Calendar, color: "from-blue-500 to-blue-600" },
              { name: "Convênios TISS", desc: "Faturamento automático com guias TISS e controle de glosas.", icon: CreditCard, color: "from-violet-500 to-violet-600" },
              { name: "Anamnese Digital", desc: "Formulários que o paciente preenche antes da consulta.", icon: ClipboardList, color: "from-amber-500 to-amber-600" },
              { name: "CRM de Pacientes", desc: "Pipeline de leads, follow-up por WhatsApp e retenção.", icon: Users, color: "from-green-500 to-green-600" },
              { name: "Teleconsulta", desc: "Atendimento remoto integrado ao prontuário com gravação.", icon: Video, color: "from-rose-500 to-rose-600" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-150 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="text-sm mt-2 text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-8 h-8 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Segurança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["LGPD", "CFM 2.314", "TISS 3.05", "Criptografia AES-256", "ANVISA"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(8,145,178,0.2),transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Sua clínica no digital em menos de 1 hora</h2>
          <p className="text-slate-400 mt-4 text-lg">Sem instalação. Sem contrato de fidelidade.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-cyan-500/25">
            Começar grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <p className="text-sm text-center text-slate-400">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
