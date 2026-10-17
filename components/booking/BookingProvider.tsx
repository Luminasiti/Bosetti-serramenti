"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BookingModal } from "./BookingModal";

interface BookingContextValue {
  openBooking: (need?: string) => void;
  isOpen: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [need, setNeed] = useState<string | undefined>();
  // Bumped on every open so the wizard restarts with the right pre-selection.
  const [session, setSession] = useState(0);

  const openBooking = useCallback((preselected?: string) => {
    setNeed(preselected);
    setSession((s) => s + 1);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ openBooking, isOpen }), [openBooking, isOpen]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal key={session} isOpen={isOpen} preselectedNeed={need} onClose={() => setIsOpen(false)} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
