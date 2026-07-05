"use client";

import * as React from "react";

// Hook: Mouse parallax tracking
function useMouseParallax() {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPosition({ x, y });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

// Hook: Scroll-based reveal
function useScrollReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function LandingPage() {
  const mouse = useMouseParallax();
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    function handleScroll() { setScrollY(window.scrollY); }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafb] text-gray-900 selection:bg-teal-400/30 selection:text-gray-900 overflow-x-hidden">
      {/* Custom Fonts via Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-12px) rotateX(2deg); } }
        @keyframes orbit { 0% { transform: rotate(0deg) translateX(80px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); } }
        @keyframes glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-orbit { animation: orbit 20s linear infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .perspective { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-9 w-9 rounded-lg invert" />
            <span className="font-display font-bold text-lg tracking-tight text-gray-900">hachi</span>
            <span className="text-[10px] font-body font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
              ERP
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-body text-gray-500">
            <a href="#platform" className="hover:text-gray-900 transition-colors">Plataforma</a>
            <a href="#modules" className="hover:text-gray-900 transition-colors">Módulos</a>
            <a href="#tech" className="hover:text-gray-900 transition-colors">Tecnologia</a>
            <a href="#value" className="hover:text-gray-900 transition-colors">Investimento</a>
          </div>
          <a href="#contact" className="bg-gray-900 text-white text-sm font-display font-semibold px-5 py-2 rounded-full hover:bg-teal-600 transition-colors">
            Demo
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-24 px-6 perspective">
        {/* 3D Parallax Geometric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none preserve-3d">
          {/* Layer 1 — far (slow parallax) */}
          <div
            className="absolute top-20 -left-20 w-96 h-96 border-2 border-teal-200/50 rounded-full transition-transform duration-700 ease-out"
            style={{ transform: `translate3d(${mouse.x * 10}px, ${mouse.y * 10}px, -100px) translateY(${scrollY * 0.05}px)` }}
          />
          <div
            className="absolute top-40 right-10 w-72 h-72 border-2 border-blue-200/40 transition-transform duration-700 ease-out"
            style={{ transform: `translate3d(${mouse.x * -15}px, ${mouse.y * -15}px, -80px) rotate(${45 + scrollY * 0.02}deg)` }}
          />

          {/* Layer 2 — mid (medium parallax) */}
          <div
            className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-br from-teal-200/30 to-blue-200/20 rounded-lg transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mouse.x * 25}px, ${mouse.y * 20}px, -50px) rotate(${12 + mouse.x * 5}deg)` }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-32 h-32 border-2 border-purple-200/30 rounded-xl transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mouse.x * -30}px, ${mouse.y * -25}px, -40px) rotate(${-15 + mouse.y * 8}deg)` }}
          />

          {/* Layer 3 — near (fast parallax, glowing dots) */}
          <div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-teal-500 rounded-full animate-glow shadow-lg shadow-teal-400/50 transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${mouse.x * 40}px, ${mouse.y * 40}px, 0px)` }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-glow shadow-lg shadow-blue-400/50 transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${mouse.x * -35}px, ${mouse.y * 35}px, 0px)`, animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-1/3 right-1/5 w-2.5 h-2.5 bg-purple-500 rounded-full animate-glow shadow-lg shadow-purple-400/50 transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${mouse.x * 50}px, ${mouse.y * -30}px, 10px)`, animationDelay: "2s" }}
          />

          {/* Orbiting element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit">
              <div className="w-4 h-4 bg-teal-300/40 rounded-full border-2 border-teal-400/50 shadow-md" />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-body text-xs text-teal-700 uppercase tracking-widest">Enterprise Healthcare Platform</span>
            </div>
          </div>

          {/* Title — Constructivist asymmetry */}
          <div className="text-center">
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
              <span className="block text-gray-900">Gestão</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 mt-1">
                Inteligente
              </span>
            </h1>
            <p className="font-display font-medium text-xl sm:text-2xl md:text-3xl text-gray-400 mt-4">
              para Comunidades Terapêuticas
            </p>
          </div>

          {/* Subtitle */}
          <p className="mt-8 text-center font-body text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Plataforma corporativa exclusiva para CTs — prontuário eletrônico, financeiro, portal da família, 
            integrações e compliance em um único ambiente cloud-native.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gray-900 text-white font-display font-semibold px-8 py-4 rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-gray-900/10">
              Solicitar Demonstração
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#platform" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-display font-medium px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              Explorar Plataforma
            </a>
          </div>

          {/* Stats Bar — 3D tilt on mouse */}
          <div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm transition-transform duration-500 ease-out"
            style={{ transform: `perspective(1000px) rotateX(${mouse.y * -2}deg) rotateY(${mouse.x * 2}deg)` }}
          >
            {[
              { value: "25k+", label: "Linhas de código" },
              { value: "57", label: "APIs integradas" },
              { value: "14", label: "Módulos" },
              { value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={s.label} className={`p-6 md:p-8 text-center ${i > 0 ? "border-l border-gray-200" : ""}`}>
                <div className="font-display font-bold text-2xl md:text-3xl text-gray-900">{s.value}</div>
                <div className="font-body text-xs text-gray-400 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══ */}
      <RevealSection>
      <section className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
            <div>
              <span className="font-body text-xs text-red-400 uppercase tracking-widest">O problema</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-snug">
                Planilhas.<br />
                Papéis.<br />
                <span className="text-gray-300">WhatsApp.</span>
              </h2>
              <p className="font-body text-sm text-gray-500 mt-4 leading-relaxed">
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
                <div key={p} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-red-500/20 transition-colors">
                  <div className="h-1 w-6 bg-red-500/40 rounded-full mb-3" />
                  <p className="font-body text-xs text-gray-600 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ PLATFORM / MODULES ═══ */}
      <RevealSection>
      <section id="platform" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/5 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="font-body text-xs text-teal-600 uppercase tracking-widest">Plataforma completa</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl mt-3">
              Um sistema.<br />Todas as operações.
            </h2>
          </div>

          {/* Module Grid — Constructivist asymmetric */}
          <div id="modules" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card — 3D float */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-teal-500/10 to-blue-500/5 border border-teal-500/20 rounded-2xl p-8 md:p-10 relative overflow-hidden animate-float">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <span className="font-body text-xs text-teal-600 uppercase tracking-widest">Core</span>
              <h3 className="font-display font-bold text-2xl md:text-3xl mt-3">Prontuário Eletrônico</h3>
              <p className="font-body text-sm text-gray-500 mt-3 max-w-md leading-relaxed">
                Registro multidisciplinar com 6 tipos de evolução (médica, psicológica, enfermagem, terapêutica, 
                social, nutricional), sinais vitais, assinatura digital irreversível e conformidade CFM 1.638/2002.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Assinatura Digital", "Sinais Vitais", "PTI", "Timeline", "LGPD"].map((t) => (
                  <span key={t} className="font-body text-[11px] bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full border border-teal-300">{t}</span>
                ))}
              </div>
            </div>

            {/* Small cards */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">💰</span>
              </div>
              <h3 className="font-display font-semibold text-base">Financeiro</h3>
              <p className="font-body text-xs text-gray-400 mt-2 leading-relaxed">Mensalidades, inadimplência, DRE, Pix integrado e conta corrente por paciente.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">👨‍👩‍👧</span>
              </div>
              <h3 className="font-display font-semibold text-base">Portal da Família</h3>
              <p className="font-body text-xs text-gray-400 mt-2 leading-relaxed">Acesso por token, acompanhamento do tratamento e pagamento via QR Code Pix.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">📄</span>
              </div>
              <h3 className="font-display font-semibold text-base">Documentos</h3>
              <p className="font-body text-xs text-gray-400 mt-2 leading-relaxed">Contratos, receitas, recibos e atestados gerados em 30 segundos via templates.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">💬</span>
              </div>
              <h3 className="font-display font-semibold text-base">WhatsApp</h3>
              <p className="font-body text-xs text-gray-400 mt-2 leading-relaxed">Integração BotConversa: cobranças, lembretes e fluxos automatizados.</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/10 flex items-center justify-center mb-4">
                <span className="text-lg">🔒</span>
              </div>
              <h3 className="font-display font-semibold text-base">Segurança</h3>
              <p className="font-body text-xs text-gray-400 mt-2 leading-relaxed">AES-256, RBAC 10 perfis, 2FA, rate limiting, audit log e LGPD compliance.</p>
            </div>
          </div>

          {/* Additional modules pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Agenda Clínica", "Controle de Leitos", "Estoque", "Dashboard BI", "Relatórios", "NFS-e", "e-SUS", "Escalas"].map((m) => (
              <span key={m} className="font-body text-xs bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ TECHNOLOGY ═══ */}
      <RevealSection>
      <section id="tech" className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="font-body text-xs text-blue-400 uppercase tracking-widest">Arquitetura</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-snug">
                Enterprise.<br />
                Cloud Native.<br />
                <span className="text-teal-600">Type-Safe.</span>
              </h2>
              <p className="font-body text-sm text-gray-500 mt-4 leading-relaxed">
                Stack moderna com type safety end-to-end, deploy em Edge Network global, 
                banco serverless e zero-downtime deploys.
              </p>

              {/* Stack Pills */}
              <div className="mt-8 flex flex-wrap gap-2">
                {["Next.js 15", "React 19", "TypeScript 5.7", "Prisma 6", "PostgreSQL 16", "Tailwind CSS", "JWT (jose)", "AES-256-GCM", "Zod", "Vitest"].map((t) => (
                  <span key={t} className="font-body text-[11px] bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Architecture Diagram — Constructivist style */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 font-body text-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-600 font-display font-bold text-[10px]">VE</div>
                  <div>
                    <p className="text-gray-800 font-medium">Vercel Edge Network</p>
                    <p className="text-gray-300">CDN global • Edge Functions • Auto-scaling</p>
                  </div>
                </div>
                <div className="ml-4 border-l border-gray-200 pl-4 space-y-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-[9px]">MW</div>
                    <p className="text-gray-500">Middleware: Auth + RBAC + Rate Limit + CORS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold text-[9px]">API</div>
                    <p className="text-gray-500">57 Route Handlers + Zod Validation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded bg-green-500/20 flex items-center justify-center text-green-600 font-bold text-[9px]">SVC</div>
                    <p className="text-gray-500">Services: Crypto • Audit • Docs • Integrations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 font-display font-bold text-[10px]">DB</div>
                  <div>
                    <p className="text-gray-800 font-medium">Neon PostgreSQL</p>
                    <p className="text-gray-300">Serverless • 14 tabelas • Auto-suspend</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <div className="flex gap-1">
                    <div className="h-6 w-6 rounded bg-green-600/20 flex items-center justify-center text-[9px]">📱</div>
                    <div className="h-6 w-6 rounded bg-blue-600/20 flex items-center justify-center text-[9px]">💳</div>
                    <div className="h-6 w-6 rounded bg-red-600/20 flex items-center justify-center text-[9px]">📋</div>
                  </div>
                  <p className="text-gray-400">WhatsApp • Pix Sicredi • NFS-e</p>
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
              <div key={b.d} className="bg-gradient-to-b from-white/[0.04] to-transparent border border-gray-200 rounded-xl p-5 text-center">
                <div className="font-display font-bold text-2xl text-teal-600">{b.n}</div>
                <p className="font-body text-[11px] text-gray-400 mt-1">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ VALUE / PRICING ═══ */}
      <RevealSection>
      <section id="value" className="py-24 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs text-amber-400 uppercase tracking-widest">Investimento</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">
              Licenciamento Enterprise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pricing Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <h3 className="font-display font-semibold text-lg text-white/90 mb-6">Implantação</h3>
              <div className="space-y-4">
                {[
                  { label: "Licença Inicial", value: "R$ 120.000" },
                  { label: "Implantação Completa", value: "R$ 180.000" },
                  { label: "Enterprise (Multi-unidade)", value: "R$ 350.000+" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-body text-sm text-gray-500">{item.label}</span>
                    <span className="font-display font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="font-body text-[11px] text-gray-300 mt-6">
                Inclui: treinamento, migração de dados, customizações e suporte por 12 meses.
              </p>
            </div>

            {/* Asset Value Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-900/30 to-blue-900/20 border border-teal-500/20 rounded-2xl p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-display font-semibold text-lg text-teal-600 mb-2">Valor do Ativo</h3>
              <p className="font-body text-xs text-gray-400 mb-6">
                Propriedade intelectual, arquitetura enterprise, especialização vertical, 
                potencial SaaS e capacidade de comercialização recorrente.
              </p>
              <div className="space-y-4">
                {[
                  { label: "Mínimo", value: "R$ 1.500.000", highlight: false },
                  { label: "Estimado", value: "R$ 3.000.000", highlight: true },
                  { label: "Alto crescimento", value: "R$ 5.000.000+", highlight: false },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="font-body text-sm text-gray-500">{item.label}</span>
                    <span className={`font-display font-bold ${item.highlight ? "text-teal-600 text-xl" : "text-gray-900"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ CTA ═══ */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Geometric accents */}
          <div className="absolute -top-10 left-0 w-20 h-20 border border-teal-500/10 rotate-45 pointer-events-none" />
          <div className="absolute -bottom-10 right-0 w-16 h-16 border border-blue-500/10 rounded-full pointer-events-none" />

          <h2 className="font-display font-bold text-3xl md:text-5xl leading-snug">
            Transforme a gestão<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">da sua instituição.</span>
          </h2>
          <p className="font-body text-base text-gray-500 mt-4 max-w-xl mx-auto">
            Solicite uma demonstração personalizada e descubra como digitalizar 
            toda a operação da sua comunidade terapêutica.
          </p>
          <div className="mt-10">
            <a
              href="mailto:contato@hachi.med.br"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-display font-bold px-10 py-5 rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20"
            >
              Agendar Demonstração
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <p className="font-body text-xs text-gray-300 mt-6">
            Sem compromisso · Resposta em até 24h · Demo personalizada
          </p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-7 w-7 rounded-md" />
            <span className="font-display text-sm text-gray-500">hachi erp</span>
          </div>
          <p className="font-body text-[11px] text-gray-300 text-center">
            Enterprise Healthcare Platform · Projetado para instituições que exigem excelência operacional · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

// Scroll-reveal wrapper component
function RevealSection({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      }`}
    >
      {children}
    </div>
  );
}
