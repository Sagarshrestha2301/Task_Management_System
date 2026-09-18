import { Fragment, type ReactNode, useRef, useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface DropdownProps {
  trigger: ReactNode;
  content: ReactNode;
  align?: "start" | "end";
  side?: "bottom" | "top";
}

export function Dropdown({
  trigger,
  content,
  align = "start",
  side = "bottom",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <Fragment>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1"
      >
        {trigger}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div
          ref={contentRef}
          role="menu"
          className={cn(
            "absolute z-50 mt-1 min-w-[160px] rounded-md bg-surface border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150",
            side === "bottom" ? "top-full" : "bottom-full",
            align === "start" ? "left-0" : "right-0",
          )}
        >
          {content}
        </div>
      )}
    </Fragment>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
}

export function DropdownItem({
  children,
  icon,
  destructive,
  className,
  onClick,
  ...props
}: DropdownItemProps) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setTimeout(() => {}, 0);
      }}
      className={cn(
        "w-full px-3 py-2 text-left text-sm transition-colors",
        "focus:outline-none focus:bg-accent-soft focus:text-accent",
        "hover:bg-surface-muted",
        destructive && "text-danger hover:bg-red-50",
        className,
      )}
      {...props}
    >
      {icon && <span className="inline-flex h-4 w-4 mr-2">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <hr role="separator" className="my-1 border-border" />;
}
