import { KNOWLEDGE_BASE, type KnowledgeChunk } from "./knowledgeBase";

const STOPWORDS = new Set(
  "il lo la i gli le un uno una di a da in con su per tra fra e o ma se che chi cosa come dove quando quanto quanti quale quali è sono sei siete ho hai ha abbiamo avete hanno mi ti ci vi si ne non piu più del dello della dei degli delle al allo alla ai agli alle dal dalla nel nella nei sul sulla anche ancora molto poco questo questa quello quella mio mia tuo tua vostro vostra io tu lui lei noi voi loro the and or of to is are what how do you".split(
    " ",
  ),
);

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

export function tokenize(text: string) {
  return normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Prefix match so "finestre" hits "finestra", "detrazioni" hits "detrazione". */
const close = (a: string, b: string) => {
  const n = Math.min(a.length, b.length, 6);
  return n >= 4 ? a.slice(0, n) === b.slice(0, n) : a === b;
};

export function retrieve(query: string, k = 4): KnowledgeChunk[] {
  const q = tokenize(query);
  if (q.length === 0) return [];
  return KNOWLEDGE_BASE.map((chunk) => {
    const title = tokenize(chunk.title);
    const keywords = chunk.keywords.flatMap(tokenize);
    const content = tokenize(chunk.content);
    let score = 0;
    for (const t of q) {
      if (title.some((w) => close(w, t))) score += 3;
      if (keywords.some((w) => close(w, t))) score += 2;
      if (content.some((w) => close(w, t))) score += 1;
    }
    return { chunk, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}
