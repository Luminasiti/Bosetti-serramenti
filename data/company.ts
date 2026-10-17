export interface PhoneContact {
  id: string;
  number: string;
  href: string;
  who: string;
  callFor: string;
}

export interface FamilyMember {
  name: string;
  role: string;
  line: string;
  /** Real portrait still to be shot: until then the card shows a branded placeholder. */
  photo?: string;
}

export const companyData = {
  name: "Bosetti Serramenti",
  foundedText: "da oltre trent'anni",
  address: {
    street: "Via Madonnina 11",
    postalCode: "25018",
    city: "Montichiari",
    province: "BS",
    full: "Via Madonnina 11, 25018 Montichiari (BS)",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Bosetti+Serramenti+Via+Madonnina+11+25018+Montichiari+BS",
    embedUrl:
      "https://www.google.com/maps?q=Bosetti+Serramenti,+Via+Madonnina+11,+25018+Montichiari+BS&output=embed",
  },
  email: "info@bosettiserramenti.com",
  whatsapp: {
    number: "339 3330834",
    url: "https://wa.me/393393330834?text=Ciao%2C%20vorrei%20informazioni%20per%20un%20sopralluogo%20gratuito.",
  },
  // Who answers which number is our proposal (defect #6 in the brief): to confirm with Marco.
  phones: [
    {
      id: "ufficio",
      number: "030 961983",
      href: "tel:+39030961983",
      who: "Ufficio · Simona",
      callFor: "Preventivi, appuntamenti e informazioni",
    },
    {
      id: "marco",
      number: "339 3330834",
      href: "tel:+393393330834",
      who: "Marco · anche WhatsApp",
      callFor: "Sopralluoghi e misure",
    },
    {
      id: "laboratorio",
      number: "338 3309567",
      href: "tel:+393383309567",
      who: "Laboratorio e montaggi",
      callFor: "Lavori in corso e assistenza",
    },
  ] as PhoneContact[],
  hours: [
    { days: "Lunedì – Venerdì", time: "8:00–12:00 · 14:00–18:00" },
    { days: "Sabato", time: "8:00–12:00" },
    { days: "Domenica", time: "Chiuso" },
  ],
  socials: {
    facebook: "https://www.facebook.com/BosettiSerramenti/",
    instagram: "https://www.instagram.com/bosettiserramenti/",
  },
  googleRating: {
    score: "4,9",
    count: 39,
    url: "https://www.google.com/maps/search/?api=1&query=Bosetti+Serramenti+Montichiari",
  },
  // Names and roles from the brief (cited in Google reviews). Claudio's exact role to confirm.
  family: [
    {
      name: "Marco",
      role: "Titolare",
      line: "Ha avviato il laboratorio oltre trent'anni fa. Viene lui a casa tua a prendere le misure.",
    },
    {
      name: "Claudio",
      role: "Laboratorio e montaggio",
      line: "Taglia e assembla i profili in laboratorio, poi li monta a casa tua.",
    },
    {
      name: "Leonardo",
      role: "Sopralluoghi e montaggio",
      line: "Con Marco fa i sopralluoghi e segue la posa, fino all'ultima regolazione.",
    },
    {
      name: "Simona",
      role: "Ufficio",
      line: "Prepara il preventivo, ti richiama e tiene il calendario dei lavori.",
    },
  ] as FamilyMember[],
};
