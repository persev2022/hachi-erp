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

export default function RestaurantLanding() {
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
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Hachi</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Restaurant</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</Link>
            <Link href="/onboarding" className="text-sm font-medium text-white bg-slate-900 hover:bg-red-700 px-5 py-2.5 rounded-xl transition-all shadow-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 50%, rgba(239,68,68,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,158,11,0.1) 0%, transparent 50%)" }} />
        {/* Parallax Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow orbs */}
          <div className="absolute w-80 h-80 rounded-full top-10 -right-20 will-change-transform" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)", animation: "glow 6s ease-in-out infinite", filter: "blur(40px)", transform: `translateY(${scrollY * 0.04}px)` }} />
          <div className="absolute w-64 h-64 rounded-full -bottom-10 -left-10 will-change-transform" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)", animation: "glow 8s ease-in-out infinite", animationDelay: "2s", filter: "blur(50px)", transform: `translateY(${scrollY * -0.03}px)` }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", animation: "gridPulse 4s ease-in-out infinite" }} />
          {/* Blob */}
          <div className="absolute w-40 h-40 top-1/3 right-1/4 opacity-[0.15] will-change-transform" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))", animation: "morphBlob 12s ease-in-out infinite", transform: `translateY(${scrollY * 0.05}px)` }} />
          {/* Orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div style={{ animation: "orbit 20s linear infinite" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/30" />
            </div>
          </div>
          <div className="absolute w-72 h-72 rounded-full border border-red-500/10 top-20 -left-20 will-change-transform" style={{ transform: `translateY(${scrollY * 0.06}px)` }} />
          <div className="absolute w-48 h-48 border border-red-500/10 rotate-45 top-40 right-10 will-change-transform" style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${45 + scrollY * 0.02}deg)` }} />
          <div className="absolute w-32 h-32 rounded-xl bg-red-500/5 bottom-40 left-1/3 will-change-transform" style={{ transform: `translateY(${scrollY * -0.08}px) rotate(${12 + scrollY * 0.01}deg)` }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full will-change-transform" style={{
              width: `${3 + i}px`, height: `${3 + i}px`,
              backgroundColor: `rgba(239,68,68,${0.3 + i * 0.08})`,
              top: `${20 + i * 13}%`, left: `${15 + i * 16}%`,
              animation: `particleFloat ${5 + i * 1.2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              transform: `translateY(${scrollY * (0.04 + i * 0.025)}px)`,
            }} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "pulse-dot 2s infinite" }} />
              Para restaurantes e dark kitchens
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Do pedido ao pagamento em segundos.{" "}
              <span className="text-red-600">Sem erro, sem atraso.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Comanda digital, controle de estoque, PDV integrado e KDS para cozinha. Operação redonda do salão à entrega.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg">
                Começar grátis →
              </Link>
            </div>
          </div>

          {/* 3D Mock - Comanda/Pedidos */}
          <div className="relative" style={{ perspective: "1200px" }}>
            <div className="relative transition-transform duration-200 ease-out" style={{ transform: `rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 3}deg)`, animation: "float 6s ease-in-out infinite" }}>
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl w-full max-w-lg mx-auto">
                <div className="flex gap-3">
                  <div className="w-12 space-y-2 pt-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-red-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-red-300">Pedidos</p>
                        <p className="text-sm font-bold text-white">47</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-amber-300">Ticket Médio</p>
                        <p className="text-sm font-bold text-white">R$68</p>
                      </div>
                      <div className="bg-emerald-500/20 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-emerald-300">Faturamento</p>
                        <p className="text-sm font-bold text-white">R$3.2k</p>
                      </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-[9px] text-slate-400 mb-1">KDS — Cozinha</p>
                      <div className="space-y-1">
                        {[
                          { mesa: "Mesa 4", item: "Risoto Funghi", status: "prep", color: "amber" },
                          { mesa: "Mesa 7", item: "Salmão Grelhado", status: "novo", color: "red" },
                          { mesa: "Mesa 2", item: "Tiramisu", status: "pronto", color: "emerald" },
                        ].map((o, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full bg-${o.color}-400`} />
                              <p className="text-[8px] text-slate-300">{o.mesa} — {o.item}</p>
                            </div>
                            <span className={`text-[7px] px-1 rounded bg-${o.color}-500/20 text-${o.color}-300`}>{o.status}</span>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Pedidos perdidos. Estoque furado. Cozinha no caos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {[
              { title: "Comandas em papel", desc: "Pedidos que se perdem, erros de leitura e atrasos constantes." },
              { title: "Estoque sem controle", desc: "Insumos acabam sem aviso, desperdício invisível e CMV desconhecido." },
              { title: "Fechamento manual", desc: "Horas para fechar o caixa, erros em troco e divergências." },
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
              { step: "1", title: "Configure o cardápio", desc: "Itens, preços, fichas técnicas e impressoras em minutos." },
              { step: "2", title: "Opere sem papel", desc: "Garçom no tablet, KDS na cozinha, pagamento na mesa." },
              { step: "3", title: "Escale com dados", desc: "CMV real, ABC de vendas e relatórios para crescer." },
            ].map((s, i) => (
              <div key={s.step} className="text-center" style={{ opacity: solution.visible ? 1 : 0, transform: solution.visible ? "translateY(0)" : "translateY(24px)", transition: `all 0.5s ease ${i * 120}ms` }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">{s.step}</div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tudo para sua cozinha rodar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Comanda Digital", desc: "Pedidos direto no sistema, sem papel e sem erro.", color: "red" },
              { name: "KDS Cozinha", desc: "Kitchen Display System com tempos e prioridades.", color: "amber" },
              { name: "Controle de Estoque", desc: "Entradas, saídas, CMV e alertas de reposição.", color: "emerald" },
              { name: "PDV Integrado", desc: "Pagamento na mesa, split de conta e fechamento rápido.", color: "blue" },
              { name: "Delivery & QR Code", desc: "Cardápio digital, pedido pelo celular e integrações.", color: "violet" },
              { name: "Ficha Técnica", desc: "Custo real por prato, margem e precificação inteligente.", color: "slate" },
            ].map((f, i) => (
              <div key={f.name} className="group rounded-2xl p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300" style={{ opacity: features.visible ? 1 : 0, transform: features.visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.5s ease ${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-100 flex items-center justify-center mb-4`}>
                  {i === 0 && <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>}
                  {i === 1 && <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/></svg>}
                  {i === 2 && <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>}
                  {i === 3 && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>}
                  {i === 4 && <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/></svg>}
                  {i === 5 && <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"/></svg>}
                </div>
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-sm mt-2 text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #DC2626 0%, #EA580C 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sua cozinha merece tecnologia de verdade.
          </h2>
          <p className="text-white/70 mt-4 text-lg">Sem contrato. 14 dias grátis. Setup em minutos.</p>
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
