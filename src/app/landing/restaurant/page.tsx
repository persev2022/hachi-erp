import Link from "next/link";
import type { Metadata } from "next";
import {
  Monitor, ClipboardList, LayoutGrid, Truck, QrCode, Package,
  ArrowRight, UtensilsCrossed, CheckCircle2, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hachi Restaurant — Sistema para Restaurantes e Delivery",
  description: "PDV, comandas digitais, KDS, delivery e cardápio QR Code. Do pedido ao pagamento em um único sistema.",
  keywords: ["sistema restaurante", "PDV restaurante", "comanda digital", "KDS cozinha", "cardápio digital QR"],
};

const features = [
  { name: "PDV Completo", desc: "Ponto de venda com split de pagamento, Pix, cartão e integração fiscal.", icon: Monitor },
  { name: "Comandas Digitais", desc: "Pedidos por mesa, balcão ou delivery com status em tempo real.", icon: ClipboardList },
  { name: "KDS (Kitchen Display)", desc: "Painel de produção para cozinha com priorização e tempos médios.", icon: LayoutGrid },
  { name: "Delivery Integrado", desc: "Gestão de pedidos com rastreamento e integração com marketplaces.", icon: Truck },
  { name: "Cardápio Digital", desc: "QR Code na mesa com fotos, preços e pedido direto sem garçom.", icon: QrCode },
  { name: "Estoque de Insumos", desc: "Fichas técnicas, custo por prato e alertas de reposição automáticos.", icon: Package },
];

export default function RestaurantLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter,system-ui,sans-serif]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-amber-600" />
            <span className="font-bold text-xl font-[Space_Grotesk,system-ui,sans-serif]"><span className="text-amber-600">Hachi</span> Restaurant</span>
          </Link>
          <Link href="/onboarding" className="bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-700 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-5xl text-gray-900 leading-tight font-[Space_Grotesk,system-ui,sans-serif]">
            Do pedido ao pagamento. Tudo no mesmo sistema.
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto">
            PDV, comandas, KDS e delivery integrados para restaurantes que não podem parar.
          </p>
          <div className="mt-8">
            <Link href="/onboarding" className="inline-flex items-center gap-2 bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 font-[Space_Grotesk,system-ui,sans-serif]">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { value: "0", label: "Comandas perdidas" },
              { value: "3x", label: "Mais giro de mesa" },
              { value: "100%", label: "Controle fiscal" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-2xl text-amber-700 font-[Space_Grotesk,system-ui,sans-serif]">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">
            Comandas perdidas, estoque descontrolado, fiscal atrasado
          </h2>
          <p className="mt-4 text-base text-gray-400 max-w-2xl mx-auto">
            Cada erro de comanda é um cliente insatisfeito. Cada nota fiscal atrasada é multa. Seu restaurante pode operar melhor.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Monte o cardápio", desc: "Pratos, fichas técnicas, fotos e preços em minutos." },
              { step: "2", title: "Receba pedidos", desc: "Mesa, balcão, delivery e QR Code — tudo no mesmo fluxo." },
              { step: "3", title: "Produza e entregue", desc: "KDS organiza a cozinha. PDV fecha a conta. Fiscal automático." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mx-auto font-[Space_Grotesk,system-ui,sans-serif]">{s.step}</div>
                <h3 className="font-semibold text-lg mt-4 text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl text-center text-gray-900 mb-12 font-[Space_Grotesk,system-ui,sans-serif]">Recursos para gastronomia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-amber-300 hover:shadow-sm transition">
                  <Icon className="h-8 w-8 text-amber-600 mb-3" />
                  <h3 className="font-semibold text-base text-gray-900 font-[Space_Grotesk,system-ui,sans-serif]">{f.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-2xl text-gray-900 mb-6 font-[Space_Grotesk,system-ui,sans-serif]">Integrações e compliance</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["NFC-e/SAT", "Pix automático", "iFood", "Rappi", "Controle CMV"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-sm bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-amber-700">
        <div className="max-w-3xl mx-auto text-center">
          <Clock className="w-8 h-8 text-amber-200 mx-auto mb-4" />
          <h2 className="font-bold text-2xl md:text-3xl text-white font-[Space_Grotesk,system-ui,sans-serif]">Operação redonda. Cozinha feliz. Cliente satisfeito.</h2>
          <p className="text-base text-amber-100 mt-3">Teste grátis. Sem fidelidade.</p>
          <Link href="/onboarding" className="mt-8 inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition font-[Space_Grotesk,system-ui,sans-serif]">
            Começar grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-gray-100 bg-white text-center">
        <p className="text-sm text-gray-500">Hachi Restaurant — Powered by Hachi Platform</p>
      </footer>
    </div>
  );
}
