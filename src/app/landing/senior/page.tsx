/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  Heart, Pill, Users, CalendarDays, Apple, BarChart3,
  ArrowRight, CheckCircle2, Home, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Senior — Sistema para ILPIs",
  description: "Cuidado organizado para idosos: medicação, portal familiar, atividades e relatórios completos para ILPIs.",
  keywords: ["sistema ILPI", "casa de repouso", "gestão geriátrica", "software idosos", "cuidado ao idoso"],
};

export default function SeniorLanding() {
  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ background: "#FFF1F2", color: "#4C0519" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#FFF1F2", borderColor: "#FDA4AF" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" style={{ color: "#E11D48" }} />
            <span className="font-bold text-xl font-[DM_Serif_Display,serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#E11D48", borderColor: "#FDA4AF" }}>Senior</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Inter,system-ui,sans-serif]" style={{ background: "#E11D48" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[DM_Serif_Display,serif]">
            Cuidado organizado para quem merece o melhor
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            Medicação controlada, portal familiar e acompanhamento completo. Feito para quem cuida de idosos com carinho.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90" style={{ background: "#E11D48" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&h=600&fit=crop"
            alt="Idoso recebendo cuidado atencioso e profissional"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#FDA4AF" }}>
          {[
            { value: "100%", label: "Medicação rastreada" },
            { value: "24/7", label: "Acesso familiar" },
            { value: "5min", label: "Relatório gerado" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#FDA4AF" }}>
              <div className="font-bold text-2xl font-[DM_Serif_Display,serif]" style={{ color: "#E11D48" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#4C0519" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[DM_Serif_Display,serif]">
            Medicação sem controle, famílias ansiosas, equipe sobrecarregada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Erros de medicação", desc: "Horários trocados, doses esquecidas, sem rastreabilidade." },
              { title: "Famílias sem informação", desc: "Ligações constantes, ansiedade e falta de transparência." },
              { title: "Equipe no papel", desc: "Anotações manuais que se perdem e geram retrabalho." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#3B0412", borderColor: "#FDA4AF" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#FB923C" }} />
                <h3 className="font-semibold text-lg text-white font-[DM_Serif_Display,serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[DM_Serif_Display,serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre residentes", desc: "Perfil completo com histórico, medicação e preferências." },
              { step: "2", title: "Automatize o cuidado", desc: "Alertas de medicação, atividades e evolução clínica." },
              { step: "3", title: "Tranquilize famílias", desc: "Portal com atualizações diárias, fotos e comunicados." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#E11D48" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[DM_Serif_Display,serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#FDA4AF" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[DM_Serif_Display,serif]">Recursos para ILPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Acompanhamento do Residente", desc: "Histórico completo, avaliações geriátricas e evolução.", icon: Heart },
              { name: "Controle de Medicação", desc: "Prescrição, dispensação, horários e alertas.", icon: Pill },
              { name: "Portal Familiar", desc: "Famílias acompanham rotina, saúde e comunicados.", icon: Users },
              { name: "Atividades Programadas", desc: "Fisioterapia, recreação, terapia e eventos.", icon: CalendarDays },
              { name: "Gestão Nutricional", desc: "Cardápios personalizados com restrições.", icon: Apple },
              { name: "Relatórios Gerenciais", desc: "Ocupação, custos e satisfação familiar.", icon: BarChart3 },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#FDA4AF" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#E11D48" }} />
                  <h3 className="font-semibold text-base font-[DM_Serif_Display,serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[DM_Serif_Display,serif]">Confiança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["ANVISA", "LGPD", "Criptografia AES-256", "Backup diário", "Audit Log"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#FDA4AF" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#E11D48" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #E11D48, #FB7185)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[DM_Serif_Display,serif]">Mais cuidado, menos burocracia. Comece agora.</h2>
          <p className="text-base text-white/80 mt-4">Sem instalação. Sem contrato longo.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90" style={{ color: "#E11D48" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#FFF1F2", borderColor: "#FDA4AF" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
