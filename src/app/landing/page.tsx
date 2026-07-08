/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3, Calendar, Users, FileText, Package, MessageSquare,
  Zap, Shield, ArrowRight, CheckCircle2, Layers, Settings,
  TrendingUp, Building2, AlertTriangle, Globe, Lock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Platform — Business Operating System",
  description: "Plataforma multi-vertical com prontuário, financeiro, agenda, CRM e automação. 8 verticais, um sistema.",
  keywords: ["ERP multi-vertical", "sistema gestão empresarial", "SaaS brasileiro", "prontuário eletrônico", "gestão clínica"],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ background: "#F0FDFA", color: "#134E4A" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#F0FDFA", borderColor: "#5EEAD4" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-7 w-7" style={{ color: "#0D9488" }} />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ background: "#F0FDFA", color: "#0D9488", borderColor: "#5EEAD4" }}>Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70" style={{ color: "#134E4A" }}>Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ background: "#0D9488" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#134E4A" }}>
            Um sistema. Oito verticais.<br className="hidden sm:block" /> Resultado real.
          </h1>
          <p className="mt-5 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed opacity-80">
            O sistema operacional para negócios que precisam operar, controlar, integrar e evoluir sem complexidade.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboarding" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ background: "#0D9488" }}>
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop"
            alt="Dashboard de gestão empresarial moderno com métricas e gráficos"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#5EEAD4" }}>
          {[
            { value: "25.000+", label: "Linhas de código" },
            { value: "105", label: "Páginas" },
            { value: "8", label: "Verticais" },
            { value: "99.9%", label: "Uptime" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#5EEAD4" }}>
              <div className="font-bold text-2xl font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#0D9488" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 uppercase tracking-wider opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-20 px-6" style={{ background: "#134E4A" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-white text-center mb-12 font-[Space_Grotesk,system-ui,sans-serif]">
            Seu negócio ainda funciona assim?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Dados espalhados", desc: "Planilhas, WhatsApp e cadernos. Informação duplicada e decisões no escuro.", icon: AlertTriangle },
              { title: "Retrabalho constante", desc: "Cobranças manuais, relatórios feitos na mão, erros humanos evitáveis.", icon: AlertTriangle },
              { title: "Zero visibilidade", desc: "Sem indicadores, sem controle financeiro real, sem previsibilidade.", icon: AlertTriangle },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#0D3D38", borderColor: "#5EEAD4" }}>
                  <Icon className="w-6 h-6 mb-3" style={{ color: "#D97706" }} />
                  <h3 className="font-semibold text-lg text-white font-[Space_Grotesk,system-ui,sans-serif]">{p.title}</h3>
                  <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#134E4A" }}>Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Escolha sua vertical", desc: "Recovery, Clinic, Senior, Hotel, Restaurant, Education, Vet ou Services." },
              { step: "2", title: "Configure em minutos", desc: "Ambiente pronto com módulos específicos para seu segmento." },
              { step: "3", title: "Opere e cresça", desc: "Financeiro, CRM, automação e relatórios desde o dia um." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif] text-white" style={{ background: "#0D9488" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Space_Grotesk,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#5EEAD4" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl md:text-4xl text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#134E4A" }}>Módulos compartilhados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Financeiro", desc: "Contas, cobranças, Pix e fluxo de caixa automatizado.", icon: BarChart3 },
              { name: "Agenda", desc: "Agendamentos, bloqueios e lembretes para equipe e clientes.", icon: Calendar },
              { name: "CRM", desc: "Pipeline comercial, follow-up e scoring de leads.", icon: Users },
              { name: "Documentos", desc: "Contratos, prontuários e assinatura digital integrada.", icon: FileText },
              { name: "Estoque", desc: "Controle de insumos, alertas e custo por operação.", icon: Package },
              { name: "Automação", desc: "Workflows de cobrança, comunicação e onboarding.", icon: Zap },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 hover:border-opacity-100 cursor-pointer" style={{ background: "white", borderColor: "#5EEAD4" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#0D9488" }} />
                  <h3 className="font-semibold text-base font-[Space_Grotesk,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm mt-2 opacity-70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST/COMPLIANCE */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl mb-8 font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#134E4A" }}>Segurança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["LGPD Compliant", "Criptografia AES-256", "Audit Log", "Backup diário", "Multi-tenant isolado"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", color: "#134E4A", borderColor: "#5EEAD4" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#0D9488" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #0D9488, #2DD4BF)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-white font-[Space_Grotesk,system-ui,sans-serif]">
            Crie sua conta em 30 segundos
          </h2>
          <p className="text-base text-white/80 mt-4">
            Escolha sua vertical, configure e comece a operar hoje. Sem cartão de crédito.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-10 py-4 rounded-xl text-lg cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#0D9488" }}>
            Começar grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#F0FDFA", borderColor: "#5EEAD4" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
