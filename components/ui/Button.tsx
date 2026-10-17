import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost-light";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-md font-semibold leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-key text-white hover:bg-key-dark",
  secondary: "border border-ink/25 text-ink hover:bg-ink hover:text-white hover:border-ink",
  "ghost-light": "border border-white/30 text-white hover:bg-white hover:text-ink",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-5 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  (({ href: string } & Omit<ComponentProps<"a">, "children">) | ({ href?: undefined } & Omit<ComponentProps<"button">, "children">));

export function Button({ variant = "primary", size = "md", icon, children, className = "", ...rest }: ButtonProps) {
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (rest.href !== undefined) {
    return (
      <a {...(rest as ComponentProps<"a">)} className={classes}>
        {content}
      </a>
    );
  }

  const { type = "button", ...buttonRest } = rest as ComponentProps<"button">;
  return (
    <button type={type} {...buttonRest} className={classes}>
      {content}
    </button>
  );
}
