"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "orange";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #00d4e8 0%, #0098b0 100%)",
    color: "#000c18",
    boxShadow: "0 0 24px rgba(0,212,232,0.4), 0 4px 16px rgba(0,0,0,0.3)",
    letterSpacing: "0.06em",
  },
  orange: {
    background: "linear-gradient(135deg, #ff6b3a 0%, #c04020 100%)",
    color: "#fff",
    boxShadow: "0 0 24px rgba(255,107,58,0.4), 0 4px 16px rgba(0,0,0,0.3)",
    letterSpacing: "0.06em",
  },
  secondary: {
    background: "rgba(5, 14, 35, 0.8)",
    color: "#d8f0ff",
    border: "1px solid rgba(0,212,232,0.25)",
    backdropFilter: "blur(8px)",
    letterSpacing: "0.04em",
  },
  ghost: {
    background: "transparent",
    color: "#00d4e8",
    letterSpacing: "0.04em",
  },
  danger: {
    background: "rgba(255,60,60,0.08)",
    color: "#ff7a7a",
    border: "1px solid rgba(255,60,60,0.2)",
    letterSpacing: "0.04em",
  },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, style, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]";

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-xs",
      lg: "px-7 py-3.5 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
