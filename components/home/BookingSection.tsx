import { Phone } from "lucide-react";
import { BookingButton } from "@/components/booking/BookingButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { companyData } from "@/data/company";

const steps = ["Scegli cosa vuoi cambiare", "Scegli giorno e ora dal calendario di Leonardo", "Ricevi la conferma via email"];

export function BookingSection() {
  const office = companyData.phones[0];
  return (
    <section id="prenota" aria-labelledby="prenota-title" className="py-20 md:py-28 border-t border-alu-soft">
      <div className="container-site flex flex-col items-center gap-10">
        <SectionHeading
          id="prenota-title"
          align="center"
          eyebrow="Sopralluogo gratuito"
          title="Il sopralluogo è gratis. Prenotalo adesso, ti richiamiamo per conferma."
          lead="Rispondi a poche domande in chat e scegli tu l'orario. Ci vogliono due minuti."
        />
        <ol className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s} className="rounded-md bg-white px-5 py-4">
              <span className="font-display font-bold text-alu [font-stretch:112%]">0{i + 1}</span>
              <p className="mt-1 text-[0.9375rem] font-semibold">{s}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <BookingButton size="lg">Richiedi Preventivo</BookingButton>
          <a href={office.href} className="inline-flex items-center gap-2 font-semibold hover:text-key">
            <Phone className="size-4" aria-hidden="true" />
            oppure chiama {office.number}
          </a>
        </div>
      </div>
    </section>
  );
}
