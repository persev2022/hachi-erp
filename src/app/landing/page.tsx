"use client";
import * as React from "react";
import Link from "next/link";
import { Spotlight, BeamLine, HeroBadge } from "@/components/landing/animations";

/* ─── Hooks ─────────────────────────────────────────── */
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

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target]);
  return val;
}

/* ─── CSS Animations ────────────────────────────────── */
const animations = `
@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
@keyframes particleFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
@keyframes glow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
@keyframes orbit { 0% { transform: rotate(0deg) translateX(120px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); } }
@keyframes gridPulse { 0%,100% { opacity: 0.03; } 50% { opacity: 0.08; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes morphBlob { 0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; } }
@keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
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

/* ─── Data ──────────────────────────────────────────── */
const verticals = [
  { name: "Recovery", desc: "Comunidades terapêuticas e reabilitação", color: "#0D9488", href: "/landing/recovery" },
  { name: "Clinic", desc: "Clínicas médicas e estética", color: "#3B82F6", href: "/landing/clinic" },
  { name: "Senior", desc: "Instituições de longa permanência", color: "#8B5CF6", href: "/landing/senior" },
  { name: "Hotel", desc: "Hotéis e pousadas", color: "#F59E0B", href: "/landing/hotel" },
  { name: "Restaurant", desc: "Restaurantes e dark kitchens", color: "#EF4444", href: "/landing/restaurant" },
  { name: "Education", desc: "Escolas e cursos", color: "#06B6D4", href: "/landing/education" },
  { name: "Vet", desc: "Clínicas veterinárias e petshops", color: "#10B981", href: "/landing/vet" },
  { name: "Services", desc: "Prestadores de serviço em geral", color: "#6366F1", href: "/landing/services" },
];

const plans = [
  { name: "Starter", price: "R$299", desc: "Para quem está começando a organizar", features: ["Até 50 cadastros", "Financeiro básico", "1 usuário", "Suporte por email"] },
  { name: "Professional", price: "R$599", desc: "Para operações em crescimento", features: ["Cadastros ilimitados", "Todos os módulos", "Até 10 usuários", "Integrações", "Suporte prioritário"], highlight: true },
  { name: "Enterprise", price: "R$1.499", desc: "Para redes e multi-unidades", features: ["Multi-unidade", "API completa", "Usuários ilimitados", "Onboarding dedicado", "SLA 99.9%"] },
];

/* ─── Page Component ────────────────────────────────── */
export default function LandingPage() {
  const mouse = useMouseParallax();
  const scrollY = useScrollY();
  const stats = useScrollReveal();
  const problem = useScrollReveal();
  const solution = useScrollReveal();
  const verts = useScrollReveal();
  const dashboard = useScrollReveal();
  const pricing = useScrollReveal();

  const countCode = useCountUp(36700, stats.visible);
  const countPages = useCountUp(167, stats.visible);
  const countApis = useCountUp(111, stats.visible);
  const countTests = useCountUp(46, stats.visible);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: animations }} />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hachi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-teal-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Strong spotlight — follows cursor */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            background: `radial-gradient(800px circle at ${50 + mouse.x * 30}% ${40 + mouse.y * 20}%, rgba(13,148,136,0.15), transparent 60%)`,
          }}
        />

        {/* Animated gradient mesh bg */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 20% 50%, rgba(13,148,136,0.18) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(245,158,11,0.08) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
          animation: "gradient 12s ease infinite",
        }} />

        {/* Parallax geometric shapes + Glow orbs + Grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated grid background */}
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(13,148,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPulse 4s ease-in-out infinite" }} />

          {/* Glow orbs */}
          <div className="absolute w-96 h-96 rounded-full top-10 -right-32 will-change-transform" style={{ background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", animation: "glow 6s ease-in-out infinite", filter: "blur(40px)", transform: `translateY(${scrollY * 0.04}px)` }} />
          <div className="absolute w-80 h-80 rounded-full -bottom-20 -left-20 will-change-transform" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", animation: "glow 8s ease-in-out infinite", animationDelay: "2s", filter: "blur(50px)", transform: `translateY(${scrollY * -0.03}px)` }} />
          <div className="absolute w-64 h-64 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", animation: "glow 10s ease-in-out infinite", animationDelay: "4s", filter: "blur(60px)" }} />

          {/* Morphing blob */}
          <div className="absolute w-48 h-48 top-1/4 right-1/4 opacity-20 will-change-transform" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.3), rgba(99,102,241,0.2))", animation: "morphBlob 12s ease-in-out infinite", transform: `translateY(${scrollY * 0.06}px)` }} />

          {/* Orbiting element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div style={{ animation: "orbit 25s linear infinite" }}>
              <div className="w-3 h-3 rounded-full bg-teal-400/30 shadow-lg shadow-teal-400/20" />
            </div>
          </div>

          {/* Geometric shapes with scroll parallax */}
          <div className="absolute w-72 h-72 rounded-full border border-teal-500/10 -top-10 -left-20 will-change-transform" style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
          <div className="absolute w-48 h-48 border border-indigo-500/10 rotate-45 top-40 right-10 will-change-transform" style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${45 + scrollY * 0.02}deg)` }} />
          <div className="absolute w-32 h-32 rounded-xl bg-teal-500/5 bottom-20 left-1/3 will-change-transform" style={{ transform: `translateY(${scrollY * -0.08}px) rotate(${12 + scrollY * 0.01}deg)` }} />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full will-change-transform"
              style={{
                width: `${2 + i * 0.8}px`,
                height: `${2 + i * 0.8}px`,
                backgroundColor: `rgba(13,148,136,${0.15 + i * 0.06})`,
                top: `${10 + i * 11}%`,
                left: `${8 + i * 12}%`,
                animation: `particleFloat ${3 + i * 1.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                transform: `translateY(${scrollY * (0.03 + i * 0.02)}px)`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Plataforma #1 para gestão multi-vertical
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pare de perder tempo{" "}
              <span className="text-slate-400">com planilhas.</span>
              <br />
              <span className="bg-clip-text text-transparent bg-[length:200%_auto]" style={{ backgroundImage: "linear-gradient(90deg, #0F4C5C, #0D9488, #D4A373, #0D9488, #0F4C5C)", animation: "gradient-text 4s linear infinite" }}>Automatize toda a sua operação.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              A plataforma que transforma negócios desorganizados em máquinas de eficiência. De comunidades terapêuticas a restaurantes — uma base, infinitas verticais.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="btn-magnetic relative inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/20 to-indigo-400/20 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative">Começar grátis →</span>
              </Link>
              <Link href="#como-funciona" className="btn-magnetic inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-6 py-4 rounded-xl border border-slate-200 transition-all hover:border-teal-300 hover:shadow-md">
                Ver como funciona
              </Link>
            </div>
          </div>

          {/* Right: 3D Dashboard Mock */}
          <div className="relative parallax-scale" style={{ perspective: "1200px" }}>
            <div
              className="relative transition-transform duration-200 ease-out will-change-transform"
              style={{
                transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg) translateY(${Math.max(-40, -scrollY * 0.08)}px)`,
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  {/* Sidebar */}
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-teal-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <div className="w-3 h-3 rounded-full bg-purple-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                  </div>
                  {/* Main */}
                  <div className="flex-1 space-y-3">
                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-teal-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-teal-300">Ativos</p>
                        <p className="text-sm font-bold text-white">36</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-blue-300">Ocupação</p>
                        <p className="text-sm font-bold text-white">87%</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-300">Receita</p>
                        <p className="text-sm font-bold text-white">R$47k</p>
                      </div>
                    </div>
                    {/* Chart bars */}
                    <div className="flex items-end gap-1 h-16">
                      {[40, 60, 35, 80, 55, 70, 45, 90, 65, 75, 50, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-teal-500/40 rounded-sm transition-all duration-500" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    {/* Table rows */}
                    <div className="space-y-1">
                      {[1, 2, 3].map((i) => (
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

      {/* ─── SOCIAL PROOF ─── */}
      <section ref={stats.ref} className="py-20 px-6 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-white">
        {/* Animated beam line top */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
          <div className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-teal-500 to-transparent" style={{ animation: "beam 3s ease-in-out infinite" }} />
        </div>
        <p className="text-center text-sm text-slate-400 mb-10 font-medium tracking-wide uppercase">Confiado por negócios que precisam de organização</p>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { value: countCode.toLocaleString("pt-BR") + "+", label: "Linhas de código" },
            { value: String(countPages), label: "Páginas" },
            { value: "8", label: "Verticais" },
            { value: String(countApis), label: "APIs" },
            { value: "99.9%", label: "Uptime" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="text-center p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300"
              style={{
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                transition: `all 0.5s ease ${i * 100}ms`,
              }}
            >
              <div className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
        {/* Animated beam line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
          <div className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" style={{ animation: "beam 4s ease-in-out infinite", animationDelay: "1.5s" }} />
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section ref={problem.ref} className="py-28 px-6 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", transform: `translateY(${Math.max(-20, -(scrollY - 600) * 0.04)}px)` }}>
            Planilhas. WhatsApp. Caos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Dados perdidos", desc: "Informações espalhadas em 47 planilhas diferentes. Ninguém sabe o que é verdade." },
              { title: "Dinheiro que desaparece", desc: "Cobranças manuais que esquecem. Inadimplência que ninguém rastreia. Caixa no escuro." },
              { title: "Equipe cega", desc: "Sem visibilidade do que está acontecendo. Decisões baseadas em achismo." },
            ].map((p, i) => (
              <div
                key={p.title}
                className="rounded-2xl p-6 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
                style={{
                  opacity: problem.visible ? 1 : 0,
                  transform: problem.visible ? "translateX(0) translateY(0)" : `translateX(${i % 2 === 0 ? "-30px" : "30px"}) translateY(24px)`,
                  transition: `all 0.6s ease ${i * 150}ms`,
                }}
              >
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

      {/* ─── SOLUTION (4 Pillars) ─── */}
      <section ref={solution.ref} id="como-funciona" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", transform: `translateY(${Math.max(-15, -(scrollY - 1200) * 0.03)}px)` }}>
            Um sistema que resolve 4 problemas de uma vez
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              { title: "Operar", desc: "Organize o dia a dia sem esforço. Agenda, tarefas e fluxos automáticos.", color: "teal" },
              { title: "Controlar", desc: "Visibilidade total em tempo real. KPIs, financeiro e ocupação num clique.", color: "blue" },
              { title: "Integrar", desc: "WhatsApp, Pix, fiscal — tudo conectado. Sem copiar e colar entre sistemas.", color: "purple" },
              { title: "Evoluir", desc: "Escale sem reconstruir. Novas unidades, novas verticais, mesma base.", color: "amber" },
            ].map((s, i) => (
              <div
                key={s.title}
                className="card-3d rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
                style={{
                  opacity: solution.visible ? 1 : 0,
                  transform: solution.visible ? `translateY(0) scale(1)` : `translateY(24px) scale(0.95)`,
                  transition: `all 0.5s ease ${i * 100}ms`,
                }}
              >
                {i === 0 && <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>}
                {i === 1 && <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>}
                {i === 2 && <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.915-3.811a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>}
                {i === 3 && <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>}
                <h3 className="font-semibold text-lg mt-3">{s.title}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VERTICALS ─── */}
      <section ref={verts.ref} className="py-28 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            8 mercados. Uma plataforma.
          </h2>
          <p className="text-slate-500 text-center mt-4 text-lg">Cada vertical com módulos específicos. Todas com a mesma base sólida.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
            {verticals.map((v, i) => (
              <Link
                key={v.name}
                href={v.href}
                className="group rounded-xl p-4 bg-white border border-slate-200 hover:shadow-md transition-all duration-300 flex items-center gap-3"
                style={{
                  opacity: verts.visible ? 1 : 0,
                  transform: verts.visible ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.4s ease ${i * 60}ms`,
                  borderLeftColor: v.color,
                  borderLeftWidth: "3px",
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: v.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{v.name}</p>
                  <p className="text-xs text-slate-400 truncate">{v.desc}</p>
                </div>
                <span className="text-slate-300 group-hover:text-teal-500 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD FULL MOCK ─── */}
      <section ref={dashboard.ref} className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Tudo num único painel.
            </h2>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Dashboard em tempo real com KPIs financeiros, ocupação, agenda do dia e alertas. Sem precisar abrir 5 abas diferentes.
            </p>
            <ul className="mt-6 space-y-3">
              {["Visão financeira consolidada", "Ocupação e disponibilidade", "Alertas inteligentes", "Relatórios exportáveis"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ perspective: "1000px" }}>
            <div
              className="transition-transform duration-300 will-change-transform"
              style={{
                transform: `rotateY(${mouse.x * 2}deg) rotateX(${-mouse.y * 2}deg) translateY(${Math.max(-30, -(scrollY - 2000) * 0.05)}px)`,
                opacity: dashboard.visible ? 1 : 0,
                transition: "opacity 0.8s ease, transform 0.3s ease",
              }}
            >
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] text-slate-500">dashboard.hachi.app</span>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-teal-500/20 rounded-lg p-3 text-center">
                    <p className="text-[9px] text-teal-300">Receita</p>
                    <p className="text-base font-bold text-white">R$84k</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                    <p className="text-[9px] text-blue-300">Pacientes</p>
                    <p className="text-base font-bold text-white">1.247</p>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3 text-center">
                    <p className="text-[9px] text-purple-300">Ocupação</p>
                    <p className="text-base font-bold text-white">92%</p>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg p-3 text-center">
                    <p className="text-[9px] text-amber-300">NPS</p>
                    <p className="text-base font-bold text-white">94</p>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-20 mb-3">
                  {[35, 50, 40, 65, 55, 70, 48, 80, 60, 75, 55, 90, 68, 82, 72].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-teal-600/60 to-teal-400/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-5 bg-slate-800 rounded flex items-center px-2 gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                      <div className="flex-1 h-2 bg-slate-700 rounded" />
                      <div className="w-8 h-2 bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section ref={pricing.ref} className="py-28 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Comece grátis. Pague quando crescer.
          </h2>
          <p className="text-slate-500 text-center mt-4">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition-all duration-300 ${
                  plan.highlight
                    ? "bg-white border-teal-200 shadow-lg ring-2 ring-teal-500/20 scale-[1.02]"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                }`}
                style={{
                  opacity: pricing.visible ? 1 : 0,
                  transform: pricing.visible ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.5s ease ${i * 100}ms`,
                }}
              >
                {plan.highlight && (
                  <span className="inline-block text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5 mb-3">
                    Mais popular
                  </span>
                )}
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{plan.desc}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{plan.price}</span>
                  <span className="text-sm text-slate-400">/mês</span>
                </div>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding"
                  className={`mt-6 block text-center py-3 rounded-xl font-medium text-sm transition-all ${
                    plan.highlight
                      ? "bg-slate-900 text-white hover:bg-teal-700 shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Começar grátis
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0D9488 0%, #4F46E5 100%)",
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
        }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sua operação merece ser automática.
          </h2>
          <p className="text-white/70 mt-4 text-lg">Sem cartão. Sem compromisso. 14 dias grátis.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-xl">
            Começar agora →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© 2026 Hachi Platform · Business Operating System</p>
          <div className="flex items-center gap-6">
            <Link href="/landing" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Verticais</Link>
            <Link href="/api" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">API Docs</Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
