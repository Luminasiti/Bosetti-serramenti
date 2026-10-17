// Date rules for survey booking. All calendar dates are "YYYY-MM-DD" strings in CONFIG.timezone,
// handled through Date.UTC so they never shift by a day with the runtime's local timezone.
import { CONFIG } from "./config";

const TZ = CONFIG.timezone;
const pad = (n: number) => String(n).padStart(2, "0");

export function parseYmd(ymd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== mo - 1 || probe.getUTCDate() !== d) return null;
  return { y, mo, d };
}

export function addDays(ymd: string, days: number) {
  const p = parseYmd(ymd)!;
  const dt = new Date(Date.UTC(p.y, p.mo - 1, p.d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** 0 = Sunday … 6 = Saturday */
export function weekday(ymd: string) {
  const p = parseYmd(ymd)!;
  return new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay();
}

export function isWorkingDay(ymd: string) {
  return (CONFIG.workingDays as readonly number[]).includes(weekday(ymd));
}

/** Wall-clock parts of an instant in the configured timezone. */
export function zonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour"), mi: get("minute"), s: get("second") };
}

export function todayYmd(now = new Date()) {
  const p = zonedParts(now);
  return `${p.y}-${pad(p.mo)}-${pad(p.d)}`;
}

/** Real UTC offset (minutes) of the timezone at a given instant: handles CET/CEST correctly. */
export function tzOffsetMinutes(instant: Date) {
  const p = zonedParts(instant);
  const asUtc = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** Converts a wall-clock date+time in the timezone to a real instant. */
export function zonedToUtc(ymd: string, hhmm: string) {
  const p = parseYmd(ymd)!;
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(p.y, p.mo - 1, p.d, h, mi);
  // Two passes resolve the offset even right next to a DST change.
  let offset = tzOffsetMinutes(new Date(guess));
  let instant = guess - offset * 60000;
  offset = tzOffsetMinutes(new Date(instant));
  instant = guess - offset * 60000;
  return new Date(instant);
}

/** ISO string with the real offset, e.g. 2026-12-03T08:30:00+01:00 */
export function zonedIso(ymd: string, hhmm: string) {
  const instant = zonedToUtc(ymd, hhmm);
  const off = tzOffsetMinutes(instant);
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return `${ymd}T${hhmm}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** After the late-cutoff hour, tomorrow's first slot can't be booked (no time to prepare). */
export function isLateCutoffSlot(ymd: string, hhmm: string, now = new Date()) {
  const p = zonedParts(now);
  return p.h >= CONFIG.lateCutoffHour && ymd === addDays(todayYmd(now), 1) && hhmm === CONFIG.slotTimes[0];
}

/** Returns an Italian reason when a date/time can't be booked, or null when the rules allow it. */
export function slotRuleError(ymd: string, hhmm: string, now = new Date()): string | null {
  if (!parseYmd(ymd)) return "La data non è valida.";
  if (!(CONFIG.slotTimes as readonly string[]).includes(hhmm)) return "Scegli uno degli orari proposti.";
  if (ymd <= todayYmd(now)) return "Posso fissare il sopralluogo da domani in poi.";
  if (ymd > addDays(todayYmd(now), 60)) return "Possiamo fissare il sopralluogo entro i prossimi due mesi.";
  if (!isWorkingDay(ymd)) return "Il sabato e la domenica non facciamo sopralluoghi: scegli un giorno dal lunedì al venerdì.";
  if (isLateCutoffSlot(ymd, hhmm, now))
    return `A quest'ora non riesco più a organizzare il sopralluogo di domani alle ${hhmm}: scegli un orario più tardi o un altro giorno.`;
  return null;
}

export function nextWorkingDay(from = todayYmd()) {
  let d = addDays(from, 1);
  while (!isWorkingDay(d)) d = addDays(d, 1);
  return d;
}

const WEEKDAYS = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
const WEEKDAYS_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

/** "MAR 21 ott" */
export function shortLabel(ymd: string) {
  const p = parseYmd(ymd)!;
  return `${WEEKDAYS[weekday(ymd)]} ${p.d} ${MONTHS[p.mo - 1]}`;
}

/** "martedì 21 ottobre" style without the full month name list: "martedì 21/10" */
export function longLabel(ymd: string) {
  return `${WEEKDAYS_LONG[weekday(ymd)]} ${italianDate(ymd)}`;
}

/** "21/10/2026" */
export function italianDate(ymd: string) {
  const p = parseYmd(ymd)!;
  return `${pad(p.d)}/${pad(p.mo)}/${p.y}`;
}
