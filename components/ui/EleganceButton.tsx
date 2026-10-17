"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface EleganceButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "light" | "red" | "dark" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EleganceButton({
  children,
  onClick,
  href,
  target,
  rel,
  type = "button",
  disabled = false,
  variant = "light",
  size = "md",
  className = "",
}: EleganceButtonProps) {
  const baseStyles =
    "group inline-flex items-center justify-between gap-3.5 rounded-full font-medium tracking-[-0.02em] transition-all duration-300 cursor-pointer disabled:opacity-60 select-none";

  const sizeStyles = {
    sm: "pl-4 pr-1.5 py-1.5 text-xs",
    md: "pl-5 pr-1.5 py-1.5 text-sm",
    lg: "pl-6 pr-2 py-2 text-sm sm:text-base",
  }[size];

  const circleSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-9 h-9",
  }[size];

  const variantStyles = {
    light: "bg-[#F6F4F1] text-[#1F1F1F] hover:bg-[#A8282A] hover:text-[#F6F4F1]",
    red: "bg-[#A8282A] text-[#F6F4F1] hover:bg-[#1F1F1F] hover:text-[#F6F4F1]",
    dark: "bg-[#1F1F1F] text-[#F6F4F1] hover:bg-[#A8282A] hover:text-[#F6F4F1]",
    outline:
      "bg-transparent text-[#1F1F1F] border border-[#1F1F1F]/20 hover:border-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-[#F6F4F1]",
  }[variant];

  const circleStyles = {
    light: "bg-[#1F1F1F] text-[#F6F4F1] group-hover:bg-[#F6F4F1] group-hover:text-[#1F1F1F]",
    red: "bg-[#F6F4F1] text-[#1F1F1F] group-hover:bg-[#A8282A] group-hover:text-[#F6F4F1]",
    dark: "bg-[#A8282A] text-[#F6F4F1] group-hover:bg-[#F6F4F1] group-hover:text-[#1F1F1F]",
    outline: "bg-[#1F1F1F] text-[#F6F4F1] group-hover:bg-[#A8282A] group-hover:text-[#F6F4F1]",
  }[variant];

  const content = (
    <>
      <span className="whitespace-nowrap font-semibold">{children}</span>
      <span
        className={`${circleSizes} rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${circleStyles}`}
      >
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-45" />
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {content}
    </button>
  );
}
