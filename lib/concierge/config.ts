// Booking concierge configuration for Bosetti Serramenti. Shared by client and server: no secrets here.

export interface ConciergeProduct {
  id: string;
  label: string;
  emoji: string;
  image: string;
  tag: string;
  smallOrderEligible: boolean;
  /** When set, quantities are tracked per sub-type with these defaults. */
  splitQuantity?: { label: string; defaultCount: number }[];
  priorities: string[];
  /** Regex source used to detect the product in free text. */
  keywords: string;
}

export const CONFIG = {
  companyName: "Bosetti Serramenti",
  brandKey: "bosetti",
  consultantName: "Leonardo",
  consultantRole: "sopralluoghi e montaggio",
  phoneDisplay: "030 961983",
  phoneTel: "030961983",
  whatsappNumber: "393393330834",
  showroomAddress: "Via Madonnina 11, 25018 Montichiari (BS)",
  serviceAreaName: "province di Brescia, Mantova e Cremona",
  serviceAreaCapRegex: "^(25|46|26)\\d{3}$",
  defaultCity: "Montichiari",
  timezone: "Europe/Rome",
  slotTimes: ["08:30", "10:30", "14:00", "16:00"],
  slotDurationMinutes: 90,
  workingDays: [1, 2, 3, 4, 5],
  lateCutoffHour: 20,
  maxScanDays: 14,
  suggestionsCount: 4,
  brandColors: { primary: "#A8282A", dark: "#2B2B2B", accent: "#9EA3A8" },
  smallOrderRule: { maxTotalPieces: 2 },
  propertyTypes: [
    "Appartamento in Condominio",
    "Casa nel centro storico",
    "Villa / Casa Indipendente",
    "Ufficio o Negozio",
  ],
  // From bosettiserramenti.com ("I nostri servizi") and the brief. Never invent other claims.
  sellingPoints: [
    "Produzione propria nel nostro laboratorio di Montichiari",
    "Posa certificata CasaClima con sistema Thermo Posa",
    "Serramenti certificati a norma per le detrazioni fiscali",
    "Un'impresa di famiglia da oltre trent'anni",
  ],
  privacyUrl: "/privacy",
} as const;

export const PRODUCTS: ConciergeProduct[] = [
  {
    id: "finestre",
    label: "Finestre e portefinestre",
    emoji: "🪟",
    image: "/images/prod-gen-finestre.jpg",
    tag: "Alluminio a taglio termico",
    smallOrderEligible: false,
    splitQuantity: [
      { label: "Finestre", defaultCount: 2 },
      { label: "Porte finestre", defaultCount: 1 },
    ],
    priorities: [
      "Detrazioni fiscali",
      "Isolamento termico e risparmio in bolletta",
      "Meno rumore dalla strada",
      "Sicurezza antieffrazione",
      "Più luce e design",
    ],
    keywords: "finestr|infiss|serrament|portafinestr|porte finestr|porta finestr|vasistas",
  },
  {
    id: "alzante",
    label: "Alzanti scorrevoli",
    emoji: "🏡",
    image: "/images/prod-gen-alzante.jpg",
    tag: "Grandi vetrate",
    smallOrderEligible: false,
    priorities: [
      "Più luce e vista sul giardino",
      "Isolamento termico",
      "Scorrimento leggero",
      "Soglia a filo pavimento",
      "Detrazioni fiscali",
    ],
    keywords: "alzant|scorrevol|vetrat",
  },
  {
    id: "porta",
    label: "Porte d'ingresso",
    emoji: "🚪",
    image: "/images/prod-gen-porta.jpg",
    tag: "Portoncini su misura",
    smallOrderEligible: false,
    priorities: ["Sicurezza antieffrazione", "Isolamento termico", "Design dell'ingresso", "Detrazioni fiscali"],
    keywords: "portoncin|porta d.ingresso|porta ingresso|blindat|ingresso",
  },
  {
    id: "persiane",
    label: "Scuri e persiane",
    emoji: "🌿",
    image: "/images/prod-gen-persiane.jpg",
    tag: "Anche ad arco",
    smallOrderEligible: false,
    priorities: ["Zero manutenzione", "Oscuramento", "Sicurezza", "Mantenere lo stile della casa"],
    keywords: "persian|scur|antoni|oscurant",
  },
  {
    id: "vetrina",
    label: "Vetrine",
    emoji: "🏬",
    image: "/images/prod-gen-vetrina.jpg",
    tag: "Negozi e uffici",
    smallOrderEligible: false,
    priorities: ["Visibilità del negozio", "Sicurezza", "Montaggio senza fermare l'attività", "Isolamento"],
    keywords: "vetrin|negozi|shop",
  },
  {
    id: "zanzariere",
    label: "Zanzariere e tapparelle",
    emoji: "🦟",
    image: "/images/prod-gen-zanzariere.jpg",
    tag: "Per completare",
    smallOrderEligible: true,
    priorities: ["Niente insetti in casa", "Animali in casa", "Tapparelle motorizzate", "Isolare il cassonetto"],
    keywords: "zanzar|tapparell|avvolgibil|cassonett",
  },
];

export const productById = (id?: string | null) => PRODUCTS.find((p) => p.id === id);
