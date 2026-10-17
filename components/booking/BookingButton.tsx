"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useConcierge } from "@/components/concierge/ConciergeContext";

interface BookingButtonProps {
  need?: string;
  variant?: ButtonVariant | "link";
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

/** Every "Richiedi Preventivo" CTA: opens the booking chat, pre-selected on the product when given. */
export function BookingButton({
  need,
  variant = "primary",
  size = "md",
  className = "",
  children = "Prenota il sopralluogo gratuito",
}: BookingButtonProps) {
  const { openConcierge } = useConcierge();

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={() => openConcierge(need)}
        className={`group inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-key decoration-2 underline-offset-[6px] hover:text-key cursor-pointer ${className}`}
      >
        {children}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openConcierge(need)}
      className={buttonClasses(variant, size, `group ${className}`)}
    >
      <span>{children}</span>
      <ArrowRight className="size-[1.1em] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </button>
  );
}
