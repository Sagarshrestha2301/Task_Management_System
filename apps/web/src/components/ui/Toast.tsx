import {
  Fragment,
  type ReactNode,
  createContext,
  useState,
  useContext,
} from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "success" | "danger" | "warning";
  action?: ReactNode;
  onClose: () => void;
}

export function Toast({
  title,
  description,
  variant = "default",
  action,
  onClose,
}: ToastProps) {
  const variants = {
    default: "border-border",
    success: "border-green-300 bg-green-50",
    danger: "border-red-300 bg-red-50",
    warning: "border-amber-300 bg-amber-50",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top duration-200",
        variants[variant],
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text p-1 flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

interface ToastContextValue {
  toasts: Array<ToastProps & { id: string }>;
  addToast: (toast: Omit<ToastProps, "onClose">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (toast: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [
      ...prev,
      { ...toast, id, onClose: () => removeToast(id) },
    ]);
    if (toast.variant !== "danger") {
      setTimeout(() => removeToast(id), 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
