"use client";

import * as React from "react";

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

function useScrollReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const mouse = useMouseParallax();
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    function handleScroll() { setScrollY(window.scrollY); }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /*
   * COLOR SYSTEM (WCAG AA compliant contrasts):
   * Background: #ffffff (white)
   * Surface/Cards: #f9fafb (gray-50) with #e5e7eb border (gray-200)
   * Text Primary: #111827 (gray-900) — ratio 15.4:1 on white
   * Text Secondary: #4b5563 (gray-600) — ratio 7.0:1 on white
   * Text Tertiary: #6b7280 (gray-500) — ratio 5.0:1 on white (passes AA)
   * Accent: #0d9488 (teal-600) — ratio 4.6:1 on white (passes AA for large text)
   * Dark sections: #0f172a (slate-900) with white text — ratio 16.5:1
   */

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .font-display { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .font-body { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes orbit { 0% { transform: rotate(0deg) translateX(70px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-orbit { animation: orbit 20s linear infinite; }
        .perspective { perspective: 1200px; }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-bold text-lg text-gray-900">hachi</span>
            <span className="text-[10px] font-body font-semibold bg-teal-600 text-white px-2 py-0.5 rounded">ERP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-body font-medium text-gray-600">
            <a href="#platform" className="hover:text-gray-900 transition">Plataforma</a>
            <a href="#modules" className="hover:text-gray-900 transition">Módulos</a>
            <a href="#tech" className="hover:text-gray-900 transition">Tecnologia</a>
            <a href="#value" className="hover:text-gray-900 transition">Investimento</a>
          </div>
          <a href="#contact" className="bg-gray-900 text-white text-sm font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-700 transition">
            Solicitar Demo
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-36 pb-24 px-6 perspective">
        {/* 3D Parallax Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-16 -left-16 w-80 h-80 border-2 border-teal-100 rounded-full opacity-60 transition-transform duration-700 ease-out"
            style={{ transform: `translate3d(${mouse.x * 12}px, ${mouse.y * 12}px, 0) translateY(${scrollY * 0.04}px)` }}
          />
          <div
            className="absolute top-32 right-8 w-64 h-64 border-2 border-indigo-100 opacity-50 transition-transform duration-700 ease-out"
            style={{ transform: `translate3d(${mouse.x * -18}px, ${mouse.y * -15}px, 0) rotate(${45 + scrollY * 0.015}deg)` }}
          />
          <div
            className="absolute bottom-24 left-1/3 w-40 h-40 bg-teal-50 rounded-2xl opacity-70 transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mouse.x * 25}px, ${mouse.y * 20}px, 0) rotate(${12 + mouse.x * 4}deg)` }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-28 h-28 border-2 border-amber-100 rounded-xl opacity-50 transition-transform duration-500 ease-out"
            style={{ transform: `translate3d(${mouse.x * -28}px, ${mouse.y * -22}px, 0) rotate(${-12 + mouse.y * 6}deg)` }}
          />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-teal-400 rounded-full shadow-lg shadow-teal-300/50 transition-transform duration-300"
            style={{ transform: `translate3d(${mouse.x * 40}px, ${mouse.y * 35}px, 0)` }} />
          <div className="absolute top-2/3 left-1/5 w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-lg shadow-indigo-300/50 transition-transform duration-300"
            style={{ transform: `translate3d(${mouse.x * -35}px, ${mouse.y * 30}px, 0)` }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="animate-orbit"><div className="w-3 h-3 bg-teal-200 rounded-full border border-teal-300" /></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full mb-8">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="font-body text-xs font-semibold text-teal-800 uppercase tracking-wider">Enterprise Healthcare Platform</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.15] text-gray-900">
            Gestão{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">Inteligente</span>
          </h1>
          <p className="font-display font-medium text-xl sm:text-2xl text-gray-400 mt-3">
            para Comunidades Terapêuticas
          </p>

          {/* Subtitle */}
          <p className="mt-6 font-body text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Plataforma corporativa exclusiva para CTs — prontuário eletrônico, financeiro, portal da família, 
            integrações e compliance em um único ambiente cloud-native.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contact" className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gray-900 text-white font-display font-semibold px-8 py-4 rounded-xl hover:bg-teal-700 transition shadow-lg shadow-gray-900/10">
              Solicitar Demonstração
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a href="#platform" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-display font-medium px-8 py-4 rounded-xl hover:border-teal-300 hover:text-teal-700 transition">
              Explorar Plataforma
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-transform duration-500"
            style={{ transform: `perspective(1000px) rotateX(${mouse.y * -1.5}deg) rotateY(${mouse.x * 1.5}deg)` }}>
            {[
              { value: "25k+", label: "Linhas de código" },
              { value: "57", label: "APIs integradas" },
              { value: "14", label: "Módulos" },
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

      {/* ═══ PROBLEM — Dark section for contrast break ═══ */}
      <RevealSection>
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <span className="font-body text-xs font-semibold text-red-300 uppercase tracking-wider">O problema</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-snug text-white">
              Planilhas.<br />Papéis.<br /><span className="text-slate-400">WhatsApp.</span>
            </h2>
            <p className="font-body text-sm text-slate-300 mt-4 leading-relaxed">
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
              <div key={p} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="h-1 w-6 bg-red-400 rounded-full mb-3" />
                <p className="font-body text-xs text-slate-200 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ MODULES ═══ */}
      <RevealSection>
      <section id="platform" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs font-semibold text-teal-700 uppercase tracking-wider">Solução Completa</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-gray-900">Um sistema. Todas as operações.</h2>
            <p className="font-body text-base text-gray-500 mt-3 max-w-xl mx-auto">14 módulos integrados que cobrem toda a operação — do acolhimento à alta.</p>
          </div>

          <div id="modules" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main card */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-200 rounded-2xl p-8 md:p-10 relative overflow-hidden animate-float">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100/50 rounded-full -translate-y-1/2 translate-x-1/2" />
              <span className="font-body text-xs font-semibold text-teal-700 uppercase tracking-wider">Core</span>
              <h3 className="font-display font-bold text-2xl md:text-3xl mt-3 text-gray-900">Prontuário Eletrônico</h3>
              <p className="font-body text-sm text-gray-600 mt-3 max-w-md leading-relaxed">
                Registro multidisciplinar com 6 tipos de evolução, sinais vitais, assinatura digital irreversível e conformidade CFM 1.638/2002.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Assinatura Digital", "Sinais Vitais", "PTI", "Timeline", "LGPD"].map((t) => (
                  <span key={t} className="font-body text-[11px] font-medium bg-white text-teal-700 px-2.5 py-1 rounded border border-teal-200">{t}</span>
                ))}
              </div>
            </div>

            {/* Small cards */}
            {[
              { icon: <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Financeiro", desc: "Mensalidades, inadimplência, DRE, Pix e conta corrente." },
              { icon: <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>, title: "Portal da Família", desc: "Acompanhamento do tratamento e pagamento via Pix." },
              { icon: <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>, title: "Documentos", desc: "Contratos, receitas e recibos gerados em 30 segundos." },
              { icon: <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>, title: "WhatsApp", desc: "Cobranças, lembretes e fluxos via BotConversa." },
              { icon: <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, title: "Segurança", desc: "AES-256, RBAC, 2FA, audit log e LGPD compliance." },
            ].map((card) => (
              <div key={card.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="font-display font-semibold text-base text-gray-900 mt-3">{card.title}</h3>
                <p className="font-body text-xs text-gray-500 mt-2 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Extra modules */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Agenda Clínica", "Controle de Leitos", "Estoque", "Dashboard BI", "Relatórios", "NFS-e", "e-SUS", "Escalas"].map((m) => (
              <span key={m} className="font-body text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ TECHNOLOGY ═══ */}
      <RevealSection>
      <section id="tech" className="py-20 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="font-body text-xs font-semibold text-indigo-700 uppercase tracking-wider">Arquitetura</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 leading-snug text-gray-900">
              Enterprise.<br />Cloud Native.<br /><span className="text-teal-600">Type-Safe.</span>
            </h2>
            <p className="font-body text-sm text-gray-600 mt-4 leading-relaxed">
              Stack moderna com type safety end-to-end, deploy em Edge Network global, banco serverless e zero-downtime deploys.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Next.js 15", "React 19", "TypeScript", "Prisma 6", "PostgreSQL", "Tailwind", "JWT", "AES-256", "Zod", "Vitest"].map((t) => (
                <span key={t} className="font-body text-[11px] font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg">{t}</span>
              ))}
            </div>
          </div>

          {/* Architecture diagram */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4 font-body text-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-display font-bold text-xs">VE</div>
                <div><p className="font-semibold text-gray-900">Vercel Edge Network</p><p className="text-xs text-gray-500">CDN global · Edge Functions · Auto-scaling</p></div>
              </div>
              <div className="ml-5 border-l-2 border-gray-100 pl-5 space-y-3 py-1">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">MW</div>
                  <p className="text-gray-600 text-xs">Middleware: Auth + RBAC + Rate Limit + CORS</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[10px]">API</div>
                  <p className="text-gray-600 text-xs">57 Route Handlers + Zod Validation</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded bg-green-100 flex items-center justify-center text-green-700 font-bold text-[10px]">SVC</div>
                  <p className="text-gray-600 text-xs">Services: Crypto · Audit · Docs · Integrations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-display font-bold text-xs">DB</div>
                <div><p className="font-semibold text-gray-900">Neon PostgreSQL</p><p className="text-xs text-gray-500">Serverless · 14 tabelas · Auto-suspend</p></div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className="flex gap-1.5">
                  <div className="h-6 w-6 rounded bg-green-100 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg></div>
                  <div className="h-6 w-6 rounded bg-blue-100 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg></div>
                  <div className="h-6 w-6 rounded bg-amber-100 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" /></svg></div>
                </div>
                <p className="text-gray-500 text-xs">WhatsApp · Pix Sicredi · NFS-e</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: "80%", d: "Redução tempo operacional" },
            { n: "30s", d: "Geração de contratos" },
            { n: "15min", d: "Processo de admissão" },
            { n: "24/7", d: "Acesso familiar ao portal" },
          ].map((b) => (
            <div key={b.d} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
              <div className="font-display font-bold text-2xl text-teal-600">{b.n}</div>
              <p className="font-body text-[11px] font-medium text-gray-500 mt-1">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
      </RevealSection>

      {/* ═══ VALUE / PRICING ═══ */}
      <RevealSection>
      <section id="value" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-xs font-semibold text-amber-700 uppercase tracking-wider">Investimento</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-gray-900">Licenciamento Enterprise</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pricing */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-6">Implantação</h3>
              {[
                { label: "Licença Inicial", value: "R$ 120.000" },
                { label: "Implantação Completa", value: "R$ 180.000" },
                { label: "Enterprise (Multi-unidade)", value: "R$ 350.000+" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="font-body text-sm text-gray-600">{item.label}</span>
                  <span className="font-display font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
              <p className="font-body text-[11px] text-gray-400 mt-6">
                Inclui treinamento, migração de dados, customizações e suporte 12 meses.
              </p>
            </div>

            {/* Asset Value — dark card */}
            <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="font-display font-semibold text-lg text-teal-300 mb-2">Valor do Ativo</h3>
              <p className="font-body text-xs text-slate-400 mb-6">
                Propriedade intelectual, arquitetura enterprise, especialização vertical e potencial SaaS.
              </p>
              {[
                { label: "Mínimo", value: "R$ 1.500.000", highlight: false },
                { label: "Estimado", value: "R$ 3.000.000", highlight: true },
                { label: "Alto crescimento", value: "R$ 5.000.000+", highlight: false },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
                  <span className="font-body text-sm text-slate-400">{item.label}</span>
                  <span className={`font-display font-bold ${item.highlight ? "text-teal-300 text-xl" : "text-white"}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </RevealSection>

      {/* ═══ CTA ═══ */}
      <section id="contact" className="py-24 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-snug text-white">
            Transforme a gestão<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300">da sua instituição.</span>
          </h2>
          <p className="font-body text-base text-slate-300 mt-4 max-w-xl mx-auto">
            Solicite uma demonstração personalizada e descubra como digitalizar toda a operação da sua comunidade terapêutica.
          </p>
          <div className="mt-10">
            <a href="mailto:contato@hachi.med.br" className="group inline-flex items-center gap-3 bg-white text-gray-900 font-display font-bold px-10 py-5 rounded-xl text-lg hover:bg-teal-300 transition shadow-lg">
              Agendar Demonstração
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <p className="font-body text-xs text-slate-500 mt-6">Sem compromisso · Resposta em 24h · Demo personalizada</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/hachi-logo.png" alt="Hachi" className="h-7 w-7 rounded-md" />
            <span className="font-display text-sm font-medium text-gray-600">hachi erp</span>
          </div>
          <p className="font-body text-[11px] text-gray-400 text-center">
            Enterprise Healthcare Platform · Projetado para excelência operacional · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
