// Local parsing of free-text answers, tried before calling the LLM.
import { CONFIG, PRODUCTS } from "./config";
import { addDays, isWorkingDay, parseYmd, todayYmd, weekday } from "./dateRestrictions";
import { normalize } from "./rag/retriever";
import type { TimeOfDay } from "./chatTypes";

const NUMBER_WORDS: Record<string, number> = {
  un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10,
};
const NUM = `(\\d{1,2}|${Object.keys(NUMBER_WORDS).join("|")})`;
const toNumber = (s: string) => (/^\d+$/.test(s) ? Number(s) : NUMBER_WORDS[s]);

export function parseNumbers(text: string): number[] {
  const t = normalize(text);
  return [...t.matchAll(new RegExp(`\\b${NUM}\\b`, "g"))].map((m) => toNumber(m[1])).filter((n) => n > 0 && n <= 99);
}

/** Products mentioned in the text, plus any quantities written next to them ("3 finestre"). */
export function parseProducts(text: string) {
  const t = normalize(text);
  const products: string[] = [];
  const quantities: Record<string, number> = {};

  for (const p of PRODUCTS) {
    if (!new RegExp(p.keywords).test(t)) continue;
    products.push(p.id);
    if (p.splitQuantity) {
      // "2 porte finestre" / "2 portefinestre" first, then plain "3 finestre".
      const pf = new RegExp(`${NUM}\\s+(porte\\s?finestr|portafinestr|porta\\s?finestr)`).exec(t);
      const f = new RegExp(`${NUM}\\s+(finestr|infiss|serrament)`).exec(t.replace(/porte?\s?finestr\w*|portafinestr\w*/g, " "));
      if (pf) quantities[`${p.id}:${p.splitQuantity[1].label}`] = toNumber(pf[1]);
      if (f) quantities[`${p.id}:${p.splitQuantity[0].label}`] = toNumber(f[1]);
    } else {
      const m = new RegExp(`${NUM}\\s+(?:\\w+\\s+)?(?:${p.keywords})`).exec(t);
      if (m) quantities[p.id] = toNumber(m[1]);
    }
  }
  return { products, quantities };
}

const NEED_SYNONYMS: [RegExp, RegExp][] = [
  [/bollett|risparmi|isolament|termic|fredd|caldo|spiffer/, /isolamento|termic/i],
  [/rumor|acustic|silenz|traffic/, /rumore/i],
  [/sicur|ladri|furt|antieffraz|scass/, /sicurezza/i],
  [/luce|luminos|vista|design|estetic|bell/, /luce|design|vista/i],
  [/detraz|bonus|fiscal|ecobonus/, /detrazioni/i],
  [/animal|cane|gatto|gatti|cani/, /animali/i],
  [/motori|elettric|automat/, /motorizzate/i],
  [/insett|zanzar|mosch/, /insetti/i],
  [/manutenz|verniciar|durat/, /manutenzione/i],
  [/buio|oscur/, /oscuramento/i],
];

export function parseNeeds(text: string, available: string[]) {
  const t = normalize(text);
  const found = new Set<string>();
  for (const label of available) {
    const words = normalize(label).split(/\s+/).filter((w) => w.length > 4);
    if (words.some((w) => t.includes(w.slice(0, 6)))) found.add(label);
  }
  for (const [trigger, labelRe] of NEED_SYNONYMS) {
    if (!trigger.test(t)) continue;
    for (const label of available) if (labelRe.test(label)) found.add(label);
  }
  return [...found];
}

export function parseProperty(text: string) {
  const t = normalize(text);
  const [condo, historic, villa, office] = CONFIG.propertyTypes;
  if (/palazz|storic|epoca|centro storico/.test(t)) return historic;
  if (/condomin|appartament/.test(t)) return condo;
  if (/vill|indipendent|casa singola|bifamiliar|schiera/.test(t)) return villa;
  if (/uffici|negozi|attivit|capannon|azienda/.test(t)) return office;
  return null;
}

export function parseTimeOfDay(text: string): TimeOfDay | null {
  const t = normalize(text);
  if (/mattin/.test(t)) return "morning";
  if (/pomerigg|dopo pranzo|sera/.test(t)) return "afternoon";
  if (/qualsiasi|indifferent|quando vuoi|sempre|tutto il giorno|va bene tutto/.test(t)) return "any";
  return null;
}

export function parseOrdinal(text: string) {
  const t = normalize(text);
  const m = /\b(primo|prima|secondo|seconda|terzo|terza|quarto|quarta|1|2|3|4)\b/.exec(t);
  if (!m) return null;
  return { primo: 0, prima: 0, "1": 0, secondo: 1, seconda: 1, "2": 1, terzo: 2, terza: 2, "3": 2, quarto: 3, quarta: 3, "4": 3 }[m[1]] ?? null;
}

const WEEKDAY_WORDS = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];

/** "domani alle 11", "lunedì pomeriggio", "21/10 alle 14:00" → a date and/or the closest slot time. */
export function parseDateTime(text: string, now = new Date()) {
  const t = normalize(text);
  const today = todayYmd(now);
  let date: string | undefined;

  if (/\bdopodomani\b/.test(t)) date = addDays(today, 2);
  else if (/\bdomani\b/.test(t)) date = addDays(today, 1);
  else {
    const wd = WEEKDAY_WORDS.findIndex((w) => t.includes(w));
    if (wd >= 0) {
      let d = addDays(today, 1);
      while (weekday(d) !== wd) d = addDays(d, 1);
      date = d;
    }
    const dm = /\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/.exec(t);
    if (dm) {
      const y = dm[3] ? (dm[3].length === 2 ? 2000 + Number(dm[3]) : Number(dm[3])) : Number(today.slice(0, 4));
      let candidate = `${y}-${String(dm[2]).padStart(2, "0")}-${String(dm[1]).padStart(2, "0")}`;
      if (parseYmd(candidate) && !dm[3] && candidate <= today) candidate = `${y + 1}${candidate.slice(4)}`;
      if (parseYmd(candidate)) date = candidate;
    }
  }

  let time: string | undefined;
  const tm = /\b(?:alle|ore|verso le|per le)?\s*(\d{1,2})(?:[:.](\d{2}))?\b(?!\s*[/.-]\d)/.exec(t.replace(/\b\d{1,2}[/.-]\d{1,2}([/.-]\d{2,4})?\b/g, " "));
  if (tm && /(alle|ore|verso|per le)/.test(t)) {
    const minutes = Number(tm[1]) * 60 + Number(tm[2] ?? 0);
    const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
    time = [...CONFIG.slotTimes].sort((a, b) => Math.abs(toMin(a) - minutes) - Math.abs(toMin(b) - minutes))[0];
  } else if (/mattin/.test(t)) time = CONFIG.slotTimes[0];
  else if (/pomerigg/.test(t)) time = CONFIG.slotTimes[2];

  if (!date && !time) return null;
  return { date, time, weekendRequested: date ? !isWorkingDay(date) : false };
}

export const isRescheduleRequest = (text: string) =>
  /sposta|cambia(re)? (la )?(data|orario|giorno|ora)|altro giorno|altro orario|rimanda|anticipa|posticip|non posso piu|non riesco/.test(
    normalize(text),
  );
