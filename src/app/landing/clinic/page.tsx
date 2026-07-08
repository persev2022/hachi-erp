import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Calendar, CreditCard, Users, ClipboardList, Video,
  ArrowRight, Heart, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Clinic — Sistema para Clínicas Médicas",
  description: "Prontuário, agenda multi-profissional, convênios TISS e teleconsulta em uma plataforma para clínicas de todas as especialidades.",
  keywords: ["sistema para clínica", "prontuário eletrônico", "agenda médica", "TISS", "teleconsulta", "software clínica"],
};

const features = [
  { name: "Prontuário Eletrônico", desc: "Anamnese, prescrições, laudos e CID com templates por especialidade.", icon: FileHeart },
  { name: "Agenda Multi-profissional", desc: "6 tipos de agendamento: consulta, retorno, procedimento, grupo, encaixe e bloqueio.", icon: Calendar },
  { name: "Convênios TISS", desc: "Faturamento automático com guias TISS, glosas e repasses de 8+ convênios.", icon: CreditCard },
  { name: "Anamnese Digital", desc: "Formulários personalizáveis que o paciente preenche antes da consulta.", icon: ClipboardList },
  { name: "CRM de Pacientes", desc: "Pipeline de leads, follow-up por WhatsApp e retenção automatizada.", icon: Users },
  { name: "Teleconsulta", desc: "Atendimento remoto integrado ao prontuário com gravação e assinatura.", icon: Video },
];

export default function ClinicLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-blue-600">Hachi</span> Clinic</span>
          </Link>
          <Link href="/onboarding" className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            O sistema que sua clínica precisa para crescer com organização
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Prontuário, agenda, convênios e teleconsulta em uma plataforma que médicos realmente usam.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "8+", label: "Convênios integrados" },
              { value: "6", label: "Tipos de agendamento" },
              { value: "100%", label: "Cloud e seguro" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-blue-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
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
            Agendas em papel, prontuários perdidos, convênios sem controle
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Cada minuto gasto com burocracia é um paciente a menos atendido. Sua clínica merece operar no digital.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure a clínica", desc: "Profissionais, salas, convênios e horários em minutos." },
              { step: "2", title: "Opere no digital", desc: "Pacientes agendam online, prontuário preenchido na consulta." },
              { step: "3", title: "Cresça com dados", desc: "Relatórios, CRM e automação para fidelizar pacientes." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
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
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Feito para clínicas de verdade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-blue-600 mb-3" />
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
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Segurança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["LGPD Compliant", "CFM 2.314", "TISS 3.05", "Criptografia AES-256", "Audit Log"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-blue-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-blue-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Sua clínica operando no digital em menos de 1 hora</h2>
          <p className="text-base text-blue-100 mt-3">Sem instalação. Sem contrato de fidelidade.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Clinic — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
