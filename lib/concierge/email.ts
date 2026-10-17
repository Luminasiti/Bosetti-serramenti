import "server-only";
import nodemailer from "nodemailer";
import { CONFIG } from "./config";

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

let warned = false;

function transport() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    if (!warned) {
      console.warn("[email] EMAIL_USER / EMAIL_PASS not set: emails are logged, not sent.");
      warned = true;
    }
    return null;
  }
  // EMAIL_HOST/EMAIL_PORT for a custom SMTP; defaults to Gmail (use an app password).
  return process.env.EMAIL_HOST
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT ?? 465),
        secure: Number(process.env.EMAIL_PORT ?? 465) === 465,
        auth: { user, pass },
      })
    : nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

export async function sendMail(to: string, subject: string, html: string) {
  const t = transport();
  if (!t) {
    console.info(`[email] (not sent) to=${to} subject="${subject}"`);
    return false;
  }
  try {
    await t.sendMail({ from: `"${CONFIG.companyName}" <${process.env.EMAIL_USER}>`, to, subject, html });
    return true;
  } catch (err) {
    console.error("[email] send failed:", (err as Error).message);
    return false;
  }
}

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#F6F4F1;font-family:Arial,Helvetica,sans-serif;color:#1F1F1F">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4F1;padding:24px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#2B2B2B;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:bold">${escapeHtml(CONFIG.companyName)}
<div style="height:3px;width:40px;background:${CONFIG.brandColors.primary};margin-top:10px"></div></td></tr>
<tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${body}</td></tr>
<tr><td style="padding:16px 24px;background:#F6F4F1;font-size:12px;color:#55595D">${escapeHtml(CONFIG.companyName)} · ${escapeHtml(CONFIG.showroomAddress)} · ${escapeHtml(CONFIG.phoneDisplay)}</td></tr>
</table></td></tr></table></body></html>`;

const row = (label: string, value: string) =>
  value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#55595D;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:bold">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`
    : "";

export interface BookingMailData {
  isUpdate: boolean;
  name: string;
  phone: string;
  email: string;
  address: string;
  cap: string;
  city: string;
  whenLabel: string;
  products: string;
  propertyType: string;
  notes: string;
  calendarUrl: string;
  transcript: string;
  inCalendar: boolean;
  calendarError?: string;
  attribution: string;
}

export function customerEmail(d: BookingMailData) {
  const title = d.isUpdate ? "Il tuo sopralluogo è stato spostato" : "Il tuo sopralluogo è confermato";
  const body = `<p style="margin:0 0 16px;line-height:1.5">Ciao ${escapeHtml(d.name.split(" ")[0])}, ${
    d.isUpdate ? "abbiamo aggiornato il tuo appuntamento." : "grazie! Ti aspettiamo."
  } ${escapeHtml(CONFIG.consultantName)} passa da te per il sopralluogo gratuito.</p>
<table cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:20px">
${row("Quando", d.whenLabel)}${row("Dove", `${d.address}, ${d.cap} ${d.city}`)}${row("Richiesta", d.products)}</table>
<a href="${escapeHtml(d.calendarUrl)}" style="display:inline-block;background:${CONFIG.brandColors.primary};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">Aggiungi al calendario</a>
<p style="margin:20px 0 0;font-size:14px;line-height:1.5;color:#55595D">Ogni serramento che installiamo è certificato per le detrazioni fiscali: ne parliamo al sopralluogo.
Se vuoi vedere profili e finiture dal vivo, passa in laboratorio in ${escapeHtml(CONFIG.showroomAddress)}.<br>
Per spostare l'appuntamento chiama lo ${escapeHtml(CONFIG.phoneDisplay)}.</p>`;
  return { subject: `${d.isUpdate ? "AGGIORNAMENTO" : "Conferma"} sopralluogo · ${d.whenLabel}`, html: shell(title, body) };
}

export function adminEmail(d: BookingMailData) {
  const warn = d.inCalendar
    ? ""
    : `<p style="background:#A8282A;color:#fff;padding:12px;border-radius:6px;font-weight:bold;margin:0 0 16px">⚠️ NON IN CALENDARIO: l'evento non è stato creato su Google Calendar${
        d.calendarError ? ` (${escapeHtml(d.calendarError)})` : ""
      }. Inseriscilo a mano e richiama il cliente.</p>`;
  const body = `${warn}<table cellpadding="0" cellspacing="0" style="font-size:14px;margin-bottom:20px">
${row("Quando", d.whenLabel)}${row("Cliente", d.name)}${row("Telefono", d.phone)}${row("Email", d.email || "non indicata")}
${row("Indirizzo", `${d.address}, ${d.cap} ${d.city}`)}${row("Immobile", d.propertyType)}${row("Prodotti", d.products)}
${row("Note", d.notes)}${row("Provenienza", d.attribution)}</table>
<h2 style="font-size:16px;margin:0 0 8px">Conversazione in chat</h2>
<pre style="white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;font-size:13px;background:#F6F4F1;padding:12px;border-radius:6px">${escapeHtml(d.transcript)}</pre>`;
  const tag = d.isUpdate ? "AGGIORNAMENTO" : "Nuovo";
  return {
    subject: `${d.inCalendar ? "" : "[NON IN CALENDARIO] "}${tag} sopralluogo: ${d.name} · ${d.whenLabel}`,
    html: shell(`${tag} sopralluogo dal sito`, body),
  };
}
