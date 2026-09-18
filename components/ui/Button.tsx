import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "outline" | "danger";
type Size = "md" | "lg" | "xl";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_4px_0_var(--primary-dark)] active:translate-y-[2px] active:shadow-[0_2px_0_var(--primary-dark)]",
  outline:
    "bg-card text-primary border-2 border-primary",
  danger:
    "bg-danger text-white shadow-[0_4px_0_var(--danger-deep)] active:translate-y-[2px] active:shadow-[0_2px_0_var(--danger-deep)]",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-[48px] px-6 text-base",
  lg: "min-h-[56px] px-8 text-lg",
  xl: "min-h-[72px] px-10 text-xl",
};

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-2xl font-bold cursor-pointer border-none transition-transform duration-75 disabled:opacity-50 disabled:cursor-not-allowed";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = CommonProps & {
  href: string;
};

export function Button({
  variant = "primary",
  size = "lg",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "lg",
  icon,
  children,
  className = "",
  href,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
}
