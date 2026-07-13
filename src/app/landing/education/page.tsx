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

export default function EducationLanding() {
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
            <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">Education</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-cyan-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow orbs */}
          <div className="absolute w-80 h-80 rounded-full top-10 -right-20 will-change-transform" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", animation: "glow 6s ease-in-out infinite", filter: "blur(40px)", transform: `translateY(${scrollY * 0.04}px)` }} />
          <div className="absolute w-64 h-64 rounded-full -bottom-10 -left-10 will-change-transform" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", animation: "glow 8s ease-in-out infinite", animationDelay: "2s", filter: "blur(50px)", transform: `translateY(${scrollY * -0.03}px)` }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPulse 4s ease-in-out infinite" }} />
          {/* Blob */}
          <div className="absolute w-40 h-40 top-1/3 right-1/4 opacity-[0.15] will-change-transform" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(6,182,212,0.1))", animation: "morphBlob 12s ease-in-out infinite", transform: `translateY(${scrollY * 0.05}px)` }} />
          {/* Orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div style={{ animation: "orbit 20s linear infinite" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/30" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Para escolas e cursos
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Conecte escola, alunos e famílias{" "}
              <span className="text-cyan-600">em uma única plataforma.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Matrículas, diário de classe, comunicação com pais e financeiro num sistema que simplifica a gestão escolar.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
                Começar grátis →
              </Link>
            </div>
          </div>

          {/* 3D Mock - Painel Escolar */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="relative transition-transform duration-200 ease-out" style={{ transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg)`, animation: "float 6s ease-in-out infinite" }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <div className="w-3 h-3 rounded-full bg-violet-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-cyan-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-cyan-300">Alunos</p>
                        <p className="text-sm font-bold text-white">342</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-blue-300">Turmas</p>
                        <p className="text-sm font-bold text-white">18</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-300">Adimplência</p>
                        <p className="text-sm font-bold text-white">94%</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 mb-1">Comunicados Recentes</p>
                      <div className="space-y-1">
                        {["Reunião de pais — 15/Mar", "Festa junina — inscrições", "Boletim 1o bimestre"].map((c, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <p className="text-[8px] text-slate-300">{c}</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Matrículas em papel. Pais sem comunicação. Inadimplência crescente.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Matrículas manuais", desc: "Processo lento com papelada, filas e documentos que se perdem." },
              { title: "Comunicação falha", desc: "Bilhetes que não chegam, grupos de WhatsApp caóticos." },
              { title: "Financeiro descontrolado", desc: "Inadimplência sem gestão, boletos manuais e cobranças constrangedoras." },
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
              { step: "1", title: "Configure a escola", desc: "Turmas, disciplinas, professores e calendário em minutos." },
              { step: "2", title: "Digitalize processos", desc: "Matrícula online, diário digital e comunicação integrada." },
              { step: "3", title: "Engaje as famílias", desc: "App para pais com notas, frequência e pagamentos." },
            ].map((s, i) => (
              <div key={s.step} className="text-center" style={{ opacity: solution.visible ? 1 : 0, transform: solution.visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${i * 120}ms` }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">{s.step}</div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Gestão escolar completa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Matrícula Online", desc: "Formulário digital, documentos e contrato assinado online.", color: "cyan" },
              { name: "Diário de Classe", desc: "Frequência, notas e observações num clique.", color: "blue" },
              { name: "Portal do Responsável", desc: "Notas, frequência, comunicados e pagamentos.", color: "violet" },
              { name: "Financeiro Escolar", desc: "Mensalidades, boletos, Pix e controle de inadimplência.", color: "amber" },
              { name: "Comunicação", desc: "Comunicados segmentados, push e confirmação de leitura.", color: "emerald" },
              { name: "Relatórios", desc: "Desempenho por turma, evasão e indicadores pedagógicos.", color: "rose" },
            ].map((f, i) => (
              <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300" style={{ opacity: features.visible ? 1 : 0, transform: features.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 flex items-center justify-center mb-4`}>
                  {i === 0 && <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>}
                  {i === 1 && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>}
                  {i === 2 && <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>}
                  {i === 3 && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                  {i === 4 && <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>}
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
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0891B2 0%, #6366F1 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Educação conectada. Gestão simplificada.
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
