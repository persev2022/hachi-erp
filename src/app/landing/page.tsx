import Link from "next/link";
import type { Metadata } from "next";
import {
  Activity, Calendar, Users, FileText, Package, MessageSquare,
  BarChart3, Zap, Globe, Shield, Heart, Building2, Home,
  Hotel, UtensilsCrossed, GraduationCap, Stethoscope, Briefcase,
  ArrowRight, CheckCircle2, Layers, Settings, TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Platform — Sistema Operacional para Negócios",
  description: "Plataforma multi-vertical: prontuário, financeiro, agenda, CRM e automação. 8 verticais em um sistema.",
};

const verticals = [
  { name: "Recovery", desc: "Comunidades Terapêuticas", icon: Activity, href: "/landing/recovery", style: "bg-teal-50 border-teal-200 text-teal-700" },
  { name: "Clinic", desc: "Clínicas Médicas", icon: Heart, href: "/landing/clinic", style: "bg-blue-50 border-blue-200 text-blue-700" },
  { name: "Senior", desc: "ILPIs e Casas de Repouso", icon: Home, href: "/landing/senior", style: "bg-rose-50 border-rose-200 text-rose-700" },
  { name: "Hotel", desc: "Hotelaria e Turismo", icon: Hotel, href: "/landing/hotel", style: "bg-purple-50 border-purple-200 text-purple-700" },
  { name: "Restaurant", desc: "Gastronomia e Delivery", icon: UtensilsCrossed, href: "/landing/restaurant", style: "bg-amber-50 border-amber-200 text-amber-700" },
  { name: "Education", desc: "Escolas e Cursos", icon: GraduationCap, href: "/landing/education", style: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { name: "Vet", desc: "Veterinária e Pet", icon: Stethoscope, href: "/landing/vet", style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  { name: "Services", desc: "Prestadores de Serviço", icon: Briefcase, href: "/landing/services", style: "bg-slate-50 border-slate-200 text-slate-700" },
];

const modules = [
  { name: "Financeiro", icon: BarChart3 }, { name: "Agenda", icon: Calendar },
  { name: "CRM", icon: Users }, { name: "Documentos", icon: FileText },
  { name: "Estoque", icon: Package }, { name: "WhatsApp", icon: MessageSquare },
  { name: "Relatórios", icon: BarChart3 }, { name: "Automação", icon: Zap },
  { name: "Portal", icon: Globe }, { name: "LGPD", icon: Shield },
];

const pillars = [
  { title: "Operar", desc: "Prontuário, agenda, estoque e operação diária simplificados.", icon: Settings },
  { title: "Controlar", desc: "Financeiro, relatórios e indicadores em tempo real.", icon: BarChart3 },
  { title: "Integrar", desc: "WhatsApp, Pix, NFS-e e APIs conectados nativamente.", icon: Layers },
  { title: "Evoluir", desc: "Automação, BI e inteligência para crescer sem complexidade.", icon: TrendingUp },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-7 w-7 text-teal-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]">Hachi</span>
            <span className="hidden sm:inline text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition">Entrar</Link>
            <Link href="/onboarding" className="bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">
            One Platform.<br className="hidden sm:block" /> Infinite Verticals.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            O sistema operacional para negócios que precisam operar, controlar, integrar e evoluir.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#verticals" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:border-teal-300 transition font-[Space_Grotesk,system-ui,sans-serif]">
              Ver Verticais
            </a>
          </div>
          {/* Social Proof */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            {[
              { value: "25.000+", label: "Linhas de código" },
              { value: "104", label: "Páginas" },
              { value: "8", label: "Verticais" },
              { value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={s.label} className={`p-5 md:p-7 text-center ${i > 0 ? "border-l border-gray-200" : ""}`}>
                <div className="font-bold text-2xl text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
                <div className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-white font-[Space_Grotesk,system-ui,sans-serif]">
            Seu negócio ainda funciona com planilhas e WhatsApp?
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Dados espalhados, retrabalho, cobranças manuais e zero visibilidade. Enquanto isso, seus concorrentes operam com sistemas integrados.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]">4 Pilares. Uma Plataforma.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                  <Icon className="h-8 w-8 text-teal-600 mb-3" />
                  <h3 className="font-semibold text-lg text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VERTICALS */}
      <section id="verticals" className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]">8 verticais. Seu negócio encaixa em uma delas.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {verticals.map((v) => {
              const Icon = v.icon;
              return (
                <Link key={v.name} href={v.href} className={`border rounded-2xl p-6 hover:shadow-md transition-all ${v.style}`}>
                  <Icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold text-lg font-[Space_Grotesk,system-ui,sans-serif]">{`Hachi ${v.name}`}</h3>
                  <p className="text-sm mt-1 opacity-80">{v.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 text-center mb-4 font-[Space_Grotesk,system-ui,sans-serif]">10 módulos compartilhados</h2>
          <p className="text-base text-gray-500 text-center mb-14">Todas as verticais incluem esses módulos core.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.name} className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-teal-300 transition">
                  <Icon className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{m.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-gray-900 text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]">Planos que crescem com você</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "R$299", features: ["1 vertical", "5 usuários", "Módulos core", "Suporte email"] },
              { name: "Professional", price: "R$599", features: ["2 verticais", "15 usuários", "Automação", "Suporte prioritário"], featured: true },
              { name: "Enterprise", price: "R$1.499", features: ["Verticais ilimitadas", "Usuários ilimitados", "API completa", "Gerente dedicado"] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.featured ? "bg-teal-600 text-white ring-2 ring-teal-600 scale-105" : "bg-white border border-gray-200"}`}>
                <h3 className={`font-semibold text-lg font-[Space_Grotesk,system-ui,sans-serif] ${plan.featured ? "text-teal-100" : "text-gray-500"}`}>{plan.name}</h3>
                <div className={`font-bold text-3xl mt-2 font-[Space_Grotesk,system-ui,sans-serif] ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.price}<span className="text-sm font-normal">/mês</span></div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.featured ? "text-teal-200" : "text-teal-600"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className={`mt-8 block text-center font-semibold py-3 rounded-xl transition font-[Space_Grotesk,system-ui,sans-serif] ${plan.featured ? "bg-white text-teal-700 hover:bg-teal-50" : "bg-teal-600 text-white hover:bg-teal-700"}`}>
                  Começar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-white font-[Space_Grotesk,system-ui,sans-serif]">
            Crie sua conta em 30 segundos
          </h2>
          <p className="text-base text-gray-400 mt-4">
            Escolha sua vertical, configure seu ambiente e comece a operar hoje. Sem cartão de crédito.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-teal-500 text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-teal-600 transition shadow-lg shadow-teal-500/20 font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">2026 Hachi Platform. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition">Privacidade</a>
            <a href="#" className="hover:text-gray-900 transition">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
