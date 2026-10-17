import { CONFIG } from "@/lib/concierge/config";
import { addToCalendarUrl, deleteEvent, insertEvent, isCalendarConfigured, isSlotFree } from "@/lib/concierge/calendar";
import { longLabel, slotRuleError } from "@/lib/concierge/dateRestrictions";
import { adminEmail, customerEmail, sendMail } from "@/lib/concierge/email";
import { sendMetaLead } from "@/lib/concierge/metaCapi";
import { clientIp, rateLimit } from "@/lib/concierge/rateLimit";
import { fullAddress, validateContact, type ContactInput } from "@/lib/concierge/validation";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const fail = (reason: string, status = 400) => Response.json({ ok: false, reason }, { status });

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`book:${ip}`, 6, 10 * 60_000);
  if (!limited.ok) return fail("Hai fatto troppe prenotazioni di seguito. Riprova tra qualche minuto o chiamaci.", 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail("Richiesta non valida.");
  }
  const c = (body.contact ?? {}) as Record<string, unknown>;

  const contact: ContactInput = {
    name: str(c.name, 80),
    phone: str(c.phone, 24),
    email: str(c.email, 254),
    street: str(c.street, 120),
    scala: str(c.scala, 20),
    piano: str(c.piano, 20),
    citofono: str(c.citofono, 60),
    cap: str(c.cap, 5),
    city: str(c.city, 60),
    notes: str(c.notes, 1000),
    privacy: c.privacy === true,
  };
  const errors = validateContact(contact);
  // Header-injection guard on top of the format check.
  if (/[\r\n,;]/.test(contact.email)) errors.email = "L'email non è valida.";
  const firstError = Object.values(errors)[0];
  if (firstError) return fail(firstError);

  const date = str(body.date, 10);
  const time = str(body.time, 5);
  const ruleError = slotRuleError(date, time);
  if (ruleError) return fail(ruleError);

  const products = str(body.productSummary, 300) || "Consulenza generale";
  const propertyType = str(body.propertyType, 80);
  const notes = str(body.notes, 2000);
  const transcript = str(body.transcript, 20000);
  const previousEventId = str(body.previousEventId, 200);
  const clientEventId = str(body.eventId, 100);
  const isUpdate = Boolean(body.isReschedule) || Boolean(previousEventId);
  const attribution = (typeof body.attribution === "object" && body.attribution) || {};
  const attributionText = Object.entries(attribution as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" && v)
    .map(([k, v]) => `${k}=${String(v).slice(0, 100)}`)
    .join(", ");

  // The slot may have been taken since the user saw it: re-check before writing.
  const free = await isSlotFree(date, time);
  if (free === false) {
    return fail("Questo orario è appena stato occupato. Scegli un altro orario, per favore.", 409);
  }

  const address = fullAddress(contact);
  const whenLabel = `${longLabel(date)} alle ${time}`;
  const location = `${address}, ${contact.cap} ${contact.city}`;

  let eventId: string | null = null;
  let calendarError: string | undefined;
  if (isCalendarConfigured()) {
    if (previousEventId) await deleteEvent(previousEventId);
    try {
      const event = await insertEvent({
        ymd: date,
        time,
        summary: `🏠 Sopralluogo ${CONFIG.consultantName}: ${contact.name} (${products})`,
        location,
        description: [
          `Cliente: ${contact.name}`,
          `Telefono: ${contact.phone}`,
          `Email: ${contact.email || "non indicata"}`,
          `Indirizzo: ${location}`,
          `Immobile: ${propertyType || "non indicato"}`,
          `Prodotti: ${products}`,
          notes && `Note e obiettivi:\n${notes}`,
          contact.notes && `Note del cliente: ${contact.notes}`,
          `Showroom: ${CONFIG.showroomAddress}`,
          isUpdate ? "(Appuntamento spostato dal cliente)" : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
      eventId = event.id;
    } catch (err) {
      calendarError = (err as Error).message.slice(0, 200);
      console.error("[book] calendar insert failed:", calendarError);
    }
  } else {
    calendarError = "Google Calendar non configurato";
  }

  const mailData = {
    isUpdate,
    name: contact.name,
    phone: contact.phone,
    email: contact.email,
    address,
    cap: contact.cap,
    city: contact.city,
    whenLabel,
    products,
    propertyType,
    notes: [notes, contact.notes && `Note del cliente: ${contact.notes}`].filter(Boolean).join("\n"),
    calendarUrl: addToCalendarUrl(
      date,
      time,
      `Sopralluogo ${CONFIG.companyName}`,
      location,
      `Sopralluogo gratuito con ${CONFIG.consultantName}. Per spostarlo: ${CONFIG.phoneDisplay}`,
    ),
    transcript,
    inCalendar: Boolean(eventId),
    calendarError,
    attribution: attributionText,
  };

  const admin = process.env.ADMIN_NOTIFICATION_EMAIL;
  const jobs: Promise<unknown>[] = [];
  if (admin) {
    const m = adminEmail(mailData);
    jobs.push(sendMail(admin, m.subject, m.html));
  } else {
    console.warn("[book] ADMIN_NOTIFICATION_EMAIL not set: no admin notification.", eventId ? "" : "Booking is NOT in any calendar!");
  }
  let customerMail: Promise<boolean> = Promise.resolve(false);
  if (contact.email) {
    const m = customerEmail(mailData);
    customerMail = sendMail(contact.email, m.subject, m.html);
    jobs.push(customerMail);
  }
  if (!isUpdate && clientEventId) {
    jobs.push(
      sendMetaLead({
        eventId: clientEventId,
        email: contact.email || undefined,
        phone: contact.phone,
        name: contact.name,
        city: contact.city,
        zip: contact.cap,
        ip,
        userAgent: request.headers.get("user-agent") ?? "",
        fbp: str(body.fbp, 200) || undefined,
        fbc: str(body.fbc, 300) || undefined,
        pageUrl: str(body.pageUrl, 500) || undefined,
        contentName: products,
      }),
    );
  }
  await Promise.allSettled(jobs);
  const emailSent = await customerMail.catch(() => false);

  return Response.json({ ok: true, eventId, inCalendar: Boolean(eventId), emailSent, calendarUrl: mailData.calendarUrl });
}
