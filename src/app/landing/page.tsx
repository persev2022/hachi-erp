"use client";

import * as React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-teal-400/30 selection:text-white overflow-x-hidden">
      {/* Custom Fonts via Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-bold text-lg tracking-tight">hachi</span>
            <span className="text-[10px] font-body font-medium bg-white/10 text-teal-300 px-2 py-0.5 rounded-full border border-white/10">
              ERP
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-body text-white/60">
            <a href="#platform" className="hover:text-white transition-colors">Plataforma</a>
            <a href="#modules" className="hover:text-white transition-colors">Módulos</a>
            <a href="#tech" className="hover:text-white transition-colors">Tecnologia</a>
            <a href="#value" className="hover:text-white transition-colors">Investimento</a>
          </div>
          <a href="#contact" className="bg-white text-black text-sm font-display font-semibold px-5 py-2 rounded-full hover:bg-teal-300 transition-colors">
            Demo
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Geometric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 border border-white/5 rounded-full" />
          <div className="absolute top-40 right-10 w-72 h-72 border border-teal-500/10 rotate-45" />
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-br from-teal-500/5 to-blue-500/5 rotate-12" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-body text-xs text-white/70 uppercase tracking-widest">Enterprise Healthcare Platform</span>
            </div>
          </div>

          {/* Title — Constructivist asymmetry */}
          <div className="text-center">
            <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95]">
              <span className="block">Gestão</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-blue-400">
                Inteligente
              </span>
              <span className="block text-white/40 text-3xl sm:text-4xl md:text-5xl mt-2 font-medium">
                para Comunidades Terapêuticas
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-8 text-center font-body text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Plataforma corporativa exclusiva para CTs — prontuário eletrônico, financeiro, portal da família, 
            integrações e compliance em um único ambiente cloud-native.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-display font-semibold px-8 py-4 rounded-xl hover:bg-teal-300 transition-all">
              Solicitar Demonstração
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#platform" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm text-white/80 font-display font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all">
              Explorar Plataforma
            </a>
          </div>

          {/* Stats Bar — Constructivist geometric grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            {[
              { value: "25k+", label: "Linhas de código" },
              { value: "57", label: "APIs integradas" },
              { value: "14", label: "Módulos" },
              { value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={s.label} className={`p-6 md:p-8 text-center ${i > 0 ? "border-l border-white/5" : ""}`}>
                <div className="font-display font-bold text-2xl md:text-3xl text-white">{s.value}</div>
                <div className="font-body text-xs text-white/40 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div>
              <span className="font-body text-xs text-red-400 uppercase tracking-widest">O problema</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-tight">
                Planilhas.<br />
                Papéis.<br />
                <span className="text-white/30">WhatsApp.</span>
              </h2>
              <p className="font-body text-sm text-white/50 mt-4 leading-relaxed">
                A maioria das CTs ainda gerencia acolhidos, prontuários e financeiro de forma manual — 
                expondo-se a riscos regulatórios, perda de dados e ineficiência operacional.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Processos manuais e repetitivos",
                "Prontuários sem rastreabilidade",
                "Cobranças desorganizadas",
                "Sem indicadores clínicos",
                "Risco LGPD constante",
                "Comunicação fragmentada",
              ].map((p) => (
                <div key={p} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-red-500/20 transition-colors">
                  <div className="h-1 w-6 bg-red-500/40 rounded-full mb-3" />
                  <p className="font-body text-xs text-white/60 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM / MODULES ═══ */}
      <section id="platform" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="font-body text-xs text-teal-400 uppercase tracking-widest">Plataforma completa</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl mt-3">
              Um sistema.<br />Todas as operações.
            </h2>
          </div>

          {/* Module Grid — Constructivist asymmetric */}
          <div id="modules" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-teal-500/10 to-blue-500/5 border border-teal-500/20 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <span className="font-body text-xs text-teal-400 uppercase tracking-widest">Core</span>
              <h3 className="font-display font-bold text-2xl md:text-3xl mt-3">Prontuário Eletrônico</h3>
              <p className="font-body text-sm text-white/50 mt-3 max-w-md leading-relaxed">
                Registro multidisciplinar com 6 tipos de evolução (médica, psicológica, enfermagem, terapêutica, 
                social, nutricional), sinais vitais, assinatura digital irreversível e conformidade CFM 1.638/2002.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Assinatura Digital", "Sinais Vitais", "PTI", "Timeline", "LGPD"].map((t) => (
                  <span key={t} className="font-body text-[11px] bg-teal-400/10 text-teal-300 px-2.5 py-1 rounded-full border border-teal-400/20">{t}</span>
                ))}
              </div>
            </div>

            {/* Small cards */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">💰</span>
              </div>
              <h3 className="font-display font-semibold text-base">Financeiro</h3>
              <p className="font-body text-xs text-white/40 mt-2 leading-relaxed">Mensalidades, inadimplência, DRE, Pix integrado e conta corrente por paciente.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">👨‍👩‍👧</span>
              </div>
              <h3 className="font-display font-semibold text-base">Portal da Família</h3>
              <p className="font-body text-xs text-white/40 mt-2 leading-relaxed">Acesso por token, acompanhamento do tratamento e pagamento via QR Code Pix.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">📄</span>
              </div>
              <h3 className="font-display font-semibold text-base">Documentos</h3>
              <p className="font-body text-xs text-white/40 mt-2 leading-relaxed">Contratos, receitas, recibos e atestados gerados em 30 segundos via templates.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">💬</span>
              </div>
              <h3 className="font-display font-semibold text-base">WhatsApp</h3>
              <p className="font-body text-xs text-white/40 mt-2 leading-relaxed">Integração BotConversa: cobranças, lembretes e fluxos automatizados.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">🔒</span>
              </div>
              <h3 className="font-display font-semibold text-base">Segurança</h3>
              <p className="font-body text-xs text-white/40 mt-2 leading-relaxed">AES-256, RBAC 10 perfis, 2FA, rate limiting, audit log e LGPD compliance.</p>
            </div>
          </div>

          {/* Additional modules pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Agenda Clínica", "Controle de Leitos", "Estoque", "Dashboard BI", "Relatórios", "NFS-e", "e-SUS", "Escalas"].map((m) => (
              <span key={m} className="font-body text-xs bg-white/5 text-white/50 border border-white/10 px-3 py-1.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECHNOLOGY ═══ */}
      <section id="tech" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="font-body text-xs text-blue-400 uppercase tracking-widest">Arquitetura</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-tight">
                Enterprise.<br />
                Cloud Native.<br />
                <span className="text-teal-400">Type-Safe.</span>
              </h2>
              <p className="font-body text-sm text-white/50 mt-4 leading-relaxed">
                Stack moderna com type safety end-to-end, deploy em Edge Network global, 
                banco serverless e zero-downtime deploys.
              </p>

              {/* Stack Pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {["Next.js 15", "React 19", "TypeScript 5.7", "Prisma 6", "PostgreSQL 16", "Tailwind CSS", "JWT (jose)", "AES-256-GCM", "Zod", "Vitest"].map((t) => (
                  <span key={t} className="font-body text-[11px] bg-white/5 text-white/70 border border-white/10 px-3 py-1.5 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture Diagram — Constructivist style */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 font-body text-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-display font-bold text-[10px]">VE</div>
                  <div>
                    <p className="text-white/80 font-medium">Vercel Edge Network</p>
                    <p className="text-white/30">CDN global • Edge Functions • Auto-scaling</p>
                  </div>
                </div>
                <div className="ml-4 border-l border-white/10 pl-4 space-y-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-[9px]">MW</div>
                    <p className="text-white/50">Middleware: Auth + RBAC + Rate Limit + CORS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-[9px]">API</div>
                    <p className="text-white/50">57 Route Handlers + Zod Validation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-green-500/20 flex items-center justify-center text-green-300 font-bold text-[9px]">SVC</div>
                    <p className="text-white/50">Services: Crypto • Audit • Docs • Integrations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 font-display font-bold text-[10px]">DB</div>
                  <div>
                    <p className="text-white/80 font-medium">Neon PostgreSQL</p>
                    <p className="text-white/30">Serverless • 14 tabelas • Auto-suspend</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="flex gap-1">
                    <div className="h-6 w-6 rounded bg-green-600/20 flex items-center justify-center text-[9px]">📱</div>
                    <div className="h-6 w-6 rounded bg-blue-600/20 flex items-center justify-center text-[9px]">💳</div>
                    <div className="h-6 w-6 rounded bg-red-600/20 flex items-center justify-center text-[9px]">📋</div>
                  </div>
                  <p className="text-white/40">WhatsApp • Pix Sicredi • NFS-e</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { n: "80%", d: "Redução no tempo operacional" },
              { n: "30s", d: "Geração de contratos" },
              { n: "15min", d: "Processo de admissão" },
              { n: "24/7", d: "Acesso familiar ao portal" },
            ].map((b) => (
              <div key={b.d} className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] rounded-xl p-5 text-center">
                <div className="font-display font-bold text-2xl text-teal-400">{b.n}</div>
                <p className="font-body text-[11px] text-white/40 mt-1">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VALUE / PRICING ═══ */}
      <section id="value" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs text-amber-400 uppercase tracking-widest">Investimento</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">
              Licenciamento Enterprise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pricing Card */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
              <h3 className="font-display font-semibold text-lg text-white/90 mb-6">Implantação</h3>
              <div className="space-y-4">
                {[
                  { label: "Licença Inicial", value: "R$ 120.000" },
                  { label: "Implantação Completa", value: "R$ 180.000" },
                  { label: "Enterprise (Multi-unidade)", value: "R$ 350.000+" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="font-body text-sm text-white/50">{item.label}</span>
                    <span className="font-display font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="font-body text-[11px] text-white/30 mt-6">
                Inclui: treinamento, migração de dados, customizações e suporte por 12 meses.
              </p>
            </div>

            {/* Asset Value Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-900/30 to-blue-900/20 border border-teal-500/20 rounded-2xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-display font-semibold text-lg text-teal-300 mb-2">Valor do Ativo</h3>
              <p className="font-body text-xs text-white/40 mb-6">
                Propriedade intelectual, arquitetura enterprise, especialização vertical, 
                potencial SaaS e capacidade de comercialização recorrente.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Mínimo", value: "R$ 1.500.000", highlight: false },
                  { label: "Estimado", value: "R$ 3.000.000", highlight: true },
                  { label: "Alto crescimento", value: "R$ 5.000.000+", highlight: false },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="font-body text-sm text-white/50">{item.label}</span>
                    <span className={`font-display font-bold ${item.highlight ? "text-teal-300 text-xl" : "text-white"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Geometric accents */}
          <div className="absolute -top-10 left-0 w-20 h-20 border border-teal-500/10 rotate-45 pointer-events-none" />
          <div className="absolute -bottom-10 right-0 w-16 h-16 border border-blue-500/10 rounded-full pointer-events-none" />

          <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
            Transforme a gestão<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">da sua instituição.</span>
          </h2>
          <p className="font-body text-base text-white/50 mt-4 max-w-xl mx-auto">
            Solicite uma demonstração personalizada e descubra como digitalizar 
            toda a operação da sua comunidade terapêutica.
          </p>
          <div className="mt-10">
            <a
              href="mailto:contato@hachi.med.br"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-teal-400 to-blue-500 text-black font-display font-bold px-10 py-5 rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20"
            >
              Agendar Demonstração
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <p className="font-body text-xs text-white/30 mt-6">
            Sem compromisso · Resposta em até 24h · Demo personalizada
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-7 w-7 rounded-md opacity-60" />
            <span className="font-display text-sm text-white/40">hachi erp</span>
          </div>
          <p className="font-body text-[11px] text-white/25 text-center">
            Enterprise Healthcare Platform · Projetado para instituições que exigem excelência operacional · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
