import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "subtle" | "whatsapp" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary: "bg-ink-900 text-white shadow-sm hover:bg-ink-800 focus-visible:outline-ink-900",
  outline: "border border-ink-200 bg-white text-ink-900 hover:border-ink-300 hover:bg-ink-50",
  ghost: "text-ink-800 hover:bg-ink-50",
  subtle: "bg-brand-50 text-brand-800 hover:bg-brand-100",
  whatsapp: "bg-whatsapp text-white shadow-sm hover:bg-whatsapp-hover focus-visible:outline-whatsapp",
  danger: "bg-danger-600 text-white hover:bg-danger-700",
  link: "rounded-none px-0 text-brand-700 underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm [&_svg]:size-4",
  md: "h-11 px-4 text-sm [&_svg]:size-4",
  lg: "h-12 px-6 text-base [&_svg]:size-5",
  icon: "size-11 [&_svg]:size-5",
};

/** Class names for anything that should look like a button (e.g. <Link>, <a>). */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(base, variants[variant], variant === "link" ? "h-auto" : sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}
