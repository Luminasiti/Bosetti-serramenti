import "server-only";
import { createHash } from "node:crypto";

const sha = (v?: string) => (v ? createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);

/** Meta Conversions API "Lead", deduplicated with the browser pixel through eventId. */
export async function sendMetaLead(input: {
  eventId: string;
  email?: string;
  phone: string;
  name: string;
  city: string;
  zip: string;
  ip: string;
  userAgent: string;
  fbp?: string;
  fbc?: string;
  pageUrl?: string;
  contentName: string;
}) {
  const pixel = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) {
    console.info("[meta] META_PIXEL_ID / META_CAPI_TOKEN not set: CAPI Lead skipped.");
    return;
  }
  const [first, ...rest] = input.name.trim().split(/\s+/);
  let phone = input.phone.replace(/\D/g, "");
  if (!phone.startsWith("39")) phone = `39${phone}`;

  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.pageUrl,
        user_data: {
          em: sha(input.email) ? [sha(input.email)] : undefined,
          ph: [sha(phone)],
          fn: [sha(first)],
          ln: rest.length ? [sha(rest.join(" "))] : undefined,
          ct: [sha(input.city.replace(/\s+/g, ""))],
          zp: [sha(input.zip)],
          country: [sha("it")],
          client_ip_address: input.ip !== "unknown" ? input.ip : undefined,
          client_user_agent: input.userAgent,
          fbp: input.fbp,
          fbc: input.fbc,
        },
        custom_data: { content_name: input.contentName, currency: "EUR", value: 0 },
      },
    ],
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[meta] CAPI error", res.status, (await res.text()).slice(0, 300));
  } catch (err) {
    console.error("[meta] CAPI failed:", (err as Error).message);
  }
}
