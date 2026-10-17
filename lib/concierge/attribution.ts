// Captures ad click ids and UTM parameters on landing, so they can be sent with the booking.
const KEY = "bosetti_attribution_v1";
const PARAMS = ["gclid", "fbclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number], string>> & { landing_page?: string };

export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const found: Attribution = {};
    for (const p of PARAMS) {
      const v = url.searchParams.get(p);
      if (v) found[p] = v.slice(0, 200);
    }
    if (Object.keys(found).length === 0) return;
    found.landing_page = url.pathname;
    // Latest click wins: overwrite what was stored before.
    localStorage.setItem(KEY, JSON.stringify({ ...found, captured_at: new Date().toISOString() }));
  } catch {
    /* storage blocked: attribution is best-effort */
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
