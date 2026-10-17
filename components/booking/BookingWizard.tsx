"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, CalendarPlus, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { companyData } from "@/data/company";

interface BookingWizardProps {
  preselectedNeed?: string;
  variant?: "inline" | "modal";
}

interface Photo {
  id: string;
  name: string;
  url: string;
}

interface Day {
  key: string; // YYYY-MM-DD in local time
  weekday: string;
  day: string;
  month: string;
  long: string;
  isSaturday: boolean;
  technician: "Marco" | "Leonardo";
}

const options = [
  { id: "finestre", label: "Finestre e portefinestre" },
  { id: "alzante", label: "Alzante scorrevole" },
  { id: "porta", label: "Porta d'ingresso" },
  { id: "persiane", label: "Scuri e persiane" },
  { id: "zanzariere", label: "Zanzariere e tapparelle" },
  { id: "vetrina", label: "Vetrina" },
];

const stepTitles = ["Cosa cambiare", "Quanti pezzi", "Quando passiamo", "Dove e chi sei"];

const weekdaySlots = ["8:30", "10:00", "11:00", "14:30", "16:00", "17:00"];
const saturdaySlots = ["8:30", "10:00", "11:00"];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Next 10 working days (Mon–Sat, opening hours from the brief). Placeholder until the real
 * Google Calendar free/busy of Marco and Leonardo is connected.
 */
function upcomingDays(): Day[] {
  const days: Day[] = [];
  const d = new Date();
  while (days.length < 10) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) continue;
    days.push({
      key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      weekday: d.toLocaleDateString("it-IT", { weekday: "short" }).replace(".", ""),
      day: String(d.getDate()),
      month: d.toLocaleDateString("it-IT", { month: "short" }).replace(".", ""),
      long: d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
      isSaturday: d.getDay() === 6,
      technician: days.length % 2 === 0 ? "Marco" : "Leonardo",
    });
  }
  return days;
}

