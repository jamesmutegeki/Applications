import { cn } from "../../lib/utils";

interface BadgeProps {
  children: string;
  variant?: "default" | "gold" | "outline";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        variant === "default" && "bg-navy-100 text-navy-800",
        variant === "gold" && "bg-gold-100 text-gold-800",
        variant === "outline" && "border border-navy-300 text-navy-700",
        className
      )}
    >
      {children}
    </span>
  );
}
