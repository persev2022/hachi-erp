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

export default function ClinicLanding() {
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
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">Clinic</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-cyan-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 50%, rgba(8,145,178,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.1) 0%, transparent 50%)" }} />
        {/* Parallax Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-72 h-72 rounded-full border border-cyan-500/10 top-20 -left-20 will-change-transform" style={{ transform: `translateY(${scrollY * 0.06}px)` }} />
          <div className="absolute w-48 h-48 border border-cyan-500/10 rotate-45 top-40 right-10 will-change-transform" style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${45 + scrollY * 0.02}deg)` }} />
          <div className="absolute w-32 h-32 rounded-xl bg-cyan-500/5 bottom-40 left-1/3 will-change-transform" style={{ transform: `translateY(${scrollY * -0.08}px) rotate(${12 + scrollY * 0.01}deg)` }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full will-change-transform" style={{
              width: `${3 + i}px`, height: `${3 + i}px`,
              backgroundColor: `rgba(8,145,178,${0.3 + i * 0.08})`,
              top: `${20 + i * 13}%`, left: `${15 + i * 16}%`,
              animation: `particleFloat ${5 + i * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              transform: `translateY(${scrollY * (0.04 + i * 0.025)}px)`,
            }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Para clínicas médicas
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Menos tempo no administrativo.{" "}
              <span className="text-cyan-600">Mais tempo com o paciente.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Prontuário, agenda multi-profissional, convênios TISS e teleconsulta numa plataforma que médicos realmente usam.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
                Começar grátis →
              </Link>
            </div>
          </div>

          {/* 3D Mock - Agenda Médica */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="relative transition-transform duration-200 ease-out" style={{ transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg)`, animation: "float 6s ease-in-out infinite" }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-cyan-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-cyan-300">Pacientes</p>
                        <p className="text-sm font-bold text-white">1.247</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-blue-300">Consultas/dia</p>
                        <p className="text-sm font-bold text-white">34</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-300">Receita</p>
                        <p className="text-sm font-bold text-white">R$92k</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 mb-1">Agenda — Hoje</p>
                      <div className="space-y-1">
                        {["09:00 — Dr. Silva — Consulta", "09:30 — Dra. Lima — Retorno", "10:00 — Dr. Silva — Procedimento"].map((a, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <p className="text-[8px] text-slate-300">{a}</p>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(8,145,178,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Agendas em papel. Prontuários perdidos. Convênios sem controle.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Agendamento caótico", desc: "Ligações, conflitos de horário e pacientes esperando sem necessidade." },
              { title: "Prontuário inacessível", desc: "Informação clínica em papel, sem histórico completo na consulta." },
              { title: "Faturamento manual", desc: "Guias TISS preenchidas à mão, glosas constantes e repasses sem controle." },
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
              { step: "1", title: "Configure a clínica", desc: "Profissionais, salas, convênios e horários em minutos." },
              { step: "2", title: "Opere no digital", desc: "Pacientes agendam online, prontuário preenchido na consulta." },
              { step: "3", title: "Cresça com dados", desc: "Relatórios, CRM e automação para fidelizar pacientes." },
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
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Feito para clínicas de verdade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Prontuário Eletrônico", desc: "Anamnese, prescrições, laudos e CID com templates.", color: "cyan" },
              { name: "Agenda Multi-profissional", desc: "6 tipos de agendamento: consulta, retorno, procedimento e mais.", color: "blue" },
              { name: "Convênios TISS", desc: "Faturamento automático com guias TISS e controle de glosas.", color: "violet" },
              { name: "Anamnese Digital", desc: "Formulários que o paciente preenche antes da consulta.", color: "amber" },
              { name: "CRM de Pacientes", desc: "Pipeline de leads, follow-up por WhatsApp e retenção.", color: "green" },
              { name: "Teleconsulta", desc: "Atendimento remoto integrado ao prontuário com gravação.", color: "rose" },
            ].map((f, i) => (
              <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300" style={{ opacity: features.visible ? 1 : 0, transform: features.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 flex items-center justify-center mb-4`}>
                  {i === 0 && <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>}
                  {i === 1 && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>}
                  {i === 2 && <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>}
                  {i === 3 && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>}
                  {i === 4 && <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg>}
                  {i === 5 && <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/></svg>}
                </div>
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0891B2 0%, #4F46E5 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sua clínica no digital em menos de 1 hora.
          </h2>
          <p className="text-white/70 mt-4 text-lg">Sem instalação. Sem contrato de fidelidade. 14 dias grátis.</p>
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
