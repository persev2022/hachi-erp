"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Algo deu errado</h2>
        <p className="text-sm text-gray-500 mt-2">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-2 font-mono">Código: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 bg-teal-600 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-teal-700 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
