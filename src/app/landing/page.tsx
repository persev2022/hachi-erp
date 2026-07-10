/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3, Calendar, Users, FileText, Package, Zap,
  ArrowRight, CheckCircle2, Shield, Building2, AlertTriangle, TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Platform — Business Operating System",
  description: "Plataforma multi-vertical com prontuário, financeiro, agenda, CRM e automação. 8 verticais, um sistema.",
  keywords: ["plataforma multi-vertical", "sistema gestão empresarial", "SaaS brasileiro", "prontuário eletrônico", "gestão clínica"],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-teal-600" />
            <span className="font-semibold text-lg tracking-tight">Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Platform</span>
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
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              8 verticais, uma plataforma
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              O sistema operacional<br className="hidden sm:block" />
              <span className="text-teal-600">do seu negócio.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Financeiro, agenda, CRM, prontuário e automação. Tudo integrado, sem complexidade. Configure em minutos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-teal-600/20">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {/* CSS PRODUCT MOCKUP */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-100/60 to-slate-100/60 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl ring-1 ring-black/5 overflow-hidden">
              <div className="flex">
                {/* Sidebar */}
                <div className="w-14 bg-slate-50 border-r border-slate-100 p-3 flex flex-col gap-3 min-h-[280px]">
                  <div className="w-8 h-8 rounded-lg bg-teal-600" />
                  <div className="mt-4 flex flex-col gap-2.5">
                    <div className="w-8 h-2 rounded bg-slate-300" />
                    <div className="w-8 h-2 rounded bg-teal-200" />
                    <div className="w-8 h-2 rounded bg-slate-200" />
                    <div className="w-8 h-2 rounded bg-slate-200" />
                  </div>
                </div>
                {/* Main content */}
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-24 h-3 rounded bg-slate-200" />
                    <div className="w-16 h-6 rounded-md bg-teal-50 border border-teal-200" />
                  </div>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 p-3 border border-teal-200/50">
                      <div className="text-[10px] text-teal-600 font-medium">Receita</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">R$ 84k</div>
                      <div className="text-[9px] text-teal-600 mt-1 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+12%</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-3 border border-blue-200/50">
                      <div className="text-[10px] text-blue-600 font-medium">Pacientes</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">1.247</div>
                      <div className="text-[9px] text-blue-600 mt-1 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+8%</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 p-3 border border-violet-200/50">
                      <div className="text-[10px] text-violet-600 font-medium">Agendas</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">89</div>
                      <div className="text-[9px] text-violet-600 mt-1">Hoje</div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-3 border border-amber-200/50">
                      <div className="text-[10px] text-amber-600 font-medium">NPS</div>
                      <div className="text-sm font-bold text-slate-800 mt-1">92</div>
                      <div className="text-[9px] text-green-600 mt-1">Excelente</div>
                    </div>
                  </div>
                  {/* Mini table */}
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-slate-50 text-[9px] font-medium text-slate-500">
                      <span>Nome</span><span>Status</span><span>Valor</span><span>Data</span>
                    </div>
                    {[1,2,3].map(i => (
                      <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-slate-50 text-[9px] text-slate-600">
                        <div className="w-14 h-2 rounded bg-slate-200" />
                        <div className="w-10 h-4 rounded-full bg-green-100 border border-green-200" />
                        <div className="w-10 h-2 rounded bg-slate-200" />
                        <div className="w-12 h-2 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 px-6 border-y border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "25.000+", label: "Linhas de código" },
            { value: "105", label: "Páginas" },
            { value: "8", label: "Verticais" },
            { value: "99.9%", label: "Uptime" },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.15),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight">
            Seu negócio ainda funciona assim?
          </h2>
          <p className="text-slate-400 text-center mt-4 text-lg">Complexidade sem necessidade. Dados sem conexão.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Dados espalhados", desc: "Planilhas, WhatsApp e cadernos. Informação duplicada e decisões no escuro." },
              { title: "Retrabalho constante", desc: "Cobranças manuais, relatórios feitos na mão, erros humanos evitáveis." },
              { title: "Zero visibilidade", desc: "Sem indicadores, sem controle financeiro real, sem previsibilidade." },
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
          <p className="text-slate-500 text-center mt-4">Três passos para uma operação digital.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {[
              { step: "1", title: "Escolha sua vertical", desc: "Recovery, Clinic, Senior, Hotel, Restaurant, Education, Vet ou Services." },
              { step: "2", title: "Configure em minutos", desc: "Ambiente pronto com módulos específicos para seu segmento." },
              { step: "3", title: "Opere e cresça", desc: "Financeiro, CRM, automação e relatórios desde o dia um." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">{s.step}</div>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight">Módulos compartilhados</h2>
          <p className="text-slate-500 text-center mt-4">Tudo que seu negócio precisa. Integrado de verdade.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Financeiro", desc: "Contas, cobranças, Pix e fluxo de caixa automatizado.", icon: BarChart3, color: "teal" },
              { name: "Agenda", desc: "Agendamentos, bloqueios e lembretes para equipe e clientes.", icon: Calendar, color: "blue" },
              { name: "CRM", desc: "Pipeline comercial, follow-up e scoring de leads.", icon: Users, color: "violet" },
              { name: "Documentos", desc: "Contratos, prontuários e assinatura digital integrada.", icon: FileText, color: "slate" },
              { name: "Estoque", desc: "Controle de insumos, alertas e custo por operação.", icon: Package, color: "amber" },
              { name: "Automação", desc: "Workflows de cobrança, comunicação e onboarding.", icon: Zap, color: "rose" },
            ].map((f) => {
              const Icon = f.icon;
              const colors: Record<string, string> = { teal: "from-teal-500 to-teal-600", blue: "from-blue-500 to-blue-600", violet: "from-violet-500 to-violet-600", slate: "from-slate-600 to-slate-700", amber: "from-amber-500 to-amber-600", rose: "from-rose-500 to-rose-600" };
              return (
                <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-150 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[f.color]} flex items-center justify-center mb-4`}>
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Segurança e conformidade</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["LGPD Compliant", "Criptografia AES-256", "Audit Log", "Backup diário", "Multi-tenant isolado"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-white border border-slate-200 px-4 py-2 rounded-full text-slate-700 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(13,148,136,0.2),transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Crie sua conta em 30 segundos
          </h2>
          <p className="text-slate-400 mt-4 text-lg">Escolha sua vertical, configure e comece a operar hoje. Sem cartão.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-teal-500/25">
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
