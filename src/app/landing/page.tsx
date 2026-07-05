"use client";

import * as React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg">Hachi</span>
            <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">ERP</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#recursos" className="hover:text-gray-900 transition">Recursos</a>
            <a href="#modulos" className="hover:text-gray-900 transition">Módulos</a>
            <a href="#arquitetura" className="hover:text-gray-900 transition">Tecnologia</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Licenciamento</a>
          </div>
          <a
            href="#contato"
            className="hidden sm:inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition"
          >
            Solicitar Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/40 to-teal-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Enterprise Healthcare Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-[#0B1220]">
            A Plataforma Definitiva para Gestão de{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Comunidades Terapêuticas
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Muito além de um ERP. Uma plataforma corporativa desenvolvida exclusivamente para centros terapêuticos, 
            clínicas de dependência química e instituições de saúde que precisam de controle operacional, 
            financeiro e clínico em um único ambiente.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contato"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B1220] text-white font-medium px-8 py-4 rounded-2xl text-base hover:bg-gray-800 transition shadow-lg shadow-gray-900/10"
            >
              Solicitar Demonstração
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <a
              href="#recursos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-2xl text-base hover:bg-gray-50 transition"
            >
              Ver Recursos
            </a>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "25.000+", label: "Linhas de Código" },
              { value: "57", label: "APIs Integradas" },
              { value: "14", label: "Módulos" },
              { value: "135", label: "Testes Automatizados" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#0B1220]">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-[#0B1220]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            A maioria das comunidades terapêuticas<br />
            <span className="text-gray-400">ainda opera com planilhas, papéis e WhatsApp.</span>
          </h2>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Processos manuais e repetitivos",
              "Prontuários físicos sem rastreabilidade",
              "Cobranças desorganizadas",
              "Baixa rastreabilidade de dados",
              "Ausência de indicadores clínicos",
              "Risco de não conformidade LGPD",
            ].map((problem) => (
              <div
                key={problem}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <p className="text-sm text-gray-300">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Modules Section */}
      <section id="modulos" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Solução Completa</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#0B1220]">
            Tudo conectado em uma única plataforma.
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            14 módulos integrados que cobrem toda a operação de uma comunidade terapêutica — do acolhimento à alta.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              "Prontuário Eletrônico",
              "Gestão Financeira",
              "Portal da Família",
              "Agenda Clínica",
              "Controle de Leitos",
              "Gestão de Estoque",
              "Documentos Inteligentes",
              "WhatsApp Integrado",
              "Dashboard Executivo",
              "Auditoria Completa",
              "Controle de Usuários",
              "LGPD Compliance",
              "Integração PIX",
              "Business Intelligence",
            ].map((mod) => (
              <div
                key={mod}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition cursor-default"
              >
                {mod}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-teal-600 uppercase tracking-wider">Funcionalidades</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#0B1220]">
              Projetado para excelência operacional.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📋",
                title: "Prontuário Eletrônico",
                description: "Registro multidisciplinar completo com 6 tipos de evolução, sinais vitais, assinatura digital irreversível e conformidade com CFM 1.638/2002.",
              },
              {
                icon: "👨‍👩‍👧",
                title: "Portal da Família",
                description: "Interface exclusiva para responsáveis financeiros acompanharem o tratamento em tempo real e realizarem pagamentos via Pix QR Code.",
              },
              {
                icon: "💰",
                title: "Financeiro Inteligente",
                description: "Mensalidades com vencimento personalizado, controle de inadimplência automático, DRE, fluxo de caixa e integração com Pix Sicredi.",
              },
              {
                icon: "⚡",
                title: "Automação Completa",
                description: "Geração de contratos em 30 segundos, envio de cobranças via WhatsApp, notificações de consulta e alertas de estoque baixo.",
              },
              {
                icon: "🔒",
                title: "Segurança Enterprise",
                description: "LGPD nativa, criptografia AES-256-GCM, audit log completo, RBAC com 10 perfis, rate limiting, 2FA e headers de segurança.",
              },
              {
                icon: "☁️",
                title: "Cloud Native",
                description: "100% web, responsivo mobile-first, deploy em Edge Network com 99.9% de disponibilidade, escalável horizontalmente.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100/80 hover:border-gray-200 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-[#0B1220] mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="arquitetura" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Tecnologia</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#0B1220]">
              Arquitetura Enterprise de ponta.
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Construído com as tecnologias mais modernas do ecossistema, garantindo performance, segurança e escalabilidade.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              "Next.js 15",
              "React 19",
              "TypeScript",
              "PostgreSQL",
              "Prisma ORM",
              "JWT (jose)",
              "AES-256-GCM",
              "Edge Computing",
              "Cloud Native",
              "Tailwind CSS",
              "Zod Validation",
              "REST API",
            ].map((tech) => (
              <span
                key={tech}
                className="bg-[#0B1220] text-white text-sm font-medium px-4 py-2 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
          {/* Benefits Grid */}
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Redução de até 80% no tempo operacional",
              "Centralização completa das informações",
              "Maior controle financeiro",
              "Gestão clínica integrada",
              "Automação de processos",
              "Compliance com LGPD",
              "Maior produtividade da equipe",
              "Indicadores em tempo real",
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
                <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentials */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-teal-600 uppercase tracking-wider">Diferenciais</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#0B1220]">
              Por que esta plataforma é diferente?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Especialização Vertical", desc: "Projetada exclusivamente para Comunidades Terapêuticas e clínicas de reabilitação" },
              { title: "Arquitetura Enterprise", desc: "Stack moderna, type-safe, com segurança de nível corporativo em todas as camadas" },
              { title: "Portal Exclusivo para Familiares", desc: "Interface dedicada com autenticação por token e pagamento via Pix integrado" },
              { title: "Prontuário Multidisciplinar", desc: "6 tipos de evolução tipados por disciplina com assinatura digital irreversível" },
              { title: "Automação Documental", desc: "Contratos, receitas e recibos gerados em segundos a partir de templates inteligentes" },
              { title: "Integrações Nativas", desc: "WhatsApp, Pix (Sicredi), NFS-e e e-SUS conectados nativamente" },
              { title: "Multi-unidade Ready", desc: "Arquitetura preparada para escalar para múltiplas unidades com dados isolados" },
              { title: "Pronta para IA", desc: "Modelo de dados estruturado para futura predição de recaída e NLP em evoluções" },
            ].map((diff) => (
              <div key={diff.title} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0B1220]">{diff.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{diff.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-20 px-6 bg-[#0B1220]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Números da Plataforma</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "99.9%", label: "Disponibilidade" },
              { value: "30s", label: "Geração de Contratos" },
              { value: "15min", label: "Processo de Admissão" },
              { value: "100%", label: "Web & Responsivo" },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-3xl md:text-4xl font-bold text-white">{m.value}</div>
                <div className="text-sm text-gray-400 mt-2">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Enterprise Value */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Investimento</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[#0B1220]">
              Licenciamento Enterprise
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Licensing */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0B1220] mb-6">Implantação & Licença</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Licença Inicial</span>
                  <span className="font-semibold text-[#0B1220]">R$ 120.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Implantação Completa</span>
                  <span className="font-semibold text-[#0B1220]">R$ 180.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Enterprise (Multi-unidade)</span>
                  <span className="font-semibold text-[#0B1220]">R$ 350.000+</span>
                </div>
              </div>
              <p className="mt-6 text-xs text-gray-500">
                Valores variam conforme implantação, integrações, treinamento, migração de dados e customizações.
              </p>
            </div>
            {/* Asset Value */}
            <div className="bg-gradient-to-br from-[#0B1220] to-blue-900 rounded-3xl p-8 text-white">
              <h3 className="text-lg font-semibold mb-2">Valor Estimado do Ativo</h3>
              <p className="text-sm text-blue-200 mb-6">
                Considerando propriedade intelectual, arquitetura, documentação técnica, 
                especialização vertical, potencial SaaS e capacidade de comercialização recorrente.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sm text-blue-200">Mínimo</span>
                  <span className="font-bold text-xl">R$ 1.500.000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sm text-blue-200">Estimado</span>
                  <span className="font-bold text-2xl text-teal-400">R$ 3.000.000</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-blue-200">Alto crescimento (SaaS)</span>
                  <span className="font-bold text-xl">R$ 5.000.000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1220]">
            Transforme a gestão da sua instituição.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Solicite uma demonstração personalizada e descubra como digitalizar toda a operação 
            da sua comunidade terapêutica.
          </p>
          <div className="mt-10">
            <a
              href="mailto:contato@hachi.med.br"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold px-10 py-5 rounded-2xl text-lg hover:opacity-90 transition shadow-lg shadow-blue-600/20"
            >
              Agendar Demonstração
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Sem compromisso. Resposta em até 24 horas.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">H</span>
            </div>
            <span className="text-sm text-gray-500">
              Enterprise Healthcare Platform
            </span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Desenvolvido para instituições que exigem excelência operacional. © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
