// Contact-form validation, shared by the chat form and the booking API.
import { CONFIG } from "./config";

export interface ContactInput {
  name: string;
  phone: string;
  email: string;
  street: string;
  scala: string;
  piano: string;
  citofono: string;
  cap: string;
  city: string;
  notes: string;
  privacy: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const EMAIL_RE = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[a-z]{2,}$/i;
const capRe = new RegExp(CONFIG.serviceAreaCapRegex);

export function validateContact(c: ContactInput): ContactErrors {
  const e: ContactErrors = {};
  const name = c.name.trim();
  if (name.length < 5 || name.split(/\s+/).length < 2) e.name = "Scrivi nome e cognome.";

  const phone = c.phone.replace(/[\s.\-()]/g, "");
  if (!/^[0-9+]{8,14}$/.test(phone) || phone.replace(/\D/g, "").length < 9) e.phone = "Controlla il numero di telefono.";

  const email = c.email.trim();
  if (email && (!EMAIL_RE.test(email) || email.length > 254 || /[\r\n]/.test(email))) e.email = "L'email non sembra corretta.";

  if (c.street.trim().length < 5) e.street = "Scrivi via e numero civico.";

  const cap = c.cap.trim();
  if (!/^\d{5}$/.test(cap)) e.cap = "Il CAP ha 5 cifre.";
  else if (!capRe.test(cap)) e.cap = `Il sopralluogo a domicilio è riservato alle ${CONFIG.serviceAreaName}.`;

  if (c.city.trim().length < 2) e.city = "Scrivi la città.";
  if (!c.privacy) e.privacy = "Serve il consenso per organizzare il sopralluogo.";
  return e;
}

/** "Via Roma 1 (Scala A, Piano 3, Citofono: Rossi)" */
export function fullAddress(c: Pick<ContactInput, "street" | "scala" | "piano" | "citofono">) {
  const extra = [
    c.scala.trim() && `Scala ${c.scala.trim()}`,
    c.piano.trim() && `Piano ${c.piano.trim()}`,
    c.citofono.trim() && `Citofono: ${c.citofono.trim()}`,
  ].filter(Boolean);
  return extra.length ? `${c.street.trim()} (${extra.join(", ")})` : c.street.trim();
}
