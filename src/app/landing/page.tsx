"use client";

import Link from "next/link";
import {
  Activity, Calendar, Users, FileText, Package, MessageSquare,
  BarChart3, Zap, Globe, Shield, Heart, Building2, Home,
  Hotel, UtensilsCrossed, GraduationCap, Stethoscope, Briefcase
} from "lucide-react";

const verticals = [
  { name: "Recovery", desc: "CTs e Reabilitação", color: "teal", icon: Activity, href: "/landing/recovery" },
  { name: "Clinic", desc: "Clínicas Médicas", color: "blue", icon: Heart, href: "/landing/clinic" },
  { name: "Senior", desc: "ILPIs e Casas de Repouso", color: "rose", icon: Home, href: "/landing/senior" },
  { name: "Hotel", desc: "Hotelaria e Turismo", color: "purple", icon: Hotel, href: "/landing/hotel" },
  { name: "Restaurant", desc: "Gastronomia e Delivery", color: "amber", icon: UtensilsCrossed, href: "/landing/restaurant" },
  { name: "Education", desc: "Escolas e Cursos", color: "indigo", icon: GraduationCap, href: "/landing/education" },
  { name: "Vet", desc: "Veterinária", color: "green", icon: Stethoscope, href: "/landing/vet" },
  { name: "Services", desc: "Prestadores de Serviço", color: "gray", icon: Briefcase, href: "/landing/services" },
];

const colorMap: Record<string, string> = {
  teal: "bg-teal-50 border-teal-200 text-teal-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  rose: "bg-rose-50 border-rose-200 text-rose-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  green: "bg-green-50 border-green-200 text-green-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
};

const modules = [
  { name: "Financeiro", icon: BarChart3 },
  { name: "Agenda", icon: Calendar },
  { name: "CRM", icon: Users },
  { name: "Documentos", icon: FileText },
  { name: "Estoque", icon: Package },
  { name: "Comunicação (WhatsApp)", icon: MessageSquare },
  { name: "Relatórios (BI)", icon: BarChart3 },
  { name: "Automação", icon: Zap },
  { name: "Portal", icon: Globe },
  { name: "Segurança (LGPD)", icon: Shield },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-teal-600" />
            <span className="font-display font-bold text-xl text-gray-900">Hachi Platform</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-body font-medium text-gray-600">
            <a href="#verticals" className="hover:text-gray-900 transition">Verticais</a>
            <a href="#modules" className="hover:text-gray-900 transition">Módulos</a>
            <a href="#tech" className="hover:text-gray-900 transition">Tecnologia</a>
          </div>
          <Link href="/onboarding" className="bg-teal-600 text-white text-sm font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-700 transition">
            Começar Agora
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full mb-8">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-body text-xs font-semibold text-teal-800 uppercase tracking-wider">Business Operating System</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl tracking-tight leading-[1.1] text-gray-900">
            Hachi Platform
          </h1>
          <p className="font-display font-medium text-xl sm:text-2xl text-gray-400 mt-3">
            Business Operating System
          </p>

          <p className="mt-6 font-body text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Uma plataforma. Infinitas verticais de negócio. Prontuário, financeiro, agenda, CRM, automação e inteligência em um único sistema multi-tenant.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-display font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20">
              Começar Agora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <a href="#verticals" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-display font-medium px-8 py-4 rounded-xl hover:border-teal-300 hover:text-teal-700 transition">
              Ver Verticais
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            {[
              { value: "25k+", label: "Linhas de código" },
              { value: "104", label: "Páginas" },
              { value: "8", label: "Verticais" },
              { value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={s.label} className={`p-6 md:p-8 text-center ${i > 0 ? "border-l border-gray-200" : ""}`}>
                <div className="font-display font-bold text-2xl md:text-3xl text-gray-900">{s.value}</div>
                <div className="font-body text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section id="verticals" className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs font-semibold text-teal-700 uppercase tracking-wider">Verticais</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-gray-900">8 verticais. Uma plataforma.</h2>
            <p className="font-body text-base text-gray-500 mt-3 max-w-xl mx-auto">Cada vertical adapta a plataforma às necessidades específicas do seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verticals.map((v) => {
              const Icon = v.icon;
              return (
                <Link
                  key={v.name}
                  href={v.href}
                  className={`border rounded-2xl p-6 hover:shadow-md transition-all ${colorMap[v.color]}`}
                >
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="font-display font-semibold text-lg">{`Hachi ${v.name}`}</h3>
                  <p className="font-body text-sm mt-1 opacity-80">{v.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE MODULES */}
      <section id="modules" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs font-semibold text-teal-700 uppercase tracking-wider">Módulos Core</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-gray-900">Módulos compartilhados por todas as verticais</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-teal-300 transition">
                  <Icon className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <p className="font-body text-sm font-medium text-gray-700">{m.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section id="tech" className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <span className="font-body text-xs font-semibold text-indigo-700 uppercase tracking-wider">Stack</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-gray-900">Tecnologia de ponta</h2>
          <p className="font-body text-base text-gray-500 mt-3 max-w-xl mx-auto">Arquitetura enterprise, cloud-native, type-safe end-to-end.</p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Prisma", "JWT", "AES-256", "Edge Computing"].map((t) => (
              <span key={t} className="font-body text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-teal-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">
            Crie sua conta em 30 segundos
          </h2>
          <p className="font-body text-base text-teal-100 mt-4 max-w-xl mx-auto">
            Escolha sua vertical, configure seu ambiente e comece a operar hoje.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-teal-700 font-display font-bold px-10 py-4 rounded-xl text-lg hover:bg-teal-50 transition shadow-lg">
            Começar Agora
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-body text-sm text-gray-500">
            © 2026 Hachi Platform · Business Operating System
          </p>
        </div>
      </footer>
    </div>
  );
}
