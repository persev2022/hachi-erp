"use client";
import * as React from "react";
import Link from "next/link";

/* ─── Hooks ─── */
function useScrollY() {
  const [scrollY, setScrollY] = React.useState(0);
  React.useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrollY;
}

function useMouseParallax() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

function useScrollReveal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const animations = `
@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes particleFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
@supports (animation-timeline: scroll()) {
  .parallax-scale { animation: scaleIn linear; animation-timeline: scroll(); animation-range: 0% 50%; }
  @keyframes scaleIn { from { transform: scale(0.9); opacity: 0.5; } to { transform: scale(1); opacity: 1; } }
}
`;

export default function ServicesLanding() {
  const mouse = useMouseParallax();
  const scrollY = useScrollY();
  const problem = useScrollReveal();
  const solution = useScrollReveal();
  const features = useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: animations }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Services</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Para prestadores de serviço
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Propostas, contratos e projetos organizados.{" "}
              <span className="text-indigo-600">Receita previsível.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              CRM de clientes, propostas profissionais, controle de projetos e financeiro integrado. Tudo para escalar sua prestação de serviço.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
                Começar grátis →
              </Link>
            </div>
          </div>

          {/* 3D Mock - Pipeline de Projetos */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="relative transition-transform duration-200 ease-out" style={{ transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg)`, animation: "float 6s ease-in-out infinite" }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-indigo-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-indigo-300">Projetos</p>
                        <p className="text-sm font-bold text-white">23</p>
                      </div>
                      <div className="bg-emerald-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-emerald-300">MRR</p>
                        <p className="text-sm font-bold text-white">R$42k</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-300">Propostas</p>
                        <p className="text-sm font-bold text-white">8</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 mb-1">Pipeline</p>
                      <div className="space-y-1">
                        {[
                          { client: "Tech Corp", value: "R$12k", stage: "proposta" },
                          { client: "Startup X", value: "R$8k", stage: "negociação" },
                          { client: "Agency Y", value: "R$15k", stage: "fechado" },
                        ].map((p, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <p className="text-[8px] text-slate-300">{p.client} — {p.value}</p>
                            <span className={`text-[7px] px-1 rounded ${i === 2 ? "bg-emerald-500/20 text-emerald-300" : i === 1 ? "bg-amber-500/20 text-amber-300" : "bg-indigo-500/20 text-indigo-300"}`}>{p.stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-4 bg-slate-800 rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section ref={problem.ref} className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Propostas no Word. Projetos sem rastreio. Cobranças atrasadas.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Propostas amargas", desc: "Horas criando PDFs no Word que o cliente nem abre." },
              { title: "Projetos sem controle", desc: "Escopo que cresce, prazos que estouram e margem que evapora." },
              { title: "Receita imprevisível", desc: "Sem pipeline visível, sem recorrência e meses no vermelho." },
            ].map((p, i) => (
              <div key={p.title} className="rounded-2xl p-6 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm" style={{ opacity: problem.visible ? 1 : 0, transform: problem.visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.6s ease ${i * 150}ms` }}>
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
                <h3 className="font-semibold text-white text-lg">{p.title}</h3>
                <p className="text-sm mt-2 text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section ref={solution.ref} className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {[
              { step: "1", title: "Cadastre clientes", desc: "CRM com histórico, propostas e contratos centralizados." },
              { step: "2", title: "Gerencie projetos", desc: "Escopo, entregas, horas e margem sob controle." },
              { step: "3", title: "Escale receita", desc: "Pipeline visível, recorrência e previsibilidade financeira." },
            ].map((s, i) => (
              <div key={s.step} className="text-center" style={{ opacity: solution.visible ? 1 : 0, transform: solution.visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${i * 120}ms` }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">{s.step}</div>
                <h3 className="font-semibold text-lg mt-5">{s.title}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={features.ref} className="py-28 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tudo para escalar seus serviços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "CRM de Clientes", desc: "Pipeline visual, histórico e follow-up automatizado.", color: "indigo" },
              { name: "Propostas Profissionais", desc: "Templates, assinatura digital e tracking de abertura.", color: "blue" },
              { name: "Gestão de Projetos", desc: "Kanban, entregas, horas e margem por projeto.", color: "violet" },
              { name: "Contratos Digitais", desc: "Geração automática, assinatura eletrônica e renovação.", color: "amber" },
              { name: "Financeiro Recorrente", desc: "Cobrança automática, NFS-e e controle de caixa.", color: "emerald" },
              { name: "Relatórios", desc: "Rentabilidade por cliente, projeção e métricas de vendas.", color: "rose" },
            ].map((f, i) => (
              <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300" style={{ opacity: features.visible ? 1 : 0, transform: features.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 flex items-center justify-center mb-4`}>
                  {i === 0 && <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>}
                  {i === 1 && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>}
                  {i === 2 && <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>}
                  {i === 3 && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>}
                  {i === 4 && <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  {i === 5 && <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>}
                </div>
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Receita previsível começa com organização.
          </h2>
          <p className="text-white/70 mt-4 text-lg">Setup em minutos. 14 dias grátis. Sem contrato.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-xl">
            Começar agora →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">&copy; 2026 Hachi Platform · Business Operating System</p>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Verticais</Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
