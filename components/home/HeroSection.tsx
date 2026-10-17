import Image from "next/image";
import { Phone } from "lucide-react";
import { BookingButton } from "@/components/booking/BookingButton";
import { Stars } from "@/components/ui/Stars";
import { companyData } from "@/data/company";

export function HeroSection() {
  const office = companyData.phones[0];
  const { score, count, url } = companyData.googleRating;

  return (
    <section id="top" aria-labelledby="hero-title" className="pt-8 md:pt-14 pb-16 md:pb-24">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-5">
            <p className="eyebrow text-ink-2">Montichiari · {companyData.foundedText}</p>
            <h1 id="hero-title" className="text-display">
              Serramenti in alluminio fatti da noi, a Montichiari.{" "}
              <span className="text-ink-2">Da padre in figli.</span>
            </h1>
          </div>

          <div className="lg:col-span-4 space-y-6 lg:pb-2">
            <p className="text-lead text-ink-2">
              Tagliamo, assembliamo e montiamo noi, in famiglia. Il sopralluogo è gratis e il giorno lo scegli tu.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <BookingButton size="lg" className="w-full sm:w-auto" />
              <a
                href={office.href}
                className="inline-flex items-center gap-2 font-semibold hover:text-key transition-colors"
              >
                <Phone className="size-4" aria-hidden="true" />
                {office.number}
              </a>
            </div>
          </div>
        </div>

        <div className="relative mt-10 md:mt-14">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[1210/525] overflow-hidden rounded-md bg-alu-soft">
            <Image
              src="/images/slider-1.jpg"
              alt="Grande alzante scorrevole in alluminio aperto sulla veranda"
              fill
              preload
              sizes="(min-width: 1240px) 1176px, 100vw"
              className="object-cover object-[70%_50%]"
            />
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-4 -bottom-7 md:left-8 md:-bottom-8 flex items-center gap-4 rounded-md bg-white px-5 py-3.5 shadow-card hover:shadow-lg transition-shadow"
          >
            <span className="font-display font-bold text-4xl leading-none [font-stretch:112%]">{score}</span>
            <span className="flex flex-col gap-1">
              <Stars label={`${score} stelle su 5`} />
              <span className="text-sm text-ink-2">{count} recensioni su Google</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
