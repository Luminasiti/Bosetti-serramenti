import type { Metadata } from "next";
import { companyData } from "@/data/company";

export const metadata: Metadata = {
  title: "Informativa privacy · Bosetti Serramenti",
  robots: { index: false },
};

// Placeholder: replace with the legal text approved by Bosetti Serramenti before going live.
export default function PrivacyPage() {
  return (
    <main className="container-site max-w-3xl py-16 md:py-24 space-y-6">
      <a href="/" className="text-sm font-semibold underline underline-offset-4">
        ← Torna al sito
      </a>
      <h1 className="text-h2">Informativa privacy</h1>
      <p className="text-ink-2">
        Titolare del trattamento: {companyData.name}, {companyData.address.full}, P. IVA 03281480982, email{" "}
        <a href={`mailto:${companyData.email}`} className="underline">
          {companyData.email}
        </a>
        .
      </p>
      <h2 className="text-h3">Dati raccolti con la prenotazione del sopralluogo</h2>
      <p className="text-ink-2">
        Nome, telefono, email (facoltativa), indirizzo del sopralluogo, i prodotti di interesse e la conversazione in chat.
        Li usiamo solo per organizzare il sopralluogo, preparare il preventivo e contattarti a riguardo.
      </p>
      <h2 className="text-h3">Conservazione e diritti</h2>
      <p className="text-ink-2">
        I dati sono conservati per il tempo necessario a gestire la richiesta e gli eventuali obblighi di legge. Puoi chiedere
        accesso, rettifica o cancellazione scrivendo a {companyData.email}.
      </p>
      <p className="text-sm text-ink-2 border-l-2 border-key pl-4">
        Testo provvisorio: da sostituire con l&apos;informativa completa approvata dall&apos;azienda.
      </p>
    </main>
  );
}
