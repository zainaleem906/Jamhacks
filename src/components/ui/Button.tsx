"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22c55e] disabled:opacity-40 disabled:cursor-not-allowed";

    const variants = {
      primary: "tk-btn-primary",
      secondary: "tk-btn",
      ghost: "border border-[#4a4a4a] text-[#22c55e] hover:bg-[#363636]",
      danger: "tk-btn text-red-400",
    };

    const sizes = {
      sm: "px-4 py-1 text-xs",
      md: "px-6 py-1.5 text-sm",
      lg: "px-8 py-2 text-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
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
