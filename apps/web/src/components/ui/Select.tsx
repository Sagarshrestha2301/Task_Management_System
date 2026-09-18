import { Fragment, type ReactNode, useRef, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  label,
  helperText,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputId = id || `select-${Math.random().toString(36).slice(2, 9)}`;

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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={inputId}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${inputId}-options`}
          className={cn(
            "w-full h-10 px-3 text-left rounded-md bg-surface border transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "disabled:opacity-50 disabled:pointer-events-none",
            error
              ? "border-danger"
              : "border-border hover:border-text-muted/50",
            !value && "text-text-muted",
          )}
        >
          <span className="flex-1 truncate">
            {value ? selectedOption?.label : placeholder}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-text-muted ml-2 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted ml-2 flex-shrink-0" />
          )}
        </button>
        {open && (
          <div
            ref={contentRef}
            id={`${inputId}-options`}
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-surface border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {options.map((option) => (
              <button
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                    setOpen(false);
                  }
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors",
                  "focus:outline-none focus:bg-accent-soft focus:text-accent",
                  "hover:bg-surface-muted",
                  option.disabled && "opacity-50 pointer-events-none",
                  value === option.value &&
                    "bg-accent-soft text-accent font-medium",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}

export interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  id?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  label,
  helperText,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputId = id || `multiselect-${Math.random().toString(36).slice(2, 9)}`;

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

  const displayValue =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? options
            .filter((o) => value.includes(o.value))
            .map((o) => o.label)
            .join(", ")
        : `${value.length} selected`;

  const removeValue = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={inputId}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${inputId}-options`}
          className={cn(
            "w-full h-10 px-3 text-left rounded-md bg-surface border transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
            "disabled:opacity-50 disabled:pointer-events-none",
            error
              ? "border-danger"
              : "border-border hover:border-text-muted/50",
            value.length === 0 && "text-text-muted",
          )}
        >
          <span className="flex-1 truncate flex items-center gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 bg-accent-soft text-accent text-xs px-2 py-0.5 rounded"
              >
                {options.find((o) => o.value === v)?.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(v);
                  }}
                  className="hover:bg-accent/20 rounded p-0.5"
                  aria-label={`Remove ${options.find((o) => o.value === v)?.label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {!value.length && <span>{placeholder}</span>}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-text-muted ml-2 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted ml-2 flex-shrink-0" />
          )}
        </button>
        {open && (
          <div
            ref={contentRef}
            id={`${inputId}-options`}
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md bg-surface border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-surface-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...value, option.value]
                        : value.filter((v) => v !== option.value),
                    )
                  }
                  disabled={option.disabled}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                  aria-selected={value.includes(option.value)}
                />
                <span
                  className={cn(
                    "text-sm",
                    option.disabled && "text-text-muted",
                  )}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
