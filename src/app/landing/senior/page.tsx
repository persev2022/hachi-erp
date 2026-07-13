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
@keyframes glow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.08); } }
@keyframes orbit { 0% { transform: rotate(0deg) translateX(100px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); } }
@keyframes gridPulse { 0%,100% { opacity: 0.03; } 50% { opacity: 0.07; } }
@keyframes morphBlob { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }  }
.card-3d { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.card-3d:hover { transform: perspective(800px) rotateX(-2deg) rotateY(3deg) translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
.btn-magnetic { transition: transform 0.2s ease; }
.btn-magnetic:hover { transform: scale(1.03); }
.btn-magnetic:active { transform: scale(0.97); }
@supports (animation-timeline: scroll()) {
  .parallax-scale { animation: scaleIn linear; animation-timeline: scroll(); animation-range: 0% 50%; }
  @keyframes scaleIn { from { transform: scale(0.9); opacity: 0.5; } to { transform: scale(1); opacity: 1; } }
}
`;

export default function SeniorLanding() {
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
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">Senior</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-violet-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)" }} />
        {/* Parallax Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow orbs */}
          <div className="absolute w-80 h-80 rounded-full top-10 -right-20 will-change-transform" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", animation: "glow 6s ease-in-out infinite", filter: "blur(40px)", transform: `translateY(${scrollY * 0.04}px)` }} />
          <div className="absolute w-64 h-64 rounded-full -bottom-10 -left-10 will-change-transform" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", animation: "glow 8s ease-in-out infinite", animationDelay: "2s", filter: "blur(50px)", transform: `translateY(${scrollY * -0.03}px)` }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPulse 4s ease-in-out infinite" }} />
          {/* Blob */}
          <div className="absolute w-40 h-40 top-1/3 right-1/4 opacity-[0.15] will-change-transform" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))", animation: "morphBlob 12s ease-in-out infinite", transform: `translateY(${scrollY * 0.05}px)` }} />
          {/* Orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div style={{ animation: "orbit 20s linear infinite" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400/30" />
            </div>
          </div>
          <div className="absolute w-72 h-72 rounded-full border border-violet-500/10 top-20 -left-20 will-change-transform" style={{ transform: `translateY(${scrollY * 0.06}px)` }} />
          <div className="absolute w-48 h-48 border border-violet-500/10 rotate-45 top-40 right-10 will-change-transform" style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${45 + scrollY * 0.02}deg)` }} />
          <div className="absolute w-32 h-32 rounded-xl bg-violet-500/5 bottom-40 left-1/3 will-change-transform" style={{ transform: `translateY(${scrollY * -0.08}px) rotate(${12 + scrollY * 0.01}deg)` }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full will-change-transform" style={{
              width: `${3 + i}px`, height: `${3 + i}px`,
              backgroundColor: `rgba(139,92,246,${0.3 + i * 0.08})`,
              top: `${20 + i * 13}%`, left: `${15 + i * 16}%`,
              animation: `particleFloat ${5 + i * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              transform: `translateY(${scrollY * (0.04 + i * 0.025)}px)`,
            }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Para ILPIs e residenciais
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              O cuidado que seus residentes merecem.{" "}
              <span className="text-violet-600">A organização que sua equipe precisa.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Prontuário geriátrico, controle de medicações, portal da família e conformidade ANVISA RDC 502 em uma plataforma.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-violet-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
                Começar grátis →
              </Link>
            </div>
          </div>

          {/* 3D Mock - Mapa de Residentes */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="relative transition-transform duration-200 ease-out" style={{ transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg)`, animation: "float 6s ease-in-out infinite" }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-violet-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-violet-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-violet-300">Residentes</p>
                        <p className="text-sm font-bold text-white">68</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-blue-300">Medicações</p>
                        <p className="text-sm font-bold text-white">245</p>
                      </div>
                      <div className="bg-emerald-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-emerald-300">Satisfação</p>
                        <p className="text-sm font-bold text-white">96%</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 mb-1">Medicações — Próximas 2h</p>
                      <div className="space-y-1">
                        {["14:00 — Maria S. — Losartana 50mg", "14:30 — José P. — Metformina", "15:00 — Ana L. — Omeprazol"].map((m, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                            <p className="text-[8px] text-slate-300">{m}</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Medicações esquecidas. Famílias sem retorno. Equipe sobrecarregada.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Controle de medicações", desc: "Horários perdidos, interações não verificadas e erros de dosagem." },
              { title: "Comunicação com famílias", desc: "Familiares ligam todos os dias pedindo atualizações do residente." },
              { title: "Conformidade regulatória", desc: "Documentação ANVISA e vigilância sanitária desorganizada." },
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
              { step: "1", title: "Configure a ILPI", desc: "Quartos, residentes, equipe e protocolos em minutos." },
              { step: "2", title: "Automatize o cuidado", desc: "Medicações, evoluções e alertas funcionam no piloto automático." },
              { step: "3", title: "Conecte as famílias", desc: "Portal com fotos, atualizações e pagamentos em tempo real." },
            ].map((s, i) => (
              <div key={s.step} className="text-center" style={{ opacity: solution.visible ? 1 : 0, transform: solution.visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${i * 120}ms` }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">{s.step}</div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recursos para ILPIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Prontuário Geriátrico", desc: "Escalas de Barthel, Norton, Mini-Mental e evoluções multidisciplinares.", color: "violet" },
              { name: "Controle de Medicações", desc: "Horários, interações, alertas e checklist de administração.", color: "blue" },
              { name: "Portal da Família", desc: "Fotos, atualizações diárias e pagamentos online.", color: "emerald" },
              { name: "Mapa de Quartos", desc: "Ocupação visual, transferências e manutenção.", color: "amber" },
              { name: "Conformidade ANVISA", desc: "RDC 502, vigilância sanitária e documentação automática.", color: "slate" },
              { name: "Relatórios Gerenciais", desc: "Ocupação, financeiro, indicadores de qualidade e NPS.", color: "rose" },
            ].map((f, i) => (
              <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300" style={{ opacity: features.visible ? 1 : 0, transform: features.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 flex items-center justify-center mb-4`}>
                  {i === 0 && <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>}
                  {i === 1 && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>}
                  {i === 2 && <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>}
                  {i === 3 && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>}
                  {i === 4 && <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>}
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
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Cuidado organizado. Famílias tranquilas.
          </h2>
          <p className="text-white/70 mt-4 text-lg">Setup em minutos. Teste grátis por 14 dias. Sem contrato.</p>
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
