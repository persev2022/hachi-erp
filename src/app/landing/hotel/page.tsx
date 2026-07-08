/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarCheck, LogIn, BedDouble, DollarSign, Globe, Sparkles,
  ArrowRight, Hotel, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Hotel — Gestão Hoteleira Inteligente",
  description: "Reservas, check-in digital, housekeeping e portal do hóspede. Gestão hoteleira completa para hotéis e pousadas.",
  keywords: ["sistema hoteleiro", "PMS hotel", "gestão reservas", "check-in digital", "software pousada"],
};

export default function HotelLanding() {
  return (
    <div className="min-h-screen font-[Karla,system-ui,sans-serif]" style={{ background: "#EFF6FF", color: "#1E3A8A" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Karla:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#EFF6FF", borderColor: "#93C5FD" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="h-6 w-6" style={{ color: "#1E3A8A" }} />
            <span className="font-bold text-xl font-[Playfair_Display,serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#1E3A8A", borderColor: "#93C5FD" }}>Hotel</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ background: "#1E3A8A" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Playfair_Display,serif]">
            Gestão hoteleira elegante para mais reservas e menos overbooking
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            De reservas a housekeeping, tudo integrado. Para hotéis, pousadas e resorts que operam com excelência.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ background: "#1E3A8A" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop"
            alt="Quarto de hotel elegante com vista privilegiada"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#93C5FD" }}>
          {[
            { value: "0", label: "Overbookings" },
            { value: "2min", label: "Check-in digital" },
            { value: "100%", label: "Ocupação visível" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#93C5FD" }}>
              <div className="font-bold text-2xl font-[Playfair_Display,serif]" style={{ color: "#1E3A8A" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#1E3A8A" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Playfair_Display,serif]">
            Overbooking, check-in manual, falta de controle financeiro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Reservas conflitantes", desc: "Canais desconectados e overbooking gerando prejuízo e reputação ruim." },
              { title: "Check-in demorado", desc: "Filas no balcão, hóspedes frustrados e avaliações negativas." },
              { title: "Financeiro opaco", desc: "Sem controle de diárias, extras e comissões de canais." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#172554", borderColor: "#93C5FD" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#D97706" }} />
                <h3 className="font-semibold text-lg text-white font-[Playfair_Display,serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Playfair_Display,serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Configure o hotel", desc: "UHs, tarifas, regras e canais de venda em um dia." },
              { step: "2", title: "Receba reservas", desc: "Motor integrado com confirmação automática." },
              { step: "3", title: "Encante hóspedes", desc: "Check-in digital, portal e housekeeping em tempo real." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#1E3A8A" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Playfair_Display,serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#93C5FD" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Playfair_Display,serif]">Recursos para hotelaria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Motor de Reservas", desc: "Disponibilidade em tempo real e gestão de canais.", icon: CalendarCheck },
              { name: "Check-in Digital", desc: "Processo com assinatura, documentos e chave virtual.", icon: LogIn },
              { name: "Gestão de UHs", desc: "Mapa visual de unidades, status e manutenção.", icon: BedDouble },
              { name: "Tarifas Dinâmicas", desc: "Preços por temporada, dia e canais de venda.", icon: DollarSign },
              { name: "Portal do Hóspede", desc: "Reservas, solicitações e room service.", icon: Globe },
              { name: "Housekeeping", desc: "Controle de limpeza e manutenção em tempo real.", icon: Sparkles },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#93C5FD" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#1E3A8A" }} />
                  <h3 className="font-semibold text-base font-[Playfair_Display,serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[Playfair_Display,serif]">Integrado e seguro</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Multi-canal", "Pix integrado", "NFS-e automática", "LGPD", "Relatórios BI"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#93C5FD" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#1E3A8A" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Playfair_Display,serif]">Eleve a experiência do hóspede. Comece agora.</h2>
          <p className="text-base text-white/80 mt-4">Setup rápido. Sem taxas sobre reservas.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ color: "#1E3A8A" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#EFF6FF", borderColor: "#93C5FD" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
