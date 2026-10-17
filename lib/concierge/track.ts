// Thin wrapper around gtag (GA4 / Google Ads) and fbq (Meta Pixel). Safe when neither is loaded.
import { getAttribution } from "./attribution";

type Params = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Cookie banner integration: set localStorage "cookie_consent" to "declined" to block consent upgrades. */
function cookiesDeclined() {
  try {
    return localStorage.getItem("cookie_consent") === "declined";
  } catch {
    return false;
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
    if (!window.gtag) window.dataLayer?.push({ event, ...params });
  } catch (err) {
    console.warn("[track]", event, err);
  }
}

/** Fires the lead once per booking: GA4/Ads generate_lead + Meta Lead with the same eventID as the server CAPI call. */
export function trackLead(params: { product: string; content_name: string; eventID: string }) {
  if (typeof window === "undefined") return;
  if (!cookiesDeclined()) {
    window.gtag?.("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  }
  const { gclid } = getAttribution();
  track("generate_lead", {
    product: params.product,
    content_name: params.content_name,
    currency: "EUR",
    value: 0,
    eventID: params.eventID,
    ...(gclid ? { gclid } : {}),
  });
  try {
    window.fbq?.("track", "Lead", { content_name: params.content_name, currency: "EUR", value: 0 }, { eventID: params.eventID });
  } catch (err) {
    console.warn("[track] fbq Lead", err);
  }
}
