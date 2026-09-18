import { Fragment, type ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "left";
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  className,
}: SheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses =
    side === "right"
      ? "right-0 animate-in slide-in-from-right"
      : "left-0 animate-in slide-in-from-left";

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        className={cn(
          "fixed top-0 h-full z-50 w-full max-w-sm md:max-w-md lg:max-w-lg",
          "bg-surface border-y border-border shadow-xl flex flex-col",
          sideClasses,
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
            <div>
              {title && (
                <h2
                  id="sheet-title"
                  className="text-lg font-semibold text-text"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-text-muted">{description}</p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-text-muted hover:text-text p-1 rounded-md hover:bg-surface-muted transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </Fragment>
  );
}
