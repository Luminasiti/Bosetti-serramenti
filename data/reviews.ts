export interface GoogleReview {
  id: string;
  author: string;
  text: string;
}

// Verbatim Google reviews only. Before publishing, check each text against the Google Business
// profile and get permission to show first name + initial.
export const reviewsData: GoogleReview[] = [
  {
    id: "giulia-f",
    author: "Giulia F.",
    text: "Anche il secondo lavoro che abbiamo commissionato loro può confermare che sono dei professionisti eccezionali. Attenzione, precisione e passione li contraddistinguono nel loro settore e anche a livello personale sono una famiglia come poche. Per non parlare dei complimenti che riceviamo per i nuovi serramenti. Non possiamo che consigliarli a chiunque!",
  },
  {
    id: "nicola-g",
    author: "Nicola G.",
    text: "Azienda molto seria e molto affidabile! La professionalità e la cura ai minimi dettagli ci hanno fatto sentire in ottime mani! Siamo estremamente soddisfatti del risultato ottenuto, rapporto qualità-prezzo ottimo. Oltre che per la professionalità a Marco e al figlio Leonardo (e a tutto lo staff dietro le quinte) i nostri complimenti per la gentilezza e la carineria dimostrati. Altamente consigliata e già raccomandata ad amici e parenti!",
  },
  {
    id: "mario-b",
    author: "Mario B.",
    text: "Impresa a conduzione familiare. Seri, precisi e puntuali. Produzione di ottimi serramenti e montaggio professionale per un risultato perfetto. Altamente consigliati!",
  },
];

// Short verbatim excerpt used as the pull-quote in the family section.
export const familyQuote = {
  text: "Anche a livello personale sono una famiglia come poche.",
  author: "Giulia F.",
};
