"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { BadgeCheck, CalendarPlus, Check, Minus, Plus } from "lucide-react";
import { CONFIG, PRODUCTS, productById } from "@/lib/concierge/config";
import { italianDate, nextWorkingDay, shortLabel, slotRuleError } from "@/lib/concierge/dateRestrictions";
import { validateContact, type ContactErrors } from "@/lib/concierge/validation";
import type { ConciergeReview } from "@/lib/concierge/reviewsData";
import type { ContactDraft, SuggestedSlot } from "@/lib/concierge/chatTypes";
import { Stars } from "@/components/ui/Stars";

const card = "rounded-md border border-alu-soft bg-white";
const primaryBtn =
  "inline-flex h-12 w-full items-center justify-center rounded-md bg-key px-5 font-semibold text-white transition-colors hover:bg-key-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

function Inert({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div aria-disabled={!active} className={active ? "" : "pointer-events-none opacity-60 select-none"} inert={!active}>
      {children}
    </div>
  );
}

/* ---------- Products ---------- */

export function ProductGrid({
  active,
  initial,
  onConfirm,
}: {
  active: boolean;
  initial: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <Inert active={active}>
      <div className="grid grid-cols-2 gap-2.5">
        {PRODUCTS.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(p.id)}
              className={`relative overflow-hidden rounded-md border-2 bg-white text-left transition-colors cursor-pointer ${
                on ? "border-key" : "border-transparent hover:border-alu"
              }`}
            >
              <span className="relative block aspect-[4/3] bg-alu-soft">
                <Image src={p.image} alt="" fill sizes="(min-width: 768px) 200px, 45vw" className="object-cover" />
              </span>
              <span
                className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-sm border-2 ${
                  on ? "border-key bg-key text-white" : "border-white bg-white/80"
                }`}
              >
                {on && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
              </span>
              <span className="block px-3 py-2.5">
                <span className="block text-[0.9375rem] font-semibold leading-tight">{p.label}</span>
                <span className="block text-xs text-ink-2 mt-0.5">{p.tag}</span>
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className={`${primaryBtn} mt-3`} disabled={!selected.length} onClick={() => onConfirm(selected)}>
        {selected.length ? `Conferma (${selected.length})` : "Scegli almeno un prodotto"}
      </button>
    </Inert>
  );
}

/* ---------- Quantities ---------- */

export function quantityKeys(productIds: string[]) {
  return productIds.flatMap((id) => {
    const p = productById(id);
    if (!p) return [];
    return p.splitQuantity
      ? p.splitQuantity.map((s) => ({ key: `${id}:${s.label}`, label: s.label, def: s.defaultCount, emoji: p.emoji }))
      : [{ key: id, label: p.label, def: 1, emoji: p.emoji }];
  });
}

export function QuantityStep({
  active,
  productIds,
  initial,
  onConfirm,
}: {
  active: boolean;
  productIds: string[];
  initial: Record<string, number>;
  onConfirm: (q: Record<string, number>) => void;
}) {
  const keys = quantityKeys(productIds);
  const [q, setQ] = useState<Record<string, number>>(() =>
    Object.fromEntries(keys.map((k) => [k.key, initial[k.key] ?? k.def])),
  );
  const set = (key: string, v: number) => setQ((s) => ({ ...s, [key]: Math.max(0, Math.min(99, v)) }));
  const total = Object.values(q).reduce((a, b) => a + b, 0);
  return (
    <Inert active={active}>
      <ul className={`${card} divide-y divide-alu-soft`}>
        {keys.map((k) => (
          <li key={k.key} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[0.9375rem] font-semibold">
              {k.emoji} {k.label}
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Meno ${k.label}`}
                onClick={() => set(k.key, (q[k.key] ?? 0) - 1)}
                className="flex size-10 items-center justify-center rounded-sm border border-ink/20 hover:border-ink cursor-pointer"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={99}
                aria-label={`Quantità ${k.label}`}
                value={q[k.key] ?? 0}
                onChange={(e) => set(k.key, Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="h-10 w-12 rounded-sm border border-ink/20 text-center font-semibold [appearance:textfield]"
              />
              <button
                type="button"
                aria-label={`Più ${k.label}`}
                onClick={() => set(k.key, Math.min(50, (q[k.key] ?? 0) + 1))}
                className="flex size-10 items-center justify-center rounded-sm border border-ink/20 hover:border-ink cursor-pointer"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className={`${primaryBtn} mt-3`} disabled={total === 0} onClick={() => onConfirm(q)}>
        Conferma quantità
      </button>
    </Inert>
  );
}

/* ---------- Needs ---------- */

export function NeedsStep({
  active,
  productIds,
  initial,
  onConfirm,
}: {
  active: boolean;
  productIds: string[];
  initial: string[];
  onConfirm: (needs: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initial);
  const toggle = (v: string) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  return (
    <Inert active={active}>
      <div className="space-y-3">
        {productIds.map((id) => {
          const p = productById(id);
          if (!p) return null;
          return (
            <fieldset key={id} className={`${card} px-4 py-3`}>
              <legend className="sr-only">{p.label}</legend>
              <p className="text-[0.9375rem] font-semibold mb-2">
                {p.emoji} {p.label}
              </p>
              <div className="space-y-1.5">
                {p.priorities.map((need) => {
                  const value = `${p.label}: ${need}`;
                  return (
                    <label key={need} className="flex min-h-9 items-center gap-3 text-[0.9375rem] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.includes(value)}
                        onChange={() => toggle(value)}
                        className="size-5 shrink-0 accent-key"
                      />
                      {need}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
      <button type="button" className={`${primaryBtn} mt-3`} onClick={() => onConfirm(selected)}>
        {selected.length ? "Continua" : "Salta: consulenza generale"}
      </button>
    </Inert>
  );
}

/* ---------- Review ---------- */

export function ReviewCard({ review }: { review: ConciergeReview }) {
  return (
    <figure className={`${card} px-4 py-3.5`}>
      <div className="flex items-center justify-between gap-2">
        <Stars label={`${review.rating} stelle su 5`} />
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2">
          <BadgeCheck className="size-4 text-[#1a73e8]" aria-hidden="true" />
          Google Verificata
        </span>
      </div>
      <blockquote className="mt-2 text-[0.9375rem] leading-relaxed">&ldquo;{review.quote}&rdquo;</blockquote>
      <figcaption className="mt-2 text-sm text-ink-2">
        <span className="font-semibold text-ink">{review.author}</span> · {review.productName}
        {review.date ? ` · ${review.date}` : ""}
      </figcaption>
    </figure>
  );
}

/* ---------- Suggested slots ---------- */

export function SlotsStep({
  active,
  suggestions,
  onPick,
  onCustom,
}: {
  active: boolean;
  suggestions: SuggestedSlot[];
  onPick: (s: SuggestedSlot) => void;
  onCustom: () => void;
}) {
  return (
    <Inert active={active}>
      <div className="grid grid-cols-2 gap-2.5">
        {suggestions.map((s) => (
          <button
            key={`${s.date}-${s.time}`}
            type="button"
            onClick={() => onPick(s)}
            className={`${card} px-3 py-3 text-left hover:border-key cursor-pointer`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink-2">{shortLabel(s.date)}</span>
            <span className="block font-display text-xl font-bold [font-stretch:112%]">Ore {s.time}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={onCustom} className="mt-3 w-full py-2 text-[0.9375rem] font-semibold text-key underline-offset-4 hover:underline cursor-pointer">
        Preferisco un altro orario o data →
      </button>
    </Inert>
  );
}

/* ---------- Custom date picker ---------- */

export function CustomDatePicker({
  active,
  defaults,
  checkDay,
  onConfirm,
}: {
  active: boolean;
  defaults?: { date?: string; time?: string };
  checkDay: (date: string) => Promise<Record<string, boolean> | null>;
  onConfirm: (date: string, time: string) => void;
}) {
  const [date, setDate] = useState(defaults?.date ?? nextWorkingDay());
  const [time, setTime] = useState(defaults?.time ?? "");
  const [availability, setAvailability] = useState<Record<string, boolean> | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setError(null);
    const rule = slotRuleError(date, time || CONFIG.slotTimes[CONFIG.slotTimes.length - 1]);
    if (rule && !rule.startsWith("A quest'ora")) return setError(rule);
    setChecking(true);
    const res = await checkDay(date);
    setChecking(false);
    setAvailability(res);
    if (res && !Object.values(res).some(Boolean)) setError("Quel giorno sono tutto pieno: prova un altro giorno.");
  };

  const confirm = async () => {
    setError(null);
    if (!time) return setError("Scegli un orario.");
    const rule = slotRuleError(date, time);
    if (rule) return setError(rule);
    let res = availability;
    if (!res) {
      setChecking(true);
      res = await checkDay(date);
      setChecking(false);
      setAvailability(res);
    }
    if (res && res[time] === false) return setError(`Alle ${time} di quel giorno sono già impegnato: scegli un altro orario.`);
    onConfirm(date, time);
  };

  return (
    <Inert active={active}>
      <div className={`${card} space-y-3 px-4 py-4`}>
        <label className="block">
          <span className="block text-sm font-semibold mb-1">Giorno</span>
          <input
            type="date"
            value={date}
            min={nextWorkingDay()}
            onChange={(e) => {
              setDate(e.target.value);
              setAvailability(null);
              setError(null);
            }}
            className="h-12 w-full rounded-sm border border-ink/20 bg-white px-3"
          />
        </label>
        <div>
          <span className="block text-sm font-semibold mb-1">Orario</span>
          <div className="grid grid-cols-4 gap-2">
            {CONFIG.slotTimes.map((t) => {
              const busy = availability?.[t] === false;
              const on = time === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setTime(t);
                    setError(null);
                  }}
                  className={`h-11 rounded-sm border text-sm font-semibold cursor-pointer ${
                    on ? "border-key bg-key text-white" : busy ? "border-alu-soft bg-paper text-ink-2 line-through" : "border-ink/20 bg-white hover:border-ink"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={verify} disabled={checking} className="text-sm font-semibold underline underline-offset-4 cursor-pointer disabled:opacity-50">
          {checking ? "Verifico…" : "Verifica disponibilità"}
        </button>
        {availability && !error && (
          <p className="text-sm text-ink-2">
            Liberi: {CONFIG.slotTimes.filter((t) => availability[t]).join(", ") || "nessun orario"}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-sm border-l-4 border-key bg-key/5 px-3 py-2 text-sm font-medium">
            {error}
          </p>
        )}
        <button type="button" className={primaryBtn} onClick={confirm} disabled={checking}>
          Conferma {time ? `${italianDate(date)} alle ${time}` : "data e orario"}
        </button>
      </div>
    </Inert>
  );
}

/* ---------- Contact form ---------- */

const fieldClass =
  "h-12 w-full rounded-sm border bg-white px-3 text-base focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10";

export function ContactForm({
  active,
  initial,
  submitting,
  serverError,
  onChange,
  onSubmit,
}: {
  active: boolean;
  initial: ContactDraft;
  submitting: boolean;
  serverError: string | null;
  onChange: (c: ContactDraft) => void;
  onSubmit: (c: ContactDraft) => void;
}) {
  const [c, setC] = useState<ContactDraft>(initial);
  const [errors, setErrors] = useState<ContactErrors>({});
  const update = (k: keyof ContactDraft, v: string | boolean) => {
    const next = { ...c, [k]: v };
    setC(next);
    onChange(next);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const field = (k: keyof ContactDraft, label: string, opts: { type?: string; auto?: string; half?: boolean; mode?: "tel" | "email" | "numeric" } = {}) => (
    <label className={`block ${opts.half ? "" : "col-span-2"}`}>
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <input
        type={opts.type ?? "text"}
        inputMode={opts.mode}
        autoComplete={opts.auto}
        value={c[k] as string}
        aria-invalid={Boolean(errors[k])}
        onChange={(e) => update(k, e.target.value)}
        className={`${fieldClass} ${errors[k] ? "border-key" : "border-ink/20"}`}
      />
      {errors[k] && <span className="block text-sm text-key mt-1">{errors[k]}</span>}
    </label>
  );

  return (
    <Inert active={active}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const errs = validateContact(c);
          setErrors(errs);
          if (Object.keys(errs).length === 0) onSubmit(c);
        }}
        className={`${card} grid grid-cols-2 gap-3 px-4 py-4`}
      >
        {field("name", "Nome e Cognome *", { auto: "name" })}
        {field("phone", "Telefono *", { type: "tel", auto: "tel", mode: "tel" })}
        {field("email", "Email (per la conferma)", { type: "email", auto: "email", mode: "email" })}
        {field("street", "Via e civico *", { auto: "address-line1" })}
        {field("scala", "Scala", { half: true })}
        {field("piano", "Piano", { half: true })}
        {field("citofono", "Citofono")}
        {field("cap", "CAP *", { auto: "postal-code", half: true, mode: "numeric" })}
        {field("city", "Città *", { auto: "address-level2", half: true })}
        <label className="col-span-2 block">
          <span className="block text-sm font-semibold mb-1">Note</span>
          <textarea
            rows={2}
            value={c.notes}
            onChange={(e) => update("notes", e.target.value)}
            className={`${fieldClass} h-auto border-ink/20 py-2`}
          />
        </label>
        <label className="col-span-2 flex items-start gap-3 text-sm text-ink-2 cursor-pointer">
          <input
            type="checkbox"
            checked={c.privacy}
            onChange={(e) => update("privacy", e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-key"
          />
          <span>
            Ho letto l&apos;
            <a href={CONFIG.privacyUrl} target="_blank" className="font-semibold text-ink underline underline-offset-4">
              informativa privacy
            </a>{" "}
            e acconsento all&apos;uso dei miei dati per organizzare il sopralluogo. *
          </span>
        </label>
        {errors.privacy && <span className="col-span-2 -mt-2 text-sm text-key">{errors.privacy}</span>}
        {serverError && (
          <p role="alert" className="col-span-2 rounded-sm border-l-4 border-key bg-key/5 px-3 py-2 text-sm font-medium">
            {serverError}
          </p>
        )}
        <button type="submit" className={`${primaryBtn} col-span-2`} disabled={submitting}>
          {submitting ? "Sto confermando…" : "Conferma il sopralluogo gratuito"}
        </button>
      </form>
    </Inert>
  );
}

/* ---------- Confirmed ---------- */

export function ConfirmedCard({ lines, calendarUrl }: { lines: [string, string][]; calendarUrl?: string }) {
  return (
    <div className={`${card} px-4 py-4`}>
      <dl className="space-y-1.5 text-[0.9375rem]">
        {lines.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-24 shrink-0 text-ink-2">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          Aggiungi al calendario
        </a>
      )}
    </div>
  );
}
