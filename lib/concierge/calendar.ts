import "server-only";
import { JWT } from "google-auth-library";
import { CONFIG } from "./config";
import { isLateCutoffSlot, isWorkingDay, zonedIso, zonedToUtc } from "./dateRestrictions";

const API = "https://www.googleapis.com/calendar/v3";

export interface Slot {
  time: string;
  datetime: string;
  available: boolean;
}

let client: JWT | null | undefined;
let warned = false;

function getClient(): JWT | null {
  if (client !== undefined) return client;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key || !process.env.GOOGLE_CALENDAR_ID) {
    if (!warned) {
      console.warn("[calendar] Google Calendar not configured: every slot is treated as free and no event is created.");
      warned = true;
    }
    client = null;
    return null;
  }
  client = new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/calendar"] });
  return client;
}

export const isCalendarConfigured = () => getClient() !== null;
const calendarId = () => encodeURIComponent(process.env.GOOGLE_CALENDAR_ID ?? "");

async function gcal<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const c = getClient();
  if (!c) throw new Error("Google Calendar not configured");
  const res = await c.request<T>({
    url: `${API}${path}`,
    method: (init.method ?? "GET") as "GET" | "POST" | "DELETE",
    data: init.body,
  });
  return res.data;
}

function slotEnd(ymd: string, time: string) {
  return new Date(zonedToUtc(ymd, time).getTime() + CONFIG.slotDurationMinutes * 60000);
}

export async function getBusyIntervals(ymd: string) {
  const timeMin = zonedToUtc(ymd, "00:00").toISOString();
  const timeMax = zonedToUtc(ymd, "23:59").toISOString();
  const data = await gcal<{ calendars: Record<string, { busy: { start: string; end: string }[] }> }>("/freeBusy", {
    method: "POST",
    body: { timeMin, timeMax, timeZone: CONFIG.timezone, items: [{ id: process.env.GOOGLE_CALENDAR_ID }] },
  });
  const cal = Object.values(data.calendars ?? {})[0];
  return (cal?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/** Slots for a day. Falls back to "all free" (except the late-cutoff slot) if Google isn't reachable. */
export async function getAvailability(ymd: string): Promise<{ slots: Slot[]; source: "google" | "fallback" }> {
  if (!isWorkingDay(ymd)) return { slots: [], source: "fallback" };

  let busy: { start: Date; end: Date }[] | null = null;
  if (getClient()) {
    try {
      busy = await getBusyIntervals(ymd);
    } catch (err) {
      console.error("[calendar] freebusy failed, falling back to all-free:", (err as Error).message);
    }
  }

  const slots = CONFIG.slotTimes.map((time) => {
    const start = zonedToUtc(ymd, time);
    const end = slotEnd(ymd, time);
    const overlaps = busy?.some((b) => start < b.end && b.start < end) ?? false;
    return { time, datetime: zonedIso(ymd, time), available: !overlaps && !isLateCutoffSlot(ymd, time) };
  });
  return { slots, source: busy ? "google" : "fallback" };
}

/** True / false when Google answered; null when it couldn't be checked. */
export async function isSlotFree(ymd: string, time: string): Promise<boolean | null> {
  if (!getClient()) return null;
  try {
    const busy = await getBusyIntervals(ymd);
    const start = zonedToUtc(ymd, time);
    const end = slotEnd(ymd, time);
    return !busy.some((b) => start < b.end && b.start < end);
  } catch (err) {
    console.error("[calendar] freebusy re-check failed:", (err as Error).message);
    return null;
  }
}

export async function insertEvent(input: {
  ymd: string;
  time: string;
  summary: string;
  location: string;
  description: string;
}): Promise<{ id: string; htmlLink?: string }> {
  return gcal("/calendars/" + calendarId() + "/events", {
    method: "POST",
    body: {
      summary: input.summary,
      location: input.location,
      description: input.description,
      start: { dateTime: zonedIso(input.ymd, input.time), timeZone: CONFIG.timezone },
      end: { dateTime: slotEnd(input.ymd, input.time).toISOString(), timeZone: CONFIG.timezone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });
}

export async function deleteEvent(eventId: string) {
  try {
    await gcal(`/calendars/${calendarId()}/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
    return true;
  } catch (err) {
    console.error("[calendar] delete of previous event failed:", (err as Error).message);
    return false;
  }
}

/** Google Calendar "add event" link for the customer. */
export function addToCalendarUrl(ymd: string, time: string, title: string, location: string, details: string) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(zonedToUtc(ymd, time))}/${fmt(slotEnd(ymd, time))}`,
    details,
    location,
    ctz: CONFIG.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
