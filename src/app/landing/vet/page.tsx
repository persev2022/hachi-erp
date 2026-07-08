import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Syringe, Calendar, Users, BedDouble, Scissors,
  ArrowRight, Stethoscope, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Vet — Sistema para Clínicas Veterinárias e Pet",
  description: "Prontuário animal, carteira de vacinação, internação e portal do tutor. Gestão completa para clínicas veterinárias.",
  keywords: ["sistema veterinário", "prontuário animal", "software pet shop", "clínica veterinária", "gestão vet"],
};

const features = [
  { name: "Prontuário Animal", desc: "Ficha completa por pet: histórico, alergias, exames, laudos e peso.", icon: FileHeart },
  { name: "Carteira de Vacinação", desc: "Vacinas digitais com alertas automáticos de reforço para tutores.", icon: Syringe },
  { name: "Agenda Veterinária", desc: "Consultas, cirurgias, retornos e gestão de salas e equipamentos.", icon: Calendar },
  { name: "Portal do Tutor", desc: "Acesso do tutor a histórico, vacinas, resultados e agendamento online.", icon: Users },
  { name: "Internação", desc: "Acompanhamento de sinais vitais, medicação e evolução clínica.", icon: BedDouble },
  { name: "Banho e Tosa", desc: "Agendamento com preferências, histórico e notificação de pronto.", icon: Scissors },
];

export default function VetLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-emerald-600">Hachi</span> Vet</span>
          </Link>
          <Link href="/onboarding" className="bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Prontuário veterinário e gestão completa para clínicas pet
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            Do prontuário à vacinação, da internação ao banho e tosa. Um sistema feito por quem entende a rotina veterinária.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "100%", label: "Vacinas rastreadas" },
              { value: "24/7", label: "Portal do tutor" },
              { value: "0", label: "Fichas perdidas" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-emerald-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
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
            Fichas em papel, vacinas sem controle, tutores sem acesso
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Cada ficha perdida é um histórico que desaparece. Cada vacina esquecida é um risco para o animal. Seus pacientes peludos merecem mais.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre os pets", desc: "Perfil completo com espécie, raça, peso, alergias e tutor." },
              { step: "2", title: "Atenda e registre", desc: "Prontuário digital na consulta com prescrições e exames." },
              { step: "3", title: "Engaje os tutores", desc: "Portal com histórico, vacinas e agendamento online." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
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
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos para veterinária</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-emerald-600 mb-3" />
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
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Integrado ao seu dia a dia</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["WhatsApp alertas", "Pix integrado", "NFS-e", "LGPD", "Multi-unidade"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-emerald-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-emerald-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Sua clínica vet no digital. Comece hoje.</h2>
          <p className="text-base text-emerald-100 mt-3">Sem instalação. Funciona no tablet e celular.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Vet — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
