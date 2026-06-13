import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, style, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        background: "rgba(5, 14, 35, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${glow ? "rgba(0,212,232,0.35)" : "rgba(80,160,220,0.13)"}`,
        boxShadow: glow
          ? "0 0 40px rgba(0,212,232,0.08), 0 8px 32px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.3)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold", className)} style={{ color: "#d8f0ff" }} {...props}>
      {children}
    </h3>
  );
}
