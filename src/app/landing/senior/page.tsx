import Link from "next/link";
import type { Metadata } from "next";
import {
  Heart, Pill, Users, CalendarDays, Apple, BarChart3,
  ArrowRight, Home, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Senior — Sistema para ILPIs e Casas de Repouso",
  description: "Cuidado organizado para idosos: medicação, portal familiar, atividades e relatórios. Sistema completo para ILPIs.",
  keywords: ["sistema ILPI", "casa de repouso", "gestão geriátrica", "software idosos", "cuidado ao idoso"],
};

const features = [
  { name: "Acompanhamento do Residente", desc: "Histórico completo, avaliações geriátricas e evolução multidisciplinar.", icon: Heart },
  { name: "Controle de Medicação", desc: "Prescrição, dispensação, horários e alertas de interação medicamentosa.", icon: Pill },
  { name: "Portal Familiar", desc: "Famílias acompanham rotina, saúde e comunicados com fotos e atualizações.", icon: Users },
  { name: "Atividades Programadas", desc: "Calendário de fisioterapia, recreação, terapia ocupacional e eventos.", icon: CalendarDays },
  { name: "Gestão Nutricional", desc: "Cardápios personalizados por residente com restrições e preferências.", icon: Apple },
  { name: "Relatórios Gerenciais", desc: "Ocupação, custos, evolução clínica e satisfação familiar em tempo real.", icon: BarChart3 },
];

export default function SeniorLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-rose-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-rose-600">Hachi</span> Senior</span>
          </Link>
          <Link href="/onboarding" className="bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-rose-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Cuidado organizado para quem merece o melhor
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhamento clínico, medicação controlada e portal familiar em um sistema feito para quem cuida de idosos.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-rose-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-rose-700 transition shadow-lg shadow-rose-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "100%", label: "Medicação rastreada" },
              { value: "24/7", label: "Acesso familiar" },
              { value: "5min", label: "Relatório gerado" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-rose-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
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
            Medicação sem controle, famílias ansiosas, equipe sobrecarregada
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Erros de medicação, familiares ligando sem parar e equipe anotando tudo em papel. Seus residentes merecem mais.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre residentes", desc: "Perfil completo com histórico, medicação e preferências." },
              { step: "2", title: "Automatize o cuidado", desc: "Alertas de medicação, atividades programadas e evolução clínica." },
              { step: "3", title: "Tranquilize famílias", desc: "Portal com atualizações diárias, fotos e comunicados." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
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
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos para ILPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-rose-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-rose-600 mb-3" />
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
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Confiança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["ANVISA", "LGPD", "Criptografia AES-256", "Backup diário", "Audit Log"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-rose-50 text-rose-800 border border-rose-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-rose-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-rose-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Mais cuidado, menos burocracia. Comece agora.</h2>
          <p className="text-base text-rose-100 mt-3">Sem instalação. Sem contrato longo.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-rose-700 font-bold px-8 py-4 rounded-xl hover:bg-rose-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Senior — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
