import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Página não encontrada</h2>
        <p className="text-sm text-gray-500 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-teal-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-teal-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
