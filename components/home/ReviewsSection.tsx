import { ArrowUpRight } from "lucide-react";
import { Stars } from "@/components/ui/Stars";
import { companyData } from "@/data/company";
import { reviewsData } from "@/data/reviews";

export function ReviewsSection() {
  const { score, count, url } = companyData.googleRating;

  return (
    <section id="recensioni" aria-labelledby="recensioni-title" className="py-20 md:py-28 border-t border-alu-soft">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7 space-y-5">
            <p className="eyebrow text-ink-2">Recensioni su Google</p>
            <h2 id="recensioni-title" className="text-h2">
              Più di un cliente ci chiama per nome.
            </h2>
          </div>

          <div className="lg:col-span-5 flex items-center gap-6 lg:justify-end">
            <span className="font-display font-bold text-7xl leading-none [font-stretch:112%]">{score}</span>
            <span className="space-y-2">
              <Stars className="size-5" label={`${score} stelle su 5`} />
              <span className="block text-ink-2">{count} recensioni su Google</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline decoration-key decoration-2 underline-offset-[6px] hover:text-key"
              >
                Leggile tutte
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </span>
          </div>
        </div>

        <ul className="mt-12 md:mt-16 grid gap-4 md:gap-6 lg:grid-cols-3">
          {reviewsData.map((review) => (
            <li key={review.id}>
              <figure className="h-full flex flex-col rounded-md bg-white p-6 md:p-8">
                <Stars />
                <blockquote className="mt-5 flex-1 text-[0.9375rem] md:text-base leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-alu-soft font-semibold">{review.author}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
