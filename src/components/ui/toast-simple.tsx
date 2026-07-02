"use client";
import * as React from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

const ToastContext = React.createContext<{
  show: (message: string, type?: Toast["type"]) => void;
}>({ show: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const show = React.useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        3000
      );
    },
    []
  );

  const colors = {
    success: "bg-emerald-600",
    info: "bg-primary",
    warning: "bg-amber-600",
    error: "bg-red-600",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${colors[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-5 max-w-sm`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
