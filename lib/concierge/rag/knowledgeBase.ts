// Facts the assistant may use. Sources: bosettiserramenti.com and the Luminasiti brief (Oct 2026).
// Keep every chunk true and verifiable: no prices, no warranty years, no percentages not confirmed by Bosetti.
export interface KnowledgeChunk {
  id: string;
  title: string;
  keywords: string[];
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "azienda",
    title: "Chi siamo: la famiglia Bosetti",
    keywords: ["famiglia", "chi", "siete", "azienda", "storia", "anni", "marco", "claudio", "leonardo", "simona"],
    content:
      "Bosetti Serramenti è un'impresa di famiglia a Montichiari (BS), attiva da oltre trent'anni. Marco è il titolare, i figli Claudio e Leonardo lavorano in laboratorio, ai sopralluoghi e al montaggio, Simona segue l'ufficio e i preventivi. Su Google abbiamo 4,9 stelle su 39 recensioni.",
  },
  {
    id: "produzione",
    title: "Produzione propria in alluminio",
    keywords: ["produzione", "produciamo", "laboratorio", "alluminio", "rivenditori", "materia", "prima", "profili", "qualità"],
    content:
      "Non siamo rivenditori: tagliamo, assembliamo e montiamo noi i serramenti in alluminio nel laboratorio di Via Madonnina 11 a Montichiari. La materia prima viene selezionata dai nostri tecnici interni. Così controlliamo qualità e tempi.",
  },
  {
    id: "prodotti",
    title: "Cosa facciamo",
    keywords: ["prodotti", "catalogo", "finestre", "porte", "persiane", "scuri", "alzanti", "scorrevoli", "vetrine", "zanzariere", "tapparelle"],
    content:
      "Facciamo in alluminio, su misura: finestre e portefinestre, alzanti scorrevoli, porte e portoncini d'ingresso, scuri e persiane (anche ad arco), vetrine per negozi e uffici, zanzariere e tapparelle. Anche serramenti antieffrazione.",
  },
  {
    id: "posa",
    title: "Posa certificata CasaClima",
    keywords: ["posa", "certificata", "casaclima", "thermo", "montaggio", "installazione", "certificazione"],
    content:
      "Siamo certificati CasaClima con il sistema Thermo Posa. Consegna e montaggio li facciamo noi, a casa, in ufficio o in negozio, con precisione e cercando di essere il meno invasivi possibile.",
  },
  {
    id: "detrazioni",
    title: "Detrazioni fiscali",
    keywords: ["detrazione", "detrazioni", "bonus", "fiscale", "ecobonus", "50", "65", "enea", "agevolazioni"],
    content:
      "Ogni serramento che installiamo è certificato a norma di legge per il recupero e la detrazione fiscale. La percentuale e le condizioni dipendono dalla normativa in vigore e dalla tua situazione: le verifichiamo insieme al sopralluogo.",
  },
  {
    id: "sopralluogo",
    title: "Sopralluogo gratuito",
    keywords: ["sopralluogo", "gratis", "gratuito", "misure", "visita", "appuntamento", "quanto", "dura"],
    content:
      "Il sopralluogo è gratuito e senza impegno. Leonardo o Marco vengono a casa tua, prendono le misure esatte e ti consigliano. Poi Simona prepara il preventivo voce per voce.",
  },
  {
    id: "prezzi",
    title: "Prezzi e preventivi",
    keywords: ["prezzo", "prezzi", "costo", "costa", "quanto", "preventivo", "listino", "euro"],
    content:
      "Il prezzo dipende da misure, tipo di apertura, vetro e finiture, quindi non diamo cifre a voce senza vedere il lavoro. Dopo il sopralluogo gratuito ricevi un preventivo chiaro, voce per voce.",
  },
  {
    id: "contatti",
    title: "Contatti, orari e sede",
    keywords: ["orari", "aperti", "sede", "showroom", "indirizzo", "dove", "telefono", "email", "whatsapp", "montichiari"],
    content:
      "Siamo in Via Madonnina 11, 25018 Montichiari (BS). Orari: lunedì–venerdì 8:00–12:00 e 14:00–18:00, sabato 8:00–12:00, domenica chiuso. Ufficio 030 961983, email info@bosettiserramenti.com.",
  },
  {
    id: "zona",
    title: "Zona servita",
    keywords: ["zona", "dove", "venite", "brescia", "mantova", "cremona", "provincia", "lontano", "trasporto"],
    content:
      "Facciamo sopralluoghi nelle province di Brescia, Mantova e Cremona. Trasporto e consegna sono compresi nel nostro servizio.",
  },
  {
    id: "alluminio",
    title: "Perché l'alluminio",
    keywords: ["alluminio", "pvc", "legno", "differenza", "meglio", "manutenzione", "durata", "isolamento", "taglio", "termico"],
    content:
      "L'alluminio a taglio termico isola bene, non marcisce, non si deforma e non va riverniciato. Permette profili sottili, quindi più vetro e più luce, ed è ideale per grandi scorrevoli.",
  },
];
