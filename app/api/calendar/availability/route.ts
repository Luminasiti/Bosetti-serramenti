import { getAvailability } from "@/lib/concierge/calendar";
import { parseYmd } from "@/lib/concierge/dateRestrictions";
import { clientIp, rateLimit } from "@/lib/concierge/rateLimit";

export async function GET(request: Request) {
  const limited = rateLimit(`avail:${clientIp(request)}`, 120, 60_000);
  if (!limited.ok) return Response.json({ error: "Troppe richieste" }, { status: 429 });

  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!parseYmd(date)) return Response.json({ error: "Parametro date non valido (YYYY-MM-DD)" }, { status: 400 });

  const { slots, source } = await getAvailability(date);
  return Response.json({ slots, source }, { headers: { "Cache-Control": "no-store" } });
}
