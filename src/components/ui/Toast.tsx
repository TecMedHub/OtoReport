import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-success-subtle border-success-border text-success-text",
    error: "bg-danger-subtle border-danger-border text-danger-text",
    info: "bg-info-subtle border-info-border text-info-text",
  };

  return createElement(
    ToastContext.Provider,
    { value: { toast: addToast } },
    children,
    createElement(
      "div",
      { className: "fixed bottom-4 right-4 z-[100] space-y-2" },
      toasts.map((t) => {
        const Icon = icons[t.type];
        return createElement(
          "div",
          {
            key: t.id,
            className: cn(
              "flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right",
              colors[t.type]
            ),
          },
          createElement(Icon, { size: 16 }),
          createElement("span", { className: "text-sm" }, t.message),
          createElement(
            "button",
            {
              onClick: () => removeToast(t.id),
              className: "ml-2 opacity-60 hover:opacity-100",
            },
            createElement(X, { size: 14 })
          )
        );
      })
    )
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
