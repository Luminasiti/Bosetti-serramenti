"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { BookingButton } from "@/components/booking/BookingButton";
import { companyData } from "@/data/company";

/** Always-visible call / WhatsApp / booking bar on phones. Hides while the inline booking form is on screen. */
export function MobileStickyBar() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("prenota");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const office = companyData.phones[0];

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 md:hidden border-t border-alu-soft bg-paper/95 backdrop-blur-md px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] transition-transform duration-200 ${
        hidden ? "translate-y-full" : ""
      }`}
    >
      <div className="grid grid-cols-[1fr_1fr_2fr] gap-2">
        <a
          href={office.href}
          className="flex h-12 flex-col items-center justify-center rounded-md border border-ink/20 text-xs font-semibold"
        >
          <Phone className="size-4" aria-hidden="true" />
          Chiama
        </a>
        <a
          href={companyData.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 flex-col items-center justify-center rounded-md border border-ink/20 text-xs font-semibold"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp
        </a>
        <BookingButton className="h-12! px-3!">Prenota gratis</BookingButton>
      </div>
    </div>
  );
}
