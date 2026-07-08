/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Syringe, Calendar, Users, BedDouble, Scissors,
  ArrowRight, Stethoscope, CheckCircle2, AlertTriangle, Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Vet — Sistema para Clínicas Veterinárias",
  description: "Prontuário animal, carteira de vacinação, internação e portal do tutor. Gestão completa para clínicas vet.",
  keywords: ["sistema veterinário", "prontuário animal", "software pet shop", "clínica veterinária", "gestão vet"],
};

export default function VetLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-lg tracking-tight">Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Vet</span>
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
            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Para clínicas veterinárias
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Cuidado animal com<br className="hidden sm:block" />
              <span className="text-green-600">gestão inteligente.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Prontuário animal, carteira de vacinação, internação e portal do tutor. Tudo que sua clínica vet precisa.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-600/20">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-slate-100/50 rounded-3xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&h=500&fit=crop"
              alt="Veterinário examinando cachorro com cuidado"
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
            { value: "100%", label: "Vacinas rastreadas" },
            { value: "24/7", label: "Portal do tutor" },
            { value: "Zero", label: "Ficha perdida" },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight">
            Fichas em papel, vacinas sem controle, tutores sem acesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Prontuário em papel", desc: "Histórico clínico inacessível, sem busca e sem rastreabilidade." },
              { title: "Vacinas descontroladas", desc: "Lembretes manuais, doses perdidas e tutores desinformados." },
              { title: "Internação sem visibilidade", desc: "Tutor sem saber o estado do pet, equipe sem protocolo digital." },
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
              { step: "1", title: "Configure a clínica", desc: "Profissionais, especialidades, agenda e estoque em minutos." },
              { step: "2", title: "Digitalize o cuidado", desc: "Prontuário, vacinas, exames e internação no sistema." },
              { step: "3", title: "Conecte tutores", desc: "Portal com histórico, lembretes e pagamentos online." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">{s.step}</div>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight">Gestão veterinária completa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Prontuário Animal", desc: "Histórico completo por pet: consultas, exames, cirurgias.", icon: FileHeart, color: "from-green-500 to-green-600" },
              { name: "Carteira de Vacinação", desc: "Controle de doses, lotes, validade e lembretes automáticos.", icon: Syringe, color: "from-blue-500 to-blue-600" },
              { name: "Agenda Veterinária", desc: "Consultas, cirurgias, retornos e encaixes inteligentes.", icon: Calendar, color: "from-violet-500 to-violet-600" },
              { name: "Portal do Tutor", desc: "Tutor acompanha histórico, vacinas e pagamentos online.", icon: Users, color: "from-amber-500 to-amber-600" },
              { name: "Internação", desc: "Protocolo digital, evolução e comunicação com tutor.", icon: BedDouble, color: "from-rose-500 to-rose-600" },
              { name: "Pet Shop e Banho", desc: "Agendamento de banho, tosa e venda de produtos integrada.", icon: Scissors, color: "from-cyan-500 to-cyan-600" },
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Conformidade e segurança</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["CRMV", "LGPD", "MAPA", "Criptografia AES-256", "Backup diário"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(22,163,74,0.2),transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Sua clínica vet no digital hoje</h2>
          <p className="text-slate-400 mt-4 text-lg">Configure em minutos. Sem complexidade. Teste grátis.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-green-500/25">
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
