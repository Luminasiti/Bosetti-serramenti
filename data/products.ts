export interface ProductItem {
  /** Matches the option id in the booking wizard, so a card can pre-select it. */
  id: string;
  name: string;
  line: string;
  image: string;
  alt: string;
}

// Images: AI-generated with Higgsfield (SOUL V2) as placeholders for the prototype, to replace with real job photos.
export const productsData: ProductItem[] = [
  {
    id: "finestre",
    name: "Finestre e portefinestre",
    line: "Taglio termico, su misura dei tuoi muri. Non vanno mai riverniciate.",
    image: "/images/prod-gen-finestre.jpg",
    alt: "Finestra in alluminio antracite aperta a vasistas su davanzale in marmo",
  },
  {
    id: "alzante",
    name: "Alzanti scorrevoli",
    line: "Grandi vetrate verso il giardino, profili sottili e tanta luce.",
    image: "/images/prod-gen-alzante.jpg",
    alt: "Grande alzante scorrevole in alluminio aperto sul terrazzo in legno",
  },
  {
    id: "porta",
    name: "Porte e portoncini",
    line: "Ingressi solidi e isolati, con serrature di sicurezza.",
    image: "/images/prod-gen-porta.jpg",
    alt: "Portoncino d'ingresso in alluminio antracite con maniglione verticale",
  },
  {
    id: "persiane",
    name: "Scuri e persiane",
    line: "Le forme di sempre, anche ad arco, senza più manutenzione.",
    image: "/images/prod-gen-persiane.jpg",
    alt: "Persiane verdi in alluminio su finestra ad arco, facciata ocra",
  },
  {
    id: "vetrina",
    name: "Vetrine",
    line: "Ingressi per negozi e uffici, montati senza fermarti l'attività.",
    image: "/images/prod-gen-vetrina.jpg",
    alt: "Vetrina in alluminio nero sotto un portico in pietra",
  },
  {
    id: "zanzariere",
    name: "Zanzariere e tapparelle",
    line: "Per completare le finestre nuove, o rinnovare quelle che hai.",
    image: "/images/prod-gen-zanzariere.jpg",
    alt: "Tapparella in alluminio abbassata a metà con zanzariera sulla finestra",
  },
];