function icsHref(day: Day, time: string, address: string) {
  const [h, m] = time.split(":").map(Number);
  const date = day.key.replaceAll("-", "");
  const start = `${date}T${pad(h)}${pad(m)}00`;
  const end = `${date}T${pad(h + 1)}${pad(m)}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bosetti Serramenti//Sopralluogo//IT",
    "BEGIN:VEVENT",
    `UID:${start}-${Math.random().toString(36).slice(2)}@bosettiserramenti.com`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SUMMARY:Sopralluogo gratuito Bosetti Serramenti",
    `LOCATION:${address}`,
    `DESCRIPTION:Passa ${day.technician}. Per spostarlo chiama lo ${companyData.phones[0].number}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

const inputClass =
  "w-full h-12 rounded-sm border border-ink/20 bg-white px-4 text-base text-ink placeholder:text-ink-2/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[0.9375rem] font-semibold mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export function BookingWizard({ preselectedNeed, variant = "inline" }: BookingWizardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [needs, setNeeds] = useState<string[]>(preselectedNeed ? [preselectedNeed] : []);
  const [pieces, setPieces] = useState(3);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [note, setNote] = useState("");

  // Dates depend on "today", so they are computed on the client only.
  const [days, setDays] = useState<Day[]>([]);
  const [dayKey, setDayKey] = useState("");
  const [time, setTime] = useState("");

  const [client, setClient] = useState({
    comune: "",
    indirizzo: "",
    nome: "",
    telefono: "",
    email: "",
    privacy: false,
  });

  useEffect(() => {
    const next = upcomingDays();
    setDays(next);
    setDayKey(next[0].key);
  }, []);

  const day = days.find((d) => d.key === dayKey);
  const slots = day?.isSaturday ? saturdaySlots : weekdaySlots;
  const needLabels = options.filter((o) => needs.includes(o.id)).map((o) => o.label);

  const scrollToTop = () => {
    const el = rootRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goTo = (target: number) => {
    setError(null);
    setStep(target);
    scrollToTop();
  };

  const next = () => {
    if (step === 1 && needs.length === 0) return setError("Scegli almeno una cosa da cambiare.");
    if (step === 3 && !time) return setError("Scegli un orario.");
    goTo(step + 1);
  };

  const toggleNeed = (id: string) => {
    setError(null);
    setNeeds((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...added].slice(0, 6));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { comune, indirizzo, nome, telefono, email, privacy } = client;
    if (![comune, indirizzo, nome, telefono, email].every((v) => v.trim())) {
      return setError("Compila tutti i campi: ci servono per passare da te e mandarti la conferma.");
    }
    if (!privacy) return setError("Per inviare la richiesta serve il consenso al trattamento dei dati.");
    setError(null);
    setSending(true);
    // Prototype: the real version writes the slot to Google Calendar and emails Simona and the client.
    setTimeout(() => {
      setSending(false);
      setDone(true);
      scrollToTop();
    }, 700);
  };

  const shell =
    variant === "modal"
      ? "bg-paper sm:rounded-md min-h-[100dvh] sm:min-h-0"
      : "bg-white rounded-md shadow-card max-w-3xl mx-auto";

  if (done && day) {
    const address = `${client.indirizzo}, ${client.comune}`;
    return (
      <div ref={rootRef} className={`${shell} p-6 sm:p-10`} role="status">
        <span className="size-12 rounded-full bg-key text-white flex items-center justify-center">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h3 className="text-h2 mt-6 pr-12">Fatto, {client.nome.split(" ")[0]}!</h3>
        <p className="text-lead mt-3">
          {day.technician} passa da te <strong>{day.long}</strong> alle <strong>{time}</strong>, in {address}.
        </p>

        <ol className="mt-8 space-y-4 border-t border-alu-soft pt-6">
          {[
            `Ti richiamiamo per conferma. Il sopralluogo è già nel calendario di ${day.technician}, con indirizzo e foto.`,
            `Simona riceve in ufficio il riepilogo (${needLabels.join(", ").toLowerCase()}, circa ${pieces} ${pieces === 1 ? "pezzo" : "pezzi"}) e prepara il preventivo.`,
            `Ti mandiamo una mail di conferma a ${client.email} e un promemoria il giorno prima.`,
          ].map((text, i) => (
            <li key={i} className="flex gap-4 text-[0.9375rem]">
              <span className="font-display font-bold text-alu [font-stretch:112%]">0{i + 1}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            href={icsHref(day, time, address)}
            download="sopralluogo-bosetti.ics"
            variant="secondary"
            icon={<CalendarPlus className="size-5" aria-hidden="true" />}
          >
            Aggiungi al calendario
          </Button>
        </div>
        <p className="mt-6 text-sm text-ink-2">
          Devi spostarlo? Chiama lo{" "}
          <a href={companyData.phones[0].href} className="font-semibold text-ink underline underline-offset-4">
            {companyData.phones[0].number}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`${shell} scroll-mt-24`}>
      <div className="px-6 pt-6 sm:px-10 sm:pt-8 pr-16">
        <p className="text-sm font-semibold text-ink-2">
          Passo {step} di 4 · {stepTitles[step - 1]}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {stepTitles.map((t, i) => (
            <span key={t} className={`h-1 rounded-full ${i < step ? "bg-key" : "bg-alu-soft"}`} />
          ))}
        </div>
      </div>

      <form onSubmit={submit} noValidate className="px-6 pb-6 pt-8 sm:px-10 sm:pb-10">
        {step === 1 && (
          <fieldset>
            <legend className="text-h3 font-display font-bold [font-stretch:112%]">Cosa vuoi cambiare?</legend>
            <p className="text-[0.9375rem] text-ink-2 mt-1">Puoi sceglierne più di uno.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {options.map((o) => {
                const on = needs.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggleNeed(o.id)}
                    className={`flex min-h-14 items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left font-semibold transition-colors cursor-pointer ${
                      on ? "border-ink bg-ink text-white" : "border-ink/20 bg-white hover:border-ink"
                    }`}
                  >
                    {o.label}
                    <span
                      className={`size-6 shrink-0 rounded-sm border flex items-center justify-center ${
                        on ? "border-white bg-white text-ink" : "border-ink/30"
                      }`}
                    >
                      {on && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-h3 font-display font-bold [font-stretch:112%]">Quanti pezzi, più o meno?</legend>
              <p className="text-[0.9375rem] text-ink-2 mt-1">Basta un'idea: le misure le prendiamo noi.</p>
              <div className="mt-5 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setPieces((p) => Math.max(1, p - 1))}
                  className="size-12 rounded-sm border border-ink/20 flex items-center justify-center hover:border-ink cursor-pointer"
                  aria-label="Un pezzo in meno"
                >
                  <Minus className="size-5" aria-hidden="true" />
                </button>
                <output aria-live="polite" className="min-w-16 text-center font-display font-bold text-4xl [font-stretch:112%]">
                  {pieces}
                  {pieces >= 20 ? "+" : ""}
                </output>
                <button
                  type="button"
                  onClick={() => setPieces((p) => Math.min(20, p + 1))}
                  className="size-12 rounded-sm border border-ink/20 flex items-center justify-center hover:border-ink cursor-pointer"
                  aria-label="Un pezzo in più"
                >
                  <Plus className="size-5" aria-hidden="true" />
                </button>
              </div>
            </fieldset>

            <div>
              <p className="font-semibold">Foto (facoltative)</p>
              <p className="text-[0.9375rem] text-ink-2 mt-1">Scatta le finestre di oggi: ci aiuta a prepararci.</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => addPhotos(e.target.files)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative size-20 overflow-hidden rounded-sm bg-alu-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                    <img src={p.url} alt={p.name} className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                      className="absolute top-1 right-1 size-6 rounded-sm bg-ink/80 text-white flex items-center justify-center cursor-pointer"
                      aria-label={`Rimuovi ${p.name}`}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="size-20 rounded-sm border border-dashed border-ink/30 flex flex-col items-center justify-center gap-1 text-xs font-semibold text-ink-2 hover:border-ink hover:text-ink cursor-pointer"
                  >
                    <Camera className="size-5" aria-hidden="true" />
                    Aggiungi
                  </button>
                )}
              </div>
            </div>

            <Field label="Vuoi aggiungere qualcosa? (facoltativo)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Es. vorrei cambiare i vecchi scuri in legno"
                className={`${inputClass} h-auto py-3`}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="text-h3 font-display font-bold [font-stretch:112%]">Quando passiamo?</legend>
              <p className="text-[0.9375rem] text-ink-2 mt-1">
                Scegli giorno e ora: viene {day?.technician ?? "Marco o Leonardo"}.
              </p>
              <div className="mt-5 -mx-6 px-6 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-5 sm:overflow-visible">
                {days.length === 0
                  ? Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="h-[4.75rem] w-16 shrink-0 sm:w-auto rounded-sm bg-alu-soft animate-pulse" />
                    ))
                  : days.map((d) => {
                      const on = d.key === dayKey;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setDayKey(d.key);
                            if (d.isSaturday && !saturdaySlots.includes(time)) setTime("");
                          }}
                          className={`w-16 shrink-0 sm:w-auto rounded-sm border py-2.5 text-center transition-colors cursor-pointer ${
                            on ? "border-ink bg-ink text-white" : "border-ink/20 bg-white hover:border-ink"
                          }`}
                        >
                          <span className="block text-xs font-semibold uppercase tracking-wide opacity-75">{d.weekday}</span>
                          <span className="block font-display font-bold text-xl [font-stretch:112%]">{d.day}</span>
                          <span className="block text-xs opacity-75">{d.month}</span>
                        </button>
                      );
                    })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-semibold">Orario</legend>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {slots.map((s) => {
                  const on = s === time;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setTime(s);
                        setError(null);
                      }}
                      className={`h-12 rounded-sm border font-semibold transition-colors cursor-pointer ${
                        on ? "border-key bg-key text-white" : "border-ink/20 bg-white hover:border-ink"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-h3">Dove e chi sei</h3>
              {day && (
                <p className="text-[0.9375rem] text-ink-2 mt-1">
                  Sopralluogo {day.long} alle {time}, con {day.technician}.
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Comune">
                <input
                  className={inputClass}
                  autoComplete="address-level2"
                  placeholder="Es. Montichiari"
                  value={client.comune}
                  onChange={(e) => setClient({ ...client, comune: e.target.value })}
                />
              </Field>
              <Field label="Via e numero">
                <input
                  className={inputClass}
                  autoComplete="street-address"
                  value={client.indirizzo}
                  onChange={(e) => setClient({ ...client, indirizzo: e.target.value })}
                />
              </Field>
              <Field label="Nome e cognome">
                <input
                  className={inputClass}
                  autoComplete="name"
                  value={client.nome}
                  onChange={(e) => setClient({ ...client, nome: e.target.value })}
                />
              </Field>
              <Field label="Telefono">
                <input
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={client.telefono}
                  onChange={(e) => setClient({ ...client, telefono: e.target.value })}
                />
              </Field>
              <Field label="Email" className="sm:col-span-2">
                <input
                  className={inputClass}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                />
              </Field>
            </div>
            <label className="flex items-start gap-3 text-[0.9375rem] text-ink-2 cursor-pointer">
              <input
                type="checkbox"
                checked={client.privacy}
                onChange={(e) => setClient({ ...client, privacy: e.target.checked })}
                className="mt-1 size-5 shrink-0 accent-key"
              />
              <span>
                Ho letto l&apos;
                <a href="#" className="underline underline-offset-4 text-ink">
                  informativa privacy
                </a>{" "}
                e acconsento all&apos;uso dei miei dati per organizzare il sopralluogo e il preventivo.
              </span>
            </label>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-sm border-l-4 border-key bg-key/5 px-4 py-3 text-[0.9375rem] font-medium">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button variant="secondary" onClick={() => goTo(step - 1)} icon={<ArrowLeft className="size-4" aria-hidden="true" />}>
              Indietro
            </Button>
          ) : (
            <span className="text-sm text-ink-2 hidden sm:block">Gratis e senza impegno</span>
          )}

          {step < 4 ? (
            <Button onClick={next} size="lg" className="ml-auto">
              <span className="inline-flex items-center gap-2.5">
                Continua <ArrowRight className="size-5" aria-hidden="true" />
              </span>
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={sending} className="ml-auto">
              {sending ? "Invio in corso…" : "Prenota il sopralluogo"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
