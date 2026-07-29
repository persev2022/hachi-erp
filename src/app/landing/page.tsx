"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// Lazy load 3D scene — with error fallback so page still works if WebGL fails
const HachiCore3D = dynamic(
  () => import("@/components/landing/hachi-core-3d").catch(() => ({
    default: () => <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50" />,
  })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-emerald-50" />,
  }
);

// ═══════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════
// Palette:
//   Background: #0a0a0f (deep space black)
//   Primary:    #6366f1 (indigo/violet)
//   Accent:     #22d3ee (cyan glow)
//   Surface:    #16161f (dark card)
//   Text:       #f8fafc (white)
//   Muted:      #94a3b8 (slate)
//   Gradient:   #6366f1 → #8b5cf6 → #a855f7

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <div ref={containerRef} className="bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <Nav />

      {/* Hero */}
      <HeroSection scrollProgress={scrollYProgress} />

      {/* Problem */}
      <ProblemSection />

      {/* Solution */}
      <SolutionSection />

      {/* Modules */}
      <ModulesSection />

      {/* AI Section */}
      <AISection />

      {/* Integrations */}
      <IntegrationsSection />

      {/* Security */}
      <SecuritySection />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">HACHI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#modulos" className="text-sm text-gray-500 hover:text-gray-900 transition">Módulos</a>
          <a href="#ia" className="text-sm text-gray-500 hover:text-gray-900 transition">Inteligência</a>
          <a href="#seguranca" className="text-sm text-gray-500 hover:text-gray-900 transition">Segurança</a>
          <a href="#integracoes" className="text-sm text-gray-500 hover:text-gray-900 transition">Integrações</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition">
            Entrar
          </Link>
          <a
            href="#cta"
            className="px-4 py-2 text-sm font-medium rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/25"
          >
            Agendar Demo
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════
function HeroSection({ scrollProgress }: { scrollProgress: any }) {
  const opacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.15], [1, 0.95]);

  return (
    <section className="relative h-screen w-full">
      {/* 3D — absolute, fills entire hero */}
      <div className="absolute inset-0 z-0">
        <HachiCore3D />
      </div>

      {/* Text overlay on top of 3D */}
      <motion.div style={{ opacity, scale }} className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white/80 backdrop-blur-sm mb-6">
            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs text-teal-700 font-medium">Plataforma Inteligente de Gestão</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] drop-shadow-sm"
        >
          <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">Um cérebro.</span>
          <br />
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Toda sua operação.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]"
        >
          O HACHI substitui dezenas de sistemas por uma única plataforma com IA que pensa, automatiza e escala.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
        >
          <a
            href="#cta"
            className="px-8 py-4 text-sm font-semibold rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-all shadow-2xl shadow-teal-600/25 hover:shadow-teal-600/40 hover:scale-105"
          >
            Agendar Demonstração
          </a>
          <a href="#modulos" className="px-8 py-4 text-sm font-medium rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-all">
            Explorar Módulos
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="w-5 h-8 rounded-full border border-gray-300 bg-white/50 backdrop-blur-sm flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-teal-500"
          />
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// PROBLEM SECTION
// ═══════════════════════════════════════════════════════════
function ProblemSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-red-500 mb-4">O PROBLEMA</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
            Sua empresa usa{" "}
            <span className="text-red-500">12 sistemas</span> que não conversam entre si.
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Planilhas, softwares isolados, retrabalho manual. Dados dispersos, decisões no escuro, equipe sobrecarregada.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["ERP separado", "CRM isolado", "Financeiro em planilha", "BI inexistente", "Estoque manual", "Comunicação dispersa", "Relatórios demorados", "Zero automação"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="p-4 rounded-xl border border-red-200 bg-red-50 text-center"
            >
              <p className="text-sm text-red-600 font-medium">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SOLUTION SECTION
// ═══════════════════════════════════════════════════════════
function SolutionSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-teal-600 mb-4">A SOLUÇÃO</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">
            Uma plataforma.{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Inteligência infinita.
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            O HACHI centraliza ERP, CRM, Financeiro, Estoque, BI e Automações em um único ecossistema com IA integrada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Centralizado", desc: "Todos os dados em um lugar. Uma fonte de verdade.", icon: "🎯" },
            { title: "Inteligente", desc: "IA que aprende, sugere e automatiza processos.", icon: "🧠" },
            { title: "Escalável", desc: "Cresce com sua empresa. Do startup à enterprise.", icon: "📈" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-teal-200 transition-all group"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// MODULES SECTION
// ═══════════════════════════════════════════════════════════
function ModulesSection() {
  const modules = [
    { name: "ERP", desc: "Gestão completa da operação", color: "from-teal-500 to-blue-500" },
    { name: "CRM", desc: "Pipeline de vendas inteligente", color: "from-purple-500 to-pink-500" },
    { name: "Financeiro", desc: "Fluxo de caixa e DRE em tempo real", color: "from-emerald-500 to-teal-500" },
    { name: "Estoque", desc: "Controle com previsão de demanda", color: "from-amber-500 to-orange-500" },
    { name: "Analytics", desc: "BI com dashboards interativos", color: "from-cyan-500 to-blue-500" },
    { name: "Automação", desc: "Fluxos inteligentes sem código", color: "from-rose-500 to-red-500" },
    { name: "Comercial", desc: "Propostas e contratos digitais", color: "from-violet-500 to-emerald-500" },
    { name: "Compras", desc: "Procurement automatizado", color: "from-lime-500 to-green-500" },
    { name: "Produção", desc: "Ordens e apontamentos", color: "from-sky-500 to-indigo-500" },
  ];

  return (
    <section id="modulos" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-teal-600 mb-4">MÓDULOS</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Tudo que sua empresa precisa.{" "}
            <span className="text-gray-400">Em um só lugar.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-all overflow-hidden"
            >
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <h3 className="text-lg font-semibold">{mod.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// AI SECTION
// ═══════════════════════════════════════════════════════════
function AISection() {
  return (
    <section id="ia" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50 to-transparent" />
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-teal-600 mb-4">INTELIGÊNCIA ARTIFICIAL</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            IA que não só analisa.{" "}
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Executa.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Previsão de demanda, alertas inteligentes, automação de processos repetitivos e insights acionáveis em tempo real.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Previsão de Receita", desc: "Projeta faturamento com base em histórico e sazonalidade" },
            { title: "Alertas Proativos", desc: "Notifica antes que problemas aconteçam" },
            { title: "Automação Inteligente", desc: "Aprende padrões e automatiza sem configuração manual" },
            { title: "Relatórios Naturais", desc: "Pergunte em linguagem natural. Receba dashboards." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-teal-200 bg-teal-50"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// INTEGRATIONS SECTION
// ═══════════════════════════════════════════════════════════
function IntegrationsSection() {
  return (
    <section id="integracoes" className="py-32 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm font-medium text-teal-500 mb-4">INTEGRAÇÕES</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Conecta com tudo.{" "}
            <span className="text-gray-400">Sem fricção.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            APIs abertas, webhooks, Zapier, WhatsApp, Pix, NF-e, e-commerce. O HACHI se integra ao ecossistema que sua empresa já usa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid grid-cols-3 md:grid-cols-6 gap-4"
        >
          {["WhatsApp", "Pix", "NF-e", "Zapier", "Google", "Stripe", "Slack", "Shopify", "Webhooks", "API REST", "OAuth", "SSO"].map((name, i) => (
            <div key={name} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center justify-center">
              <span className="text-xs text-gray-500 font-medium">{name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// SECURITY SECTION
// ═══════════════════════════════════════════════════════════
function SecuritySection() {
  return (
    <section id="seguranca" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-teal-600 mb-4">SEGURANÇA</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Segurança enterprise.{" "}
            <span className="text-gray-400">Por padrão.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Criptografia E2E", desc: "Dados protegidos em trânsito e em repouso com AES-256" },
            { title: "Multi-tenant", desc: "Isolamento total entre organizações. Zero vazamento." },
            { title: "LGPD Compliance", desc: "Anonimização, exportação de dados e auditoria completa" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-teal-200 bg-teal-50"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════
function CTASection() {
  return (
    <section id="cta" className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50 to-transparent" />
      <div className="max-w-3xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Pronto para centralizar{" "}
            <span className="bg-gradient-to-r from-teal-500 to-purple-400 bg-clip-text text-transparent">
              toda sua operação?
            </span>
          </h2>
          <p className="mt-6 text-lg text-gray-500">
            Agende uma demonstração personalizada e descubra como o HACHI pode transformar sua gestão em 30 minutos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5548999990001?text=Quero%20agendar%20uma%20demonstração%20do%20HACHI"
              target="_blank"
              rel="noopener"
              className="px-10 py-5 text-base font-semibold rounded-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-500 hover:to-emerald-500 transition-all shadow-2xl shadow-teal-600/25 hover:shadow-teal-600/40 hover:scale-105"
            >
              Agendar Demonstração Gratuita
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">Sem compromisso. Sem cartão de crédito.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <span className="font-bold tracking-tight">HACHI</span>
          <span className="text-xs text-gray-400 ml-2">Platform</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#modulos" className="hover:text-gray-900 transition">Módulos</a>
          <a href="#ia" className="hover:text-gray-900 transition">IA</a>
          <a href="#seguranca" className="hover:text-gray-900 transition">Segurança</a>
          <Link href="/login" className="hover:text-gray-900 transition">Login</Link>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Hachi Platform. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
