/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Syringe, Calendar, Users, BedDouble, Scissors,
  ArrowRight, Stethoscope, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Vet — Sistema para Clínicas Veterinárias",
  description: "Prontuário animal, carteira de vacinação, internação e portal do tutor. Gestão completa para clínicas vet.",
  keywords: ["sistema veterinário", "prontuário animal", "software pet shop", "clínica veterinária", "gestão vet"],
};

export default function VetLanding() {
  return (
    <div className="min-h-screen font-[Nunito,system-ui,sans-serif]" style={{ background: "#ECFDF5", color: "#064E3B" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#ECFDF5", borderColor: "#6EE7B7" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6" style={{ color: "#059669" }} />
            <span className="font-bold text-xl font-[Fredoka,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#059669", borderColor: "#6EE7B7" }}>Vet</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Fredoka,system-ui,sans-serif]" style={{ background: "#059669" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Fredoka,system-ui,sans-serif]">
            Prontuário veterinário e gestão completa para clínicas pet
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            Do prontuário à vacinação, da internação ao banho e tosa. Feito por quem entende a rotina veterinária.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Fredoka,system-ui,sans-serif]" style={{ background: "#059669" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&h=600&fit=crop"
            alt="Cachorro em consulta veterinária recebendo cuidado profissional"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#6EE7B7" }}>
          {[
            { value: "100%", label: "Vacinas rastreadas" },
            { value: "24/7", label: "Portal do tutor" },
            { value: "0", label: "Fichas perdidas" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#6EE7B7" }}>
              <div className="font-bold text-2xl font-[Fredoka,system-ui,sans-serif]" style={{ color: "#059669" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#064E3B" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Fredoka,system-ui,sans-serif]">
            Fichas em papel, vacinas sem controle, tutores sem acesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Fichas que se perdem", desc: "Histórico clínico incompleto e sem rastreabilidade." },
              { title: "Vacinas esquecidas", desc: "Sem alertas de reforço, risco para os animais." },
              { title: "Tutores no escuro", desc: "Sem acesso a histórico, exames ou agendamento online." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#022C22", borderColor: "#6EE7B7" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#FBBF24" }} />
                <h3 className="font-semibold text-lg text-white font-[Fredoka,system-ui,sans-serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Fredoka,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre os pets", desc: "Perfil completo com espécie, raça, peso e tutor." },
              { step: "2", title: "Atenda e registre", desc: "Prontuário digital com prescrições e exames." },
              { step: "3", title: "Engaje os tutores", desc: "Portal com histórico, vacinas e agendamento." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#059669" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Fredoka,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#6EE7B7" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Fredoka,system-ui,sans-serif]">Recursos para veterinária</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Prontuário Animal", desc: "Ficha por pet: histórico, alergias, exames e peso.", icon: FileHeart },
              { name: "Carteira de Vacinação", desc: "Vacinas digitais com alertas automáticos de reforço.", icon: Syringe },
              { name: "Agenda Veterinária", desc: "Consultas, cirurgias, retornos e gestão de salas.", icon: Calendar },
              { name: "Portal do Tutor", desc: "Histórico, vacinas, resultados e agendamento online.", icon: Users },
              { name: "Internação", desc: "Sinais vitais, medicação e evolução clínica.", icon: BedDouble },
              { name: "Banho e Tosa", desc: "Agendamento com preferências e notificação.", icon: Scissors },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#6EE7B7" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#059669" }} />
                  <h3 className="font-semibold text-base font-[Fredoka,system-ui,sans-serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[Fredoka,system-ui,sans-serif]">Integrado ao seu dia a dia</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["WhatsApp alertas", "Pix integrado", "NFS-e", "LGPD", "Multi-unidade"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#6EE7B7" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#059669" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #059669, #34D399)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Fredoka,system-ui,sans-serif]">Sua clínica vet no digital. Comece hoje.</h2>
          <p className="text-base text-white/80 mt-4">Sem instalação. Funciona no tablet e celular.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Fredoka,system-ui,sans-serif]" style={{ color: "#059669" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#ECFDF5", borderColor: "#6EE7B7" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
