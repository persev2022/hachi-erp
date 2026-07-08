/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  UserPlus, BookOpen, Users, Calendar, MessageSquare, Wallet,
  ArrowRight, GraduationCap, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Education — Gestão Escolar Completa",
  description: "Matrícula digital, boletim online, portal dos pais e financeiro escolar. Conecta escola, alunos e famílias.",
  keywords: ["sistema escolar", "gestão escolar", "portal dos pais", "matrícula online", "software educação"],
};

export default function EducationLanding() {
  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ background: "#EEF2FF", color: "#312E81" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#EEF2FF", borderColor: "#A5B4FC" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" style={{ color: "#4F46E5" }} />
            <span className="font-bold text-xl font-[Poppins,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#4F46E5", borderColor: "#A5B4FC" }}>Education</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Poppins,system-ui,sans-serif]" style={{ background: "#4F46E5" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Poppins,system-ui,sans-serif]">
            A plataforma que conecta escola, alunos e famílias
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            Matrícula, boletim, comunicação e financeiro num sistema que a secretaria ama e os pais entendem.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Poppins,system-ui,sans-serif]" style={{ background: "#4F46E5" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop"
            alt="Formatura com estudantes celebrando conquistas acadêmicas"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#A5B4FC" }}>
          {[
            { value: "80%", label: "Menos ligações" },
            { value: "5min", label: "Matrícula online" },
            { value: "24/7", label: "Portal dos pais" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#A5B4FC" }}>
              <div className="font-bold text-2xl font-[Poppins,system-ui,sans-serif]" style={{ color: "#4F46E5" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#312E81" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Poppins,system-ui,sans-serif]">
            Comunicação falha, mensalidades atrasadas, zero visibilidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Pais desinformados", desc: "Não sabem das provas, eventos ou notas até ser tarde demais." },
              { title: "Secretaria sobrecarregada", desc: "Respondendo as mesmas perguntas o dia inteiro." },
              { title: "Inadimplência crescente", desc: "Cobranças manuais, sem régua de comunicação." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#1E1B4B", borderColor: "#A5B4FC" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#F59E0B" }} />
                <h3 className="font-semibold text-lg text-white font-[Poppins,system-ui,sans-serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Poppins,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure a escola", desc: "Turmas, disciplinas, professores e calendário." },
              { step: "2", title: "Conecte as famílias", desc: "Portal dos pais com notas, comunicados e boletos." },
              { step: "3", title: "Automatize a gestão", desc: "Cobranças, comunicação e relatórios automáticos." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#4F46E5" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Poppins,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#A5B4FC" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Poppins,system-ui,sans-serif]">Recursos para educação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Matrícula Online", desc: "Processo digital com documentação e assinatura.", icon: UserPlus },
              { name: "Boletim Digital", desc: "Notas, frequência e avaliações em tempo real.", icon: BookOpen },
              { name: "Portal dos Pais", desc: "Desempenho, comunicados, agenda e boletos.", icon: Users },
              { name: "Agenda Escolar", desc: "Aulas, provas, eventos e atividades extras.", icon: Calendar },
              { name: "Comunicação", desc: "Avisos por turma, mensagens e newsletter.", icon: MessageSquare },
              { name: "Financeiro Escolar", desc: "Mensalidades, boletos e renegociação.", icon: Wallet },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#A5B4FC" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#4F46E5" }} />
                  <h3 className="font-semibold text-base font-[Poppins,system-ui,sans-serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[Poppins,system-ui,sans-serif]">Segurança e integração</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["LGPD", "Boleto/Pix", "WhatsApp", "Assinatura digital", "Multi-unidade"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#A5B4FC" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#4F46E5" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #4F46E5, #818CF8)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Poppins,system-ui,sans-serif]">Escola conectada. Pais tranquilos. Gestão no controle.</h2>
          <p className="text-base text-white/80 mt-4">Implantação assistida. Sem custo de setup.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Poppins,system-ui,sans-serif]" style={{ color: "#4F46E5" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#EEF2FF", borderColor: "#A5B4FC" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
