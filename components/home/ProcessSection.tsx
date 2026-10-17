import { BookingButton } from "@/components/booking/BookingButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Sopralluogo",
    who: "Marco o Leonardo",
    text: "Veniamo a casa tua, prendiamo le misure e ti consigliamo. È gratis e senza impegno.",
  },
  {
    title: "Preventivo",
    who: "Simona, in ufficio",
    text: "Ti prepariamo un preventivo chiaro, voce per voce. Se hai dubbi, ci chiami.",
  },
  {
    title: "Produzione",
    who: "Nel nostro laboratorio",
    text: "Tagliamo e assembliamo i tuoi serramenti a Montichiari, sulle misure prese da noi.",
  },
  {
    title: "Montaggio",
    who: "Sempre noi",
    text: "Montiamo nei tempi concordati e lasciamo la casa pulita.",
  },
];

export function ProcessSection() {
  return (
    <section id="come-funziona" aria-labelledby="processo-title" className="bg-white py-20 md:py-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            id="processo-title"
            eyebrow="Come funziona"
            title="Quattro passi, sempre con noi."
          />
          <BookingButton size="lg" className="w-full sm:w-auto" />
        </div>

        <ol className="mt-12 md:mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="relative border-t-2 border-ink pt-6">
              {i === 0 && <span className="absolute -top-0.5 left-0 h-0.5 w-12 bg-key" aria-hidden="true" />}
              <span className="font-display font-bold text-alu text-lg [font-stretch:112%]">0{i + 1}</span>
              <h3 className="text-h3 mt-2">{step.title}</h3>
              <p className="text-sm font-semibold text-ink-2 mt-1">{step.who}</p>
              <p className="text-[0.9375rem] text-ink-2 mt-3">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
