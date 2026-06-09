import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "bg-navy-700 text-white hover:bg-navy-800 shadow-md hover:shadow-lg",
          variant === "secondary" && "bg-gold-400 text-navy-900 hover:bg-gold-500 shadow-md",
          variant === "outline" && "border-2 border-navy-700 text-navy-700 hover:bg-navy-50",
          variant === "ghost" && "text-navy-700 hover:bg-navy-50",
          size === "sm" && "px-3 py-1.5 text-sm gap-1.5",
          size === "md" && "px-5 py-2.5 text-sm gap-2",
          size === "lg" && "px-8 py-3.5 text-base gap-2.5",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
