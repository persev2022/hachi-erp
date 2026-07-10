import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-lg font-medium text-gray-900 mt-4">
          Página não encontrada
        </p>
        <p className="text-sm text-gray-500 mt-2">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
