"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { BookingWizard } from "./BookingWizard";

interface BookingModalProps {
  isOpen: boolean;
  preselectedNeed?: string;
  onClose: () => void;
}

export function BookingModal({ isOpen, preselectedNeed, onClose }: BookingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Native <dialog> gives us the focus trap, Esc to close and the inert background.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      aria-label="Prenota il sopralluogo gratuito"
      className="m-auto w-full max-w-3xl max-h-[100dvh] sm:max-h-[92dvh] bg-transparent p-0 sm:p-4 backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 size-11 rounded-md bg-paper text-ink flex items-center justify-center hover:bg-alu-soft cursor-pointer"
          aria-label="Chiudi"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        {isOpen && <BookingWizard preselectedNeed={preselectedNeed} variant="modal" />}
      </div>
    </dialog>
  );
}
