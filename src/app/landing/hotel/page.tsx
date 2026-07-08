import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarCheck, LogIn, BedDouble, DollarSign, Globe, Sparkles,
  ArrowRight, Hotel, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Hotel — Sistema de Gestão Hoteleira Inteligente",
  description: "Reservas, check-in digital, housekeeping e portal do hóspede. Gestão hoteleira completa para mais reservas e menos overbooking.",
  keywords: ["sistema hoteleiro", "PMS hotel", "gestão de reservas", "check-in digital", "software pousada"],
};

const features = [
  { name: "Motor de Reservas", desc: "Disponibilidade em tempo real, confirmação automática e gestão de canais.", icon: CalendarCheck },
  { name: "Check-in / Check-out", desc: "Processo digital com assinatura, documentos e chave virtual.", icon: LogIn },
  { name: "Gestão de UHs", desc: "Mapa visual de unidades, status, manutenção e bloqueios por período.", icon: BedDouble },
  { name: "Tarifas Dinâmicas", desc: "Preços por temporada, dia da semana, pacotes e canais de venda.", icon: DollarSign },
  { name: "Portal do Hóspede", desc: "Reservas, solicitações, room service e avaliações em um só lugar.", icon: Globe },
  { name: "Housekeeping", desc: "Controle de limpeza, arrumação e manutenção com status em tempo real.", icon: Sparkles },
];

export default function HotelLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Hotel className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-purple-600">Hachi</span> Hotel</span>
          </Link>
          <Link href="/onboarding" className="bg-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Gestão hoteleira inteligente para mais reservas e menos dor de cabeça
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            De reservas a housekeeping, tudo integrado. Para hotéis, pousadas e resorts que querem operar com excelência.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "0", label: "Overbookings" },
              { value: "2min", label: "Check-in digital" },
              { value: "100%", label: "Ocupação visível" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-purple-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
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
            Overbooking, check-in manual, falta de controle financeiro
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Cada reserva perdida por erro operacional é receita que nunca volta. Cada hóspede esperando no balcão é uma avaliação negativa.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure o hotel", desc: "UHs, tarifas, regras e canais de venda em um dia." },
              { step: "2", title: "Receba reservas", desc: "Motor integrado com confirmação automática e anti-overbooking." },
              { step: "3", title: "Encante hóspedes", desc: "Check-in digital, portal do hóspede e housekeeping em tempo real." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
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
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos para hotelaria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-purple-600 mb-3" />
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
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Integrado e seguro</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Multi-canal", "Pix integrado", "NFS-e automática", "LGPD", "Relatórios BI"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-purple-50 text-purple-800 border border-purple-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-purple-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-purple-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Eleve a experiência do hóspede. Comece agora.</h2>
          <p className="text-base text-purple-100 mt-3">Setup rápido. Sem taxas sobre reservas.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Hotel — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
