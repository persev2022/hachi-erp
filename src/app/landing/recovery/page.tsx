/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileHeart, Users, BedDouble, DollarSign, Shield, MessageSquare,
  ArrowRight, CheckCircle2, Activity, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Recovery — Comunidades Terapêuticas",
  description: "Prontuário eletrônico, portal da família e gestão completa para CTs. Conforme ANVISA RDC 29, LGPD e SISNAD.",
  keywords: ["comunidade terapêutica", "prontuário eletrônico CT", "gestão CT", "ANVISA RDC 29", "software reabilitação"],
};

export default function RecoveryLanding() {
  return (
    <div className="min-h-screen font-[Inter,system-ui,sans-serif]" style={{ background: "#F0FDFA", color: "#134E4A" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#F0FDFA", borderColor: "#5EEAD4" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" style={{ color: "#0D9488" }} />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#0D9488", borderColor: "#5EEAD4" }}>Recovery</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ background: "#0D9488" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Gestão digital completa para Comunidades Terapêuticas
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            Prontuário multidisciplinar, portal da família e conformidade ANVISA. Da admissão à alta, tudo num só lugar.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ background: "#0D9488" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop"
            alt="Ambiente natural sereno representando recuperação e cuidado"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#5EEAD4" }}>
          {[
            { value: "30s", label: "Gerar contrato" },
            { value: "15min", label: "Admissão completa" },
            { value: "24/7", label: "Acesso familiar" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#5EEAD4" }}>
              <div className="font-bold text-2xl font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#0D9488" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#134E4A" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Space_Grotesk,system-ui,sans-serif]">
            Prontuários físicos, cobranças manuais, famílias sem informação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Documentação em papel", desc: "Fichas clínicas se perdem, informação inacessível e sem rastreabilidade." },
              { title: "Cobranças manuais", desc: "Mensalidades controladas em planilha, inadimplência sem gestão." },
              { title: "Famílias no escuro", desc: "Ligações constantes pedindo atualização do tratamento." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#0D3D38", borderColor: "#5EEAD4" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#D97706" }} />
                <h3 className="font-semibold text-lg text-white font-[Space_Grotesk,system-ui,sans-serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Cadastre sua CT", desc: "Configure leitos, equipe e regras em minutos." },
              { step: "2", title: "Digitalize a operação", desc: "Prontuários, contratos e cobranças automatizados." },
              { step: "3", title: "Conecte as famílias", desc: "Portal com atualizações e pagamentos em tempo real." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif] text-white" style={{ background: "#0D9488" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Space_Grotesk,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#5EEAD4" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Space_Grotesk,system-ui,sans-serif]">Recursos especializados para CTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Prontuário Multidisciplinar", desc: "Evoluções médicas, psicológicas, sociais e terapêuticas.", icon: FileHeart },
              { name: "Portal da Família", desc: "Familiares acompanham tratamento, pagamentos e comunicados.", icon: Users },
              { name: "Controle de Leitos", desc: "Mapa de ocupação, admissões, altas e transferências.", icon: BedDouble },
              { name: "Financeiro Integrado", desc: "Mensalidades, contratos automáticos e cobrança via Pix.", icon: DollarSign },
              { name: "Conformidade LGPD", desc: "Criptografia AES-256, audit log e consentimento.", icon: Shield },
              { name: "WhatsApp Integrado", desc: "Comunicação automatizada com famílias e cobranças.", icon: MessageSquare },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#5EEAD4" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#0D9488" }} />
                  <h3 className="font-semibold text-base font-[Space_Grotesk,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm mt-2 opacity-70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl mb-8 font-[Space_Grotesk,system-ui,sans-serif]">Conformidade regulatória</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["ANVISA RDC 29", "CFM 1.638", "SISNAD", "LGPD", "COREN", "CRP"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#5EEAD4" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#0D9488" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #0D9488, #2DD4BF)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Comece hoje. Resultado amanhã.</h2>
          <p className="text-base text-white/80 mt-4">Setup em minutos, sem necessidade de TI. Teste grátis.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Space_Grotesk,system-ui,sans-serif]" style={{ color: "#0D9488" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#F0FDFA", borderColor: "#5EEAD4" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
