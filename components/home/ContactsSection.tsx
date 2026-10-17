import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { companyData } from "@/data/company";

export function ContactsSection() {
  const { address, phones, hours, whatsapp, email } = companyData;

  return (
    <section id="contatti" aria-labelledby="contatti-title" className="bg-white py-20 md:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-2">
        <div className="space-y-10">
          <SectionHeading
            id="contatti-title"
            eyebrow="Contatti"
            title="Chiamaci, scrivici o passa in laboratorio."
            lead="Ecco a chi rispondere per cosa, così parli subito con la persona giusta."
          />

          <ul className="divide-y divide-alu-soft border-y border-alu-soft">
            {phones.map((phone) => (
              <li key={phone.id}>
                <a href={phone.href} className="group flex items-center justify-between gap-4 py-5">
                  <span>
                    <span className="block font-display font-bold text-2xl [font-stretch:112%] group-hover:text-key transition-colors">
                      {phone.number}
                    </span>
                    <span className="block text-[0.9375rem] text-ink-2 mt-1">
                      <span className="font-semibold text-ink">{phone.who}</span> · {phone.callFor}
                    </span>
                  </span>
                  <span className="size-12 shrink-0 rounded-md border border-ink/20 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
                    <Phone className="size-5" aria-hidden="true" />
                    <span className="sr-only">Chiama</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              icon={<MessageCircle className="size-5" aria-hidden="true" />}
            >
              Scrivici su WhatsApp
            </Button>
            <Button href={`mailto:${email}`} variant="secondary" icon={<Mail className="size-5" aria-hidden="true" />}>
              {email}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-alu-soft">
            <iframe
              title={`Mappa: ${address.full}`}
              src={address.embedUrl}
              className="absolute inset-0 size-full border-0 grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-key" aria-hidden="true" />
                Laboratorio e ufficio
              </p>
              <p className="text-ink-2 mt-2">
                {address.street}
                <br />
                {address.postalCode} {address.city} ({address.province})
              </p>
              <a
                href={address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 font-semibold underline decoration-key decoration-2 underline-offset-[6px] hover:text-key"
              >
                Indicazioni stradali
              </a>
            </div>

            <div>
              <p className="font-semibold">Orari</p>
              <dl className="mt-2 space-y-2 text-ink-2">
                {hours.map((h) => (
                  <div key={h.days}>
                    <dt className="text-sm">{h.days}</dt>
                    <dd className="font-semibold text-ink">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
