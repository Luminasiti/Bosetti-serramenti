"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { productById } from "@/lib/concierge/config";
import { captureAttribution } from "@/lib/concierge/attribution";
import { ConciergeChat } from "./ConciergeChat";

interface ConciergeContextValue {
  openConcierge: (productId?: string) => void;
  closeConcierge: () => void;
  isOpen: boolean;
}

const ConciergeContext = createContext<ConciergeContextValue | null>(null);
const AUTO_OPEN_KEY = "bosetti_concierge_auto_opened";
const NO_AUTO_OPEN = /^\/(privacy|cookie)/;

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<{ product?: string; nonce: number }>({ nonce: 0 });
  const pathname = usePathname();

  const openConcierge = useCallback((productId?: string) => {
    try {
      sessionStorage.setItem(AUTO_OPEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setEntry((e) => ({ product: productById(productId)?.id, nonce: e.nonce + 1 }));
    setIsOpen(true);
  }, []);
  const closeConcierge = useCallback(() => setIsOpen(false), []);

  // Legacy / non-React buttons: window.dispatchEvent(new CustomEvent("open-concierge", { detail: { category: "finestre" } }))
  useEffect(() => {
    const onEvent = (e: Event) => openConcierge((e as CustomEvent<{ category?: string }>).detail?.category);
    window.addEventListener("open-concierge", onEvent);
    return () => window.removeEventListener("open-concierge", onEvent);
  }, [openConcierge]);

  // Landing attribution + auto-open once per session, 2 s after the first page load.
  useEffect(() => {
    captureAttribution();
    if (NO_AUTO_OPEN.test(pathname)) return;
    let already = false;
    try {
      already = sessionStorage.getItem(AUTO_OPEN_KEY) === "1";
    } catch {
      already = true;
    }
    if (already) return;
    const timer = setTimeout(() => openConcierge(pathname.split("/")[1] || undefined), 2000);
    return () => clearTimeout(timer);
    // Only on the first load of the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ openConcierge, closeConcierge, isOpen }), [openConcierge, closeConcierge, isOpen]);

  return (
    <ConciergeContext.Provider value={value}>
      {children}
      {!isOpen && !NO_AUTO_OPEN.test(pathname) && (
        <button
          type="button"
          onClick={() => openConcierge()}
          // On phones the sticky Chiama / WhatsApp / Prenota bar already carries this action.
          className="fixed bottom-6 right-6 z-40 hidden md:inline-flex items-center gap-2.5 rounded-full bg-key py-3.5 pl-5 pr-6 font-semibold text-white shadow-card hover:bg-key-dark cursor-pointer"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-white" />
          </span>
          Richiedi Preventivo
        </button>
      )}
      <ConciergeChat open={isOpen} entry={entry} onClose={closeConcierge} />
    </ConciergeContext.Provider>
  );
}

export function useConcierge() {
  const ctx = useContext(ConciergeContext);
  if (!ctx) throw new Error("useConcierge must be used inside <ConciergeProvider>");
  return ctx;
}
