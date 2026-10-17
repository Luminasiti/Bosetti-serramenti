import Image from "next/image";
import { BookingButton } from "@/components/booking/BookingButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { productsData } from "@/data/products";

export function ProductsSection() {
  return (
    <section id="prodotti" aria-labelledby="prodotti-title" className="py-20 md:py-28">
      <div className="container-site">
        <SectionHeading
          id="prodotti-title"
          eyebrow="I nostri prodotti"
          title="Tutto in alluminio, tutto su misura."
          lead="Scegli cosa vuoi cambiare: al sopralluogo ti facciamo vedere profili, colori e finiture dal vivo."
        />

        <ul className="mt-12 md:mt-16 -mx-5 px-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-6 md:gap-y-12 md:overflow-visible md:pb-0">
          {productsData.map((product) => (
            <li key={product.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] md:w-auto flex flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-alu-soft">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 78vw"
                  className="object-cover"
                />
              </div>
              <h3 className="text-h3 mt-5">{product.name}</h3>
              <p className="text-[0.9375rem] text-ink-2 mt-2 flex-1">{product.line}</p>
              <BookingButton variant="link" need={product.id} className="mt-4 self-start text-[0.9375rem]">
                Chiedi un sopralluogo
              </BookingButton>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
