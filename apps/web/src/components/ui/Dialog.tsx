import {
  Fragment,
  type ReactNode,
  createContext,
  useState,
  useContext,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  variant?: "destructive" | "ghost";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  action,
  cancelText = "Cancel",
  confirmText = "Confirm",
  onConfirm,
  variant = "ghost",
}: DialogProps) {
  if (!open) return null;

  return (
    <Fragment>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg bg-surface border border-border shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-text">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text p-1 rounded-md hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {(action || onConfirm) && (
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            {action ? (
              action
            ) : (
              <Button
                variant={variant === "destructive" ? "destructive" : "primary"}
                onClick={() => {
                  onConfirm?.();
                  onOpenChange(false);
                }}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "destructive" | "ghost";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "destructive",
}: AlertDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}
