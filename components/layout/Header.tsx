"use client";

import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BosettiLogo } from "@/components/ui/BosettiLogo";
import { BookingButton } from "@/components/booking/BookingButton";
import { companyData } from "@/data/company";

const navLinks = [
  { href: "#prodotti", label: "Prodotti" },
  { href: "#famiglia", label: "La famiglia" },
  { href: "#cosa-facciamo", label: "Cosa facciamo" },
  { href: "#come-funziona", label: "Come funziona" },
  { href: "#contatti", label: "Contatti" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const office = companyData.phones[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-paper/95 backdrop-blur-md transition-shadow ${
        scrolled || menuOpen ? "shadow-[0_1px_0_var(--color-alu-soft)]" : ""
      }`}
    >
      <div className="container-site flex h-16 md:h-20 items-center justify-between gap-6">
        <a href="#top" aria-label="Bosetti Serramenti, torna all'inizio" className="shrink-0">
          <BosettiLogo className="h-9 md:h-11 w-auto" />
        </a>

        <nav aria-label="Principale" className="hidden xl:block">
          <ul className="flex items-center gap-7 text-[0.9375rem] font-medium whitespace-nowrap">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-ink-2 hover:text-ink transition-colors">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-5">
          <a
            href={office.href}
            className="hidden lg:inline-flex items-center gap-2 whitespace-nowrap font-semibold text-[0.9375rem] hover:text-key transition-colors"
          >
            <Phone className="size-4" aria-hidden="true" />
            {office.number}
          </a>
          <BookingButton className="max-md:hidden">Prenota il sopralluogo</BookingButton>

          <a
            href={office.href}
            aria-label={`Chiama l'ufficio, ${office.number}`}
            className="lg:hidden size-11 rounded-md flex items-center justify-center hover:bg-alu-soft"
          >
            <Phone className="size-5" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
            className="xl:hidden size-11 rounded-md flex items-center justify-center hover:bg-alu-soft cursor-pointer"
          >
            {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menu" className="xl:hidden border-t border-alu-soft bg-paper">
          <ul className="container-site py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 font-display font-bold text-2xl [font-stretch:112%]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
