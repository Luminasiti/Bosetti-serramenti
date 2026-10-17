import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { companyData, type FamilyMember } from "@/data/company";
import { familyQuote } from "@/data/reviews";

function Portrait({ member }: { member: FamilyMember }) {
  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={`${member.name}, ${member.role}`}
        fill
        sizes="(min-width: 1024px) 280px, 50vw"
        className="object-cover"
      />
    );
  }

  // Placeholder until the real portraits are shot: aluminium tone, initial, and the key shaft from the logo.
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#d9d7d3] via-[#cfd1d3] to-[#b9bdc1]" aria-hidden="true">
      <span className="absolute left-5 bottom-3 font-display font-bold text-[7rem] leading-none text-white/70 [font-stretch:125%]">
        {member.name[0]}
      </span>
      <span className="absolute right-5 top-5 h-[3px] w-10 rounded-full bg-key" />
    </div>
  );
}

export function FamilySection() {
  return (
    <section id="famiglia" aria-labelledby="famiglia-title" className="pt-12 pb-20 md:pt-16 md:pb-28">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              id="famiglia-title"
              eyebrow="La famiglia Bosetti"
              title="Chi prende le misure è chi costruisce e monta."
              lead="Siamo Marco, Claudio, Leonardo e Simona. Il tuo lavoro lo seguiamo noi, dal sopralluogo all'ultima regolazione."
            />
          </div>

          <figure className="lg:col-span-5 border-l-2 border-key pl-6">
            <blockquote className="font-display font-bold text-2xl md:text-[1.75rem] leading-snug [font-stretch:108%]">
              &ldquo;{familyQuote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-[0.9375rem] text-ink-2">
              {familyQuote.author}, recensione su Google
            </figcaption>
          </figure>
        </div>

        <ul className="mt-12 md:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
          {companyData.family.map((member) => (
            <li key={member.name}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                <Portrait member={member} />
              </div>
              <h3 className="text-h3 mt-4">{member.name}</h3>
              <p className="text-[0.9375rem] font-semibold mt-0.5">{member.role}</p>
              <p className="text-[0.9375rem] text-ink-2 mt-2">{member.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
