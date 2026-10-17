import { BookingWizard } from "@/components/booking/BookingWizard";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BookingSection() {
  return (
    <section id="prenota" aria-labelledby="prenota-title" className="py-20 md:py-28 border-t border-alu-soft">
      <div className="container-site space-y-12">
        <SectionHeading
          id="prenota-title"
          align="center"
          eyebrow="Sopralluogo gratuito"
          title="Il sopralluogo è gratis. Prenotalo adesso, ti richiamiamo per conferma."
          lead="Dicci cosa vuoi cambiare, aggiungi una foto se vuoi e scegli il giorno. Ci vogliono due minuti."
        />
        <BookingWizard variant="inline" />
      </div>
    </section>
  );
}
