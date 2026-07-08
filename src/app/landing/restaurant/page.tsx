/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import {
  Monitor, ClipboardList, LayoutGrid, Truck, QrCode, Package,
  ArrowRight, UtensilsCrossed, CheckCircle2, AlertTriangle
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Restaurant — Sistema para Restaurantes",
  description: "PDV, comandas digitais, KDS, delivery e cardápio QR Code. Do pedido ao pagamento em um único sistema.",
  keywords: ["sistema restaurante", "PDV restaurante", "comanda digital", "KDS cozinha", "cardápio digital QR"],
};

export default function RestaurantLanding() {
  return (
    <div className="min-h-screen font-[Karla,system-ui,sans-serif]" style={{ background: "#FFF7ED", color: "#7C2D12" }}>
      {/* FONT */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Karla:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "#FFF7ED", borderColor: "#FDBA74" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" style={{ color: "#EA580C" }} />
            <span className="font-bold text-xl font-[Playfair_Display,serif]">Hachi</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold border" style={{ color: "#EA580C", borderColor: "#FDBA74" }}>Restaurant</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium cursor-pointer transition-all duration-200 hover:opacity-70">Entrar</Link>
            <Link href="/onboarding" className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ background: "#EA580C" }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl leading-tight font-[Playfair_Display,serif]">
            Do pedido ao pagamento. Tudo no mesmo sistema.
          </h1>
          <p className="mt-5 text-lg max-w-2xl mx-auto opacity-80">
            PDV, comandas, KDS e delivery integrados para restaurantes que não podem parar.
          </p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ background: "#EA580C" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop"
            alt="Interior de restaurante sofisticado com iluminação ambiente"
            loading="lazy"
            className="mt-12 rounded-2xl shadow-2xl max-w-4xl mx-auto w-full h-auto"
          />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 rounded-2xl border overflow-hidden" style={{ background: "white", borderColor: "#FDBA74" }}>
          {[
            { value: "0", label: "Comandas perdidas" },
            { value: "3x", label: "Mais giro de mesa" },
            { value: "100%", label: "Controle fiscal" },
          ].map((s, i) => (
            <div key={s.label} className={`p-6 text-center ${i > 0 ? "border-l" : ""}`} style={{ borderColor: "#FDBA74" }}>
              <div className="font-bold text-2xl font-[Playfair_Display,serif]" style={{ color: "#EA580C" }}>{s.value}</div>
              <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6" style={{ background: "#7C2D12" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bold text-3xl text-white text-center mb-12 font-[Playfair_Display,serif]">
            Comandas perdidas, estoque descontrolado, fiscal atrasado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Comandas no papel", desc: "Erros de pedido, clientes insatisfeitos e prejuízo operacional." },
              { title: "Estoque invisível", desc: "Sem ficha técnica, CMV descontrolado e desperdício constante." },
              { title: "Fiscal manual", desc: "Notas atrasadas, multas e fechamento de caixa no escuro." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 border" style={{ background: "#5C1D0A", borderColor: "#FDBA74" }}>
                <AlertTriangle className="w-6 h-6 mb-3" style={{ color: "#FBBF24" }} />
                <h3 className="font-semibold text-lg text-white font-[Playfair_Display,serif]">{p.title}</h3>
                <p className="text-sm mt-2 text-gray-300">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Playfair_Display,serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Monte o cardápio", desc: "Pratos, fichas técnicas, fotos e preços em minutos." },
              { step: "2", title: "Receba pedidos", desc: "Mesa, balcão, delivery e QR Code no mesmo fluxo." },
              { step: "3", title: "Produza e entregue", desc: "KDS organiza a cozinha. PDV fecha a conta." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center mx-auto text-white" style={{ background: "#EA580C" }}>{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 font-[Playfair_Display,serif]">{s.title}</h3>
                <p className="text-sm mt-2 opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 border-t" style={{ borderColor: "#FDBA74" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-3xl text-center mb-14 font-[Playfair_Display,serif]">Recursos para gastronomia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "PDV Completo", desc: "Split de pagamento, Pix, cartão e integração fiscal.", icon: Monitor },
              { name: "Comandas Digitais", desc: "Pedidos por mesa, balcão ou delivery em tempo real.", icon: ClipboardList },
              { name: "KDS (Kitchen Display)", desc: "Painel de produção com priorização e tempos.", icon: LayoutGrid },
              { name: "Delivery Integrado", desc: "Gestão com rastreamento e integração marketplaces.", icon: Truck },
              { name: "Cardápio Digital", desc: "QR Code na mesa com fotos e pedido direto.", icon: QrCode },
              { name: "Estoque de Insumos", desc: "Fichas técnicas, custo por prato e alertas.", icon: Package },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="rounded-2xl p-6 border transition-all duration-200 cursor-pointer" style={{ background: "white", borderColor: "#FDBA74" }}>
                  <Icon className="h-8 w-8 mb-3" style={{ color: "#EA580C" }} />
                  <h3 className="font-semibold text-base font-[Playfair_Display,serif]">{f.name}</h3>
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
          <h2 className="font-bold text-2xl mb-8 font-[Playfair_Display,serif]">Integrações e compliance</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["NFC-e/SAT", "Pix automático", "iFood", "Rappi", "Controle CMV"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-full" style={{ background: "white", borderColor: "#FDBA74" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#EA580C" }} /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #EA580C, #FB923C)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl text-white font-[Playfair_Display,serif]">Operação redonda. Cozinha feliz. Cliente satisfeito.</h2>
          <p className="text-base text-white/80 mt-4">Teste grátis. Sem fidelidade.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 font-[Karla,system-ui,sans-serif]" style={{ color: "#EA580C" }}>
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t" style={{ background: "#FFF7ED", borderColor: "#FDBA74" }}>
        <p className="text-sm text-center opacity-70">&copy; 2026 Hachi Platform &middot; Business Operating System</p>
      </footer>
    </div>
  );
}
