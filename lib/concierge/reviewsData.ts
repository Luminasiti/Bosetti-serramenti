// Real Google reviews only, verbatim, surname initial only. Dates and categories are not known yet:
// add them from the Google Business profile before going live.
export interface ConciergeReview {
  author: string;
  rating: number;
  date?: string;
  /** Product ids this review fits; empty means "general". */
  productIds: string[];
  productName: string;
  quote: string;
  /** What the bot says right before showing the review card. */
  spontaneousIntro: string;
}

export const REVIEWS: ConciergeReview[] = [
  {
    author: "Nicola G.",
    rating: 5,
    productIds: ["finestre", "alzante", "porta"],
    productName: "Sostituzione serramenti",
    quote:
      "La professionalità e la cura ai minimi dettagli ci hanno fatto sentire in ottime mani! Siamo estremamente soddisfatti del risultato ottenuto, rapporto qualità-prezzo ottimo.",
    spontaneousIntro: "Ti lascio quello che ci ha scritto Nicola dopo aver cambiato i serramenti con noi:",
  },
  {
    author: "Giulia F.",
    rating: 5,
    productIds: ["persiane", "zanzariere", "finestre"],
    productName: "Secondo lavoro con noi",
    quote:
      "Attenzione, precisione e passione li contraddistinguono nel loro settore e anche a livello personale sono una famiglia come poche. Per non parlare dei complimenti che riceviamo per i nuovi serramenti.",
    spontaneousIntro: "Giulia ci ha richiamato per un secondo lavoro. Ecco cosa ha scritto:",
  },
  {
    author: "Mario B.",
    rating: 5,
    productIds: ["vetrina", "porta", "alzante"],
    productName: "Produzione e montaggio",
    quote:
      "Impresa a conduzione familiare. Seri, precisi e puntuali. Produzione di ottimi serramenti e montaggio professionale per un risultato perfetto.",
    spontaneousIntro: "Sui tempi siamo precisi, lo dice anche Mario:",
  },
];

/** Best review for the selected products, skipping ones already shown. */
export function pickReview(productIds: string[], exclude: string[] = []) {
  const pool = REVIEWS.filter((r) => !exclude.includes(r.author));
  return pool.find((r) => r.productIds.some((id) => productIds.includes(id))) ?? pool[0];
}
