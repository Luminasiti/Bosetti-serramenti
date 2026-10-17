import Image from "next/image";
import { BadgeCheck, Ruler, Search, Truck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Content from bosettiserramenti.com/serramenti-bosetti-montichiari.php ("I nostri servizi"), rewritten in the brief's voice.
const services = [
  {
    icon: Search,
    title: "Scegliamo noi la materia prima",
    text: "I profili in alluminio li selezioniamo noi, in laboratorio. La qualità di un serramento parte da lì.",
  },
  {
    icon: Ruler,
    title: "Ti consigliamo, su misura",
    text: "Conosciamo bene quello che facciamo: ti diciamo cosa serve davvero, nel tuo stile e sulle misure di casa tua.",
  },
  {
    icon: Truck,
    title: "Consegniamo e montiamo",
    text: "Trasporto e montaggio li facciamo noi, a casa, in ufficio o in negozio. Precisi, e cercando di disturbare il meno possibile.",
  },
  {
    icon: BadgeCheck,
    title: "Posa certificata CasaClima",
    text: "Montiamo con il sistema Thermo Posa. Ogni serramento è a norma per le detrazioni fiscali.",
  },
];

const facts = [
  { value: "30+", label: "anni di lavoro" },
  { value: "4,9", label: "stelle su Google" },
  { value: "4", label: "di famiglia, al lavoro" },
];

export function AluminumWorkshopBanner() {
  return (
    <section id="cosa-facciamo" aria-labelledby="cosa-facciamo-title" className="bg-graphite text-white py-20 md:py-28">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <SectionHeading
              id="cosa-facciamo-title"
              tone="dark"
              eyebrow="Cosa facciamo"
              title="Dalla scelta della materia prima al montaggio a casa tua."
              lead="Non siamo rivenditori. In Via Madonnina 11 tagliamo, assembliamo e montiamo noi i serramenti in alluminio. Così qualità e tempi li controlliamo noi."
            />

            <ul className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {facts.map((fact) => (
                <li key={fact.label}>
                  <span className="block font-display font-bold text-3xl md:text-4xl [font-stretch:112%]">
                    {fact.value}
                  </span>
                  <span className="block text-sm text-alu mt-1">{fact.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            {/* Placeholder: replace with a real photo of the workshop (cutting / assembly) */}
            <Image
              src="/images/cantiere-2.jpg"
              alt="Alzante scorrevole in alluminio bianco appena montato"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-graphite p-6 md:p-8">
              <Icon className="size-6 text-alu" aria-hidden="true" />
              <h3 className="text-h3 text-white mt-5">{title}</h3>
              <p className="text-[0.9375rem] text-white/70 mt-2">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
