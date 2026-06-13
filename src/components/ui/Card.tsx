import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  label?: string;
}

export function Card({ className, glow, label, children, ...props }: CardProps) {
  return (
    <div
      className={cn("tk-groove bg-eco-card p-4 relative", className)}
      {...props}
    >
      {label && (
        <span className="absolute -top-2.5 left-3 bg-eco-card px-2 text-[11px] text-[#888888]">
          {label}
        </span>
      )}
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
    <h3 className={cn("text-sm font-bold text-[#c8c8c8]", className)} {...props}>
      {children}
    </h3>
  );
}
