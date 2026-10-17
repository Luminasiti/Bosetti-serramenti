"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MessageCircle, Phone, RotateCcw, SendHorizontal, X } from "lucide-react";
import { CONFIG, productById } from "@/lib/concierge/config";
import {
  addDays,
  isLateCutoffSlot,
  isWorkingDay,
  italianDate,
  longLabel,
  shortLabel,
  slotRuleError,
  todayYmd,
} from "@/lib/concierge/dateRestrictions";
import { pickReview } from "@/lib/concierge/reviewsData";
import { fullAddress } from "@/lib/concierge/validation";
import { getAttribution, getCookie } from "@/lib/concierge/attribution";
import { track, trackLead } from "@/lib/concierge/track";
import {
  isRescheduleRequest,
  parseDateTime,
  parseNeeds,
  parseNumbers,
  parseOrdinal,
  parseProducts,
  parseProperty,
  parseTimeOfDay,
} from "@/lib/concierge/parse";
import type {
  ActionId,
  ChatButton,
  ChatMessage,
  ChatState,
  ContactDraft,
  FlowPhase,
  SuggestedSlot,
  TimeOfDay,
} from "@/lib/concierge/chatTypes";
import {
  ConfirmedCard,
  ContactForm,
  CustomDatePicker,
  NeedsStep,
  ProductGrid,
  QuantityStep,
  ReviewCard,
  SlotsStep,
  quantityKeys,
} from "./widgets";

const STORAGE_KEY = `${CONFIG.brandKey}_chat_state_v1`;
const TYPING_MS = 350;
const C = CONFIG.consultantName;

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const emptyContact = (): ContactDraft => ({
  name: "",
  phone: "",
  email: "",
  street: "",
  scala: "",
  piano: "",
  citofono: "",
  cap: "",
  city: CONFIG.defaultCity,
  notes: "",
  privacy: false,
});

const initialState = (): ChatState => ({
  messages: [],
  flowPhase: "greeting",
  selectedProducts: [],
  quantities: {},
  needs: [],
  propertyType: "",
  timeOfDay: "any",
  finalDate: "",
  finalTime: "",
  contact: emptyContact(),
  calendarEventId: "",
  isReschedule: false,
  leadTracked: false,
  chatStarted: false,
  shownReviews: [],
  entryProduct: "",
});

/* ---------- Helpers ---------- */

function productSummary(s: Pick<ChatState, "selectedProducts" | "quantities">) {
  return s.selectedProducts
    .flatMap((id) => {
      const p = productById(id);
      if (!p) return [];
      if (p.splitQuantity) {
        return p.splitQuantity.filter((sq) => (s.quantities[`${id}:${sq.label}`] ?? 0) > 0).map((sq) => `${s.quantities[`${id}:${sq.label}`]} ${sq.label}`);
      }
      const n = s.quantities[id];
      return [n ? `${p.label} (${n} pz)` : p.label];
    })
    .join(", ");
}

function totalPieces(s: Pick<ChatState, "selectedProducts" | "quantities">) {
  return quantityKeys(s.selectedProducts).reduce((sum, k) => sum + (s.quantities[k.key] ?? 0), 0);
}

const timeOfDayLabel: Record<TimeOfDay, string> = { morning: "Mattina", afternoon: "Pomeriggio", any: "Qualsiasi orario" };

function slotsFor(t: TimeOfDay) {
  const all = [...CONFIG.slotTimes];
  if (t === "morning") return all.slice(0, 2);
  if (t === "afternoon") return all.slice(2);
  return all;
}

function whatsappUrl(text: string) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Renders **bold** without showing the asterisks. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

/* ---------- Component ---------- */

export function ConciergeChat({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: { product?: string; nonce: number };
  onClose: () => void;
}) {
  const [state, setState] = useState<ChatState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const listRef = useRef<HTMLDivElement>(null);
  const handledNonce = useRef(-1);

  /* Persistence */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatState;
        if (Array.isArray(parsed.messages)) {
          const restored = { ...initialState(), ...parsed, contact: { ...emptyContact(), ...parsed.contact } };
          stateRef.current = restored;
          setState(restored);
        }
      }
    } catch {
      /* corrupted or blocked storage: start fresh */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, loaded]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [state.messages.length, typing]);

  /** Applies the change to the ref right away, so the next step function reads the up-to-date state. */
  const patch = useCallback((p: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) => {
    const cur = stateRef.current;
    const next = { ...cur, ...(typeof p === "function" ? p(cur) : p) };
    stateRef.current = next;
    setState(next);
  }, []);

  const userSay = useCallback(
    (text: string) => {
      if (!stateRef.current.chatStarted) track("chat_start");
      patch((s) => ({ chatStarted: true, messages: [...s.messages, { id: uid(), role: "user", text }] }));
    },
    [patch],
  );

  /** Bot replies after a short typing pause; extra state changes land together with the messages. */
  const botSay = useCallback(
    (msgs: Omit<ChatMessage, "id" | "role">[], extra: Partial<ChatState> = {}) =>
      new Promise<void>((resolve) => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          patch((s) => ({ ...extra, messages: [...s.messages, ...msgs.map((m) => ({ ...m, id: uid(), role: "bot" as const }))] }));
          resolve();
        }, TYPING_MS);
      }),
    [patch],
  );

  /* ---------- Steps ---------- */

  const greetingButtons = (except?: ActionId): ChatButton[] =>
    (
      [
        { label: "Richiedi Preventivo & Fissa Data", actionId: "greet_book", variant: "primary" },
        { label: "Posa certificata", actionId: "explain_posa" },
        { label: "Come funzionano le detrazioni?", actionId: "explain_detrazioni" },
        { label: "Aggiungi altri prodotti", actionId: "show_products" },
      ] satisfies ChatButton[]
    ).filter((b) => b.actionId !== except);

  const greet = (product?: string) => {
    const p = productById(product);
    if (p) {
      return botSay(
        [
          {
            text: `Ciao! 👋 Sono ${C} di ${CONFIG.companyName}. Vedo che ti interessa **${p.label.toLowerCase()}**. Il sopralluogo è gratuito: vengo io a prendere le misure e ti consiglio sul posto.`,
            buttons: greetingButtons(),
          },
        ],
        { flowPhase: "greeting", selectedProducts: [p.id], entryProduct: p.id },
      );
    }
    return botSay(
      [
        {
          text: `Ciao! 👋 Sono ${C} di ${CONFIG.companyName}. Ti aiuto a fissare il **sopralluogo gratuito**: vengo io a casa tua a prendere le misure. Cosa vuoi cambiare?`,
          isMultiSelectProducts: true,
        },
      ],
      { flowPhase: "products", entryProduct: "" },
    );
  };

  const askProducts = () =>
    botSay([{ text: "Scegli tutto quello che ti interessa, anche più di un prodotto:", isMultiSelectProducts: true }], { flowPhase: "products" });

  const askQuantities = () =>
    botSay(
      [{ text: "Quanti pezzi sono, più o meno? Basta un'idea: **le misure esatte le prendo io al sopralluogo**.", isQuantityStep: true }],
      { flowPhase: "quantities" },
    );

  const askNeeds = () => {
    const s = stateRef.current;
    const review = pickReview(s.selectedProducts, s.shownReviews);
    const msgs: Omit<ChatMessage, "id" | "role">[] = [];
    if (review) msgs.push({ text: review.spontaneousIntro, review });
    msgs.push({ text: "Cosa conta di più per te? Puoi sceglierne più di una.", isMultiSelectNeeds: true });
    return botSay(msgs, { flowPhase: "needs", shownReviews: review ? [...s.shownReviews, review.author] : s.shownReviews });
  };

  const afterQuantities = () => {
    const s = stateRef.current;
    const allSmall = s.selectedProducts.length > 0 && s.selectedProducts.every((id) => productById(id)?.smallOrderEligible);
    if (allSmall && totalPieces(s) <= CONFIG.smallOrderRule.maxTotalPieces) {
      return botSay(
        [
          {
            text: `Per **${productSummary(s)}** non serve il sopralluogo: ti facciamo il preventivo al telefono o su WhatsApp, in pochi minuti.`,
            buttons: [
              { label: `Chiama ${CONFIG.phoneDisplay}`, actionId: "call", variant: "primary" },
              { label: "Scrivici su WhatsApp", actionId: "whatsapp" },
              { label: "Desidero comunque un sopralluogo a casa", actionId: "small_survey" },
            ],
          },
        ],
        { flowPhase: "smallOrder" },
      );
    }
    return askNeeds();
  };

  const askProperty = () =>
    botSay(
      [
        {
          text: "Che tipo di immobile è?",
          buttons: CONFIG.propertyTypes.map((p) => ({ label: p, actionId: "property" as const, payload: p })),
        },
      ],
      { flowPhase: "property" },
    );

  const askTimeOfDay = (withReview = true) => {
    const s = stateRef.current;
    const review = withReview ? pickReview(s.selectedProducts, s.shownReviews) : undefined;
    const fresh = review && !s.shownReviews.includes(review.author) ? review : undefined;
    const msgs: Omit<ChatMessage, "id" | "role">[] = [];
    if (fresh) msgs.push({ text: fresh.spontaneousIntro, review: fresh });
    msgs.push({
      text: "Quando preferisci che passi? 🗓️",
      buttons: [
        { label: `Mattina (${CONFIG.slotTimes[0]}–${CONFIG.slotTimes[1]})`, actionId: "time_of_day", payload: "morning" },
        { label: `Pomeriggio (${CONFIG.slotTimes[2]}–${CONFIG.slotTimes[3]})`, actionId: "time_of_day", payload: "afternoon" },
        { label: "Qualsiasi orario", actionId: "time_of_day", payload: "any" },
      ],
    });
    return botSay(msgs, { flowPhase: "timeOfDay", shownReviews: fresh ? [...s.shownReviews, fresh.author] : s.shownReviews });
  };

  const fetchDay = async (date: string): Promise<Record<string, boolean> | null> => {
    try {
      const res = await fetch(`/api/calendar/availability?date=${date}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { slots: { time: string; available: boolean }[] };
      return Object.fromEntries(data.slots.map((s) => [s.time, s.available]));
    } catch {
      return null;
    }
  };

  const findSlots = async (t: TimeOfDay) => {
    await botSay([{ text: "Verifico la mia agenda…" }], { flowPhase: "slots" });
    const wanted = slotsFor(t);
    const found: SuggestedSlot[] = [];
    let date = todayYmd();
    for (let i = 0; i < CONFIG.maxScanDays && found.length < CONFIG.suggestionsCount; i++) {
      date = addDays(date, 1);
      if (!isWorkingDay(date)) continue;
      const day = await fetchDay(date);
      if (day) {
        const time = wanted.find((w) => day[w]);
        if (time) found.push({ date, time });
      } else {
        // Availability unreachable: assume the first allowed slot of the day is free.
        const time = wanted.find((w) => !isLateCutoffSlot(date, w));
        if (time) found.push({ date, time, assumed: true });
      }
    }
    if (!found.length) {
      return botSay(
        [
          {
            text: "Nei prossimi giorni non trovo orari liberi in quella fascia. Proviamo in un altro momento della giornata o scegli tu una data.",
            buttons: [
              { label: "Cambia fascia oraria", actionId: "other_time" },
              { label: "Scegli una data", actionId: "custom_picker" },
            ],
          },
        ],
        { flowPhase: "slots" },
      );
    }
    return botSay(
      [{ text: "Ecco i primi orari liberi. Quale ti va bene?", isSuggestedSlotsStep: true, suggestions: found }],
      { flowPhase: "slots" },
    );
  };

  const openCustomPicker = (defaults?: { date?: string; time?: string }) =>
    botSay([{ text: "Scegli tu giorno e orario, ti dico subito se sono libero:", isCustomDatePickerStep: true, customDefaults: defaults }], {
      flowPhase: "customDate",
    });

  const askContact = (date: string, time: string) => {
    setServerError(null);
    return botSay(
      [
        {
          text: `Ho bloccato lo slot del **${italianDate(date)} alle ore ${time}** per te. Lasciami i dati per il sopralluogo, ti mando subito la conferma.`,
          isContactStep: true,
        },
      ],
      { flowPhase: "contact", finalDate: date, finalTime: time },
    );
  };

  const resumePhase = (phase: FlowPhase) => {
    const s = stateRef.current;
    switch (phase) {
      case "greeting":
      case "products":
        return askProducts();
      case "quantities":
        return askQuantities();
      case "smallOrder":
        return afterQuantities();
      case "needs":
        return askNeeds();
      case "property":
        return askProperty();
      case "timeOfDay":
        return askTimeOfDay(false);
      case "slots":
        return findSlots(s.timeOfDay);
      case "customDate":
        return openCustomPicker();
      case "contact":
        return askContact(s.finalDate, s.finalTime);
      case "confirmed":
        return botSay([{ text: `Il tuo sopralluogo è fissato per **${longLabel(s.finalDate)} alle ${s.finalTime}**.`, buttons: confirmedButtons() }]);
    }
  };

  const confirmedButtons = (): ChatButton[] => [
    { label: "Chiama", actionId: "call" },
    { label: "WhatsApp", actionId: "whatsapp" },
    { label: "Modifica data o orario", actionId: "reschedule" },
  ];

  /* ---------- Widget submissions ---------- */

  const onProductsConfirmed = (ids: string[]) => {
    const labels = ids.map((id) => productById(id)?.label).filter(Boolean);
    userSay(`Prodotti scelti: ${labels.join(", ")}`);
    patch({ selectedProducts: ids });
    return askQuantities();
  };

  const onQuantities = (q: Record<string, number>) => {
    patch({ quantities: q });
    userSay(`Quantità: ${productSummary({ ...stateRef.current, quantities: q }) || "da vedere al sopralluogo"}`);
    return afterQuantities();
  };

  const onNeeds = (needs: string[]) => {
    userSay(needs.length ? `Priorità: ${needs.map((n) => n.split(": ")[1] ?? n).join(", ")}` : "Consulenza generale");
    patch({ needs: needs.length ? needs : ["Consulenza generale"] });
    return askProperty();
  };

  const onSlotPick = (slot: SuggestedSlot) => {
    userSay(`Scelgo ${shortLabel(slot.date)} alle ${slot.time}`);
    return askContact(slot.date, slot.time);
  };

  const onCustomConfirm = (date: string, time: string) => {
    userSay(`Scelgo ${longLabel(date)} alle ${time}`);
    return askContact(date, time);
  };

  const onContactSubmit = async (contact: ContactDraft) => {
    const s = stateRef.current;
    setSubmitting(true);
    setServerError(null);
    const eventId = uid();
    const summary = productSummary(s) || "Consulenza generale";
    const transcript = s.messages
      .filter((m) => m.text)
      .map((m) => `${m.role === "user" ? "Cliente" : C}: ${m.text.replace(/\*\*/g, "")}`)
      .join("\n");
    const payload = {
      contact: { ...contact },
      date: s.finalDate,
      time: s.finalTime,
      productSummary: summary,
      productIds: s.selectedProducts,
      propertyType: s.propertyType,
      notes: [
        `Quantità: ${summary}`,
        `Priorità: ${s.needs.join("; ") || "Consulenza generale"}`,
        `Fascia preferita: ${timeOfDayLabel[s.timeOfDay]}`,
      ].join("\n"),
      transcript,
      previousEventId: s.isReschedule ? s.calendarEventId || undefined : undefined,
      isReschedule: s.isReschedule,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      pageUrl: window.location.href,
      eventId,
      attribution: getAttribution(),
    };

    let data: { ok?: boolean; reason?: string; eventId?: string | null; calendarUrl?: string; emailSent?: boolean } = {};
    try {
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.reason || "");
    } catch (err) {
      setSubmitting(false);
      const reason = (err as Error).message;
      setServerError(reason || `Non sono riuscito a confermare online. Chiamaci allo ${CONFIG.phoneDisplay} e lo fissiamo subito.`);
      return;
    }

    setSubmitting(false);
    const wasReschedule = s.isReschedule;
    if (!wasReschedule && !s.leadTracked) {
      trackLead({ product: s.selectedProducts.join(","), content_name: summary, eventID: eventId });
    }
    const first = contact.name.trim().split(/\s+/)[0];
    const address = `${fullAddress(contact)}, ${contact.cap} ${contact.city}`;
    userSay("Ho inviato i miei dati");
    await botSay(
      [
        {
          text: `${wasReschedule ? "Fatto, ho spostato l'appuntamento" : `Perfetto ${first}, il sopralluogo è **confermato**`} ✅ Passo io, ${C}, **${longLabel(s.finalDate)} alle ${s.finalTime}**.${
            data.emailSent ? ` Ti ho mandato la conferma a ${contact.email}.` : ""
          }\n\nOgni serramento che montiamo è certificato per le **detrazioni fiscali**: ne parliamo al sopralluogo. Se vuoi vedere profili e finiture dal vivo, passa in laboratorio in ${CONFIG.showroomAddress}.`,
          isConfirmedStep: true,
          confirmedLines: [
            ["Quando", `${longLabel(s.finalDate)}, ore ${s.finalTime}`],
            ["Dove", address],
            ["Richiesta", summary],
          ],
          calendarUrl: data.calendarUrl,
          buttons: confirmedButtons(),
        },
      ],
      {
        flowPhase: "confirmed",
        contact,
        calendarEventId: data.eventId ?? s.calendarEventId,
        isReschedule: false,
        leadTracked: s.leadTracked || !wasReschedule,
      },
    );
  };

  /* ---------- Buttons ---------- */

  const whatsappText = () => {
    const s = stateRef.current;
    if (s.flowPhase === "confirmed") return `Ciao ${C}, ho prenotato il sopralluogo del ${italianDate(s.finalDate)} alle ${s.finalTime}.`;
    if (s.flowPhase === "smallOrder") return `Ciao, vorrei un preventivo per ${productSummary(s)}.`;
    return "Ciao, vorrei informazioni per un sopralluogo gratuito.";
  };

  const runAction = (b: ChatButton) => {
    const s = stateRef.current;
    switch (b.actionId) {
      case "call":
        track("click_call");
        window.location.href = `tel:${CONFIG.phoneTel}`;
        return;
      case "whatsapp":
        track("click_whatsapp");
        window.open(whatsappUrl(whatsappText()), "_blank", "noopener");
        return;
      case "greet_book":
        userSay(b.label);
        return askQuantities();
      case "explain_posa":
        userSay(b.label);
        return botSay([
          {
            text: `Siamo certificati **CasaClima** con il sistema **Thermo Posa**: è un metodo certificato per sigillare il serramento al muro, così isola come deve. Consegna e montaggio li facciamo noi, con precisione e cercando di disturbare il meno possibile.`,
            buttons: greetingButtons("explain_posa"),
          },
        ]);
      case "explain_detrazioni":
        userSay(b.label);
        return botSay([
          {
            text: `Ogni serramento che montiamo è **certificato a norma per le detrazioni fiscali**. La percentuale e le condizioni dipendono dalla normativa in vigore e dalla tua situazione: al sopralluogo verifichiamo insieme cosa puoi detrarre.`,
            buttons: greetingButtons("explain_detrazioni"),
          },
        ]);
      case "show_products":
        userSay(b.label);
        return askProducts();
      case "small_survey":
        userSay(b.label);
        return askNeeds();
      case "property":
        userSay(b.payload ?? b.label);
        patch({ propertyType: b.payload ?? b.label });
        return askTimeOfDay();
      case "time_of_day": {
        const t = (b.payload as TimeOfDay) ?? "any";
        userSay(timeOfDayLabel[t]);
        patch({ timeOfDay: t });
        return findSlots(t);
      }
      case "slot_pick":
        return;
      case "custom_picker":
        userSay("Scelgo io la data");
        return openCustomPicker();
      case "confirm_time":
        userSay(b.label);
        return askContact(s.finalDate, s.finalTime);
      case "other_time":
        userSay(b.label);
        return askTimeOfDay(false);
      case "reschedule":
        userSay("Vorrei cambiare data o orario");
        patch({ isReschedule: true });
        return askTimeOfDay(false);
      case "resume":
        userSay(b.label);
        return resumePhase(s.flowPhase);
    }
  };

  /* ---------- Free text ---------- */

  const contextButtons = (): ChatButton[] => {
    const s = stateRef.current;
    if (s.flowPhase === "confirmed") return confirmedButtons();
    if (s.flowPhase === "contact")
      return [
        { label: `Conferma orario ${s.finalTime}`, actionId: "confirm_time", variant: "primary" },
        { label: "Scegli un altro orario", actionId: "other_time" },
      ];
    if (!s.selectedProducts.length) return [{ label: "Scegli prodotti dal catalogo", actionId: "show_products", variant: "primary" }];
    return [
      { label: `Fissa il sopralluogo con ${C}`, actionId: "resume", variant: "primary" },
      { label: "Modifica prodotti", actionId: "show_products" },
    ];
  };

  /** Tries to understand the answer for the current step locally. Returns true when handled. */
  const handleLocally = (text: string): boolean => {
    const s = stateRef.current;
    switch (s.flowPhase) {
      case "greeting":
      case "products": {
        const { products, quantities } = parseProducts(text);
        if (!products.length) return false;
        const selected = [...new Set([...(s.flowPhase === "greeting" ? s.selectedProducts : []), ...products])];
        const keys = quantityKeys(selected);
        const covered = selected.every((id) => keys.filter((k) => k.key.startsWith(id)).some((k) => quantities[k.key]));
        patch({ selectedProducts: selected });
        if (covered) {
          const q = Object.fromEntries(keys.map((k) => [k.key, quantities[k.key] ?? 0]));
          patch({ quantities: q });
          void afterQuantities();
        } else void askQuantities();
        return true;
      }
      case "quantities": {
        const keys = quantityKeys(s.selectedProducts);
        const fromProducts = parseProducts(text).quantities;
        const nums = parseNumbers(text);
        let q: Record<string, number> | null = null;
        if (Object.keys(fromProducts).length) q = Object.fromEntries(keys.map((k) => [k.key, fromProducts[k.key] ?? 0]));
        else if (nums.length === keys.length) q = Object.fromEntries(keys.map((k, i) => [k.key, nums[i]]));
        else if (nums.length === 1 && keys.length === 1) q = { [keys[0].key]: nums[0] };
        if (!q) return false;
        patch({ quantities: q });
        void afterQuantities();
        return true;
      }
      case "needs": {
        const available = s.selectedProducts.flatMap((id) => {
          const p = productById(id);
          return p ? p.priorities.map((n) => `${p.label}: ${n}`) : [];
        });
        const needs = parseNeeds(text, available);
        if (!needs.length) return false;
        patch({ needs });
        void askProperty();
        return true;
      }
      case "property": {
        const p = parseProperty(text);
        if (!p) return false;
        patch({ propertyType: p });
        void askTimeOfDay();
        return true;
      }
      case "timeOfDay": {
        const t = parseTimeOfDay(text);
        if (t) {
          patch({ timeOfDay: t });
          void findSlots(t);
          return true;
        }
        const dt = parseDateTime(text);
        if (!dt) return false;
        void openCustomPicker(prefill(dt));
        return true;
      }
      case "slots":
      case "customDate": {
        const last = [...s.messages].reverse().find((m) => m.isSuggestedSlotsStep);
        const idx = s.flowPhase === "slots" ? parseOrdinal(text) : null;
        if (idx !== null && last?.suggestions?.[idx]) {
          void askContact(last.suggestions[idx].date, last.suggestions[idx].time);
          return true;
        }
        const dt = parseDateTime(text);
        if (!dt) return false;
        void openCustomPicker(prefill(dt));
        return true;
      }
      case "confirmed":
        if (!isRescheduleRequest(text)) return false;
        void botSay([
          {
            text: `Nessun problema, sposto io l'appuntamento di ${longLabel(s.finalDate)} alle ${s.finalTime}.`,
            buttons: [{ label: "Modifica data o orario", actionId: "reschedule", variant: "primary" }],
          },
        ]);
        return true;
      default:
        return false;
    }
  };

  /** Prefills the custom picker, moving a late-cutoff or weekend request to something bookable. */
  const prefill = (dt: { date?: string; time?: string }) => {
    let date = dt.date;
    if (date && !isWorkingDay(date)) date = undefined;
    let time = dt.time;
    if (date && time && isLateCutoffSlot(date, time)) time = CONFIG.slotTimes[1];
    if (date && time && slotRuleError(date, time)) time = undefined;
    return { date, time };
  };

  const askLlm = async (text: string) => {
    const s = stateRef.current;
    setTyping(true);
    const history = [...s.messages, { role: "user" as const, text }]
      .filter((m) => m.text)
      .slice(-15)
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text.replace(/\*\*/g, "").slice(0, 1000) }));
    let reply = `Su questo ti rispondo meglio a voce: chiamaci allo ${CONFIG.phoneDisplay}.`;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          bookingContext: {
            flowPhase: s.flowPhase,
            products: s.selectedProducts.map((id) => productById(id)?.label),
            finalDate: s.finalDate ? longLabel(s.finalDate) : undefined,
            finalTime: s.finalTime || undefined,
            contactName: s.flowPhase === "confirmed" ? s.contact.name : undefined,
          },
        }),
      });
      const data = await res.json();
      if (data.reply) reply = data.reply;
    } catch {
      /* keep the fallback reply */
    }
    setTyping(false);
    patch((st) => ({
      messages: [...st.messages, { id: uid(), role: "bot", text: reply, fromLlm: true, buttons: contextButtons() }],
    }));
  };

  const onSend = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    userSay(text.slice(0, 1000));
    if (!handleLocally(text)) void askLlm(text);
  };

  /* ---------- Entry and restart ---------- */

  useEffect(() => {
    if (!open || !loaded || handledNonce.current === entry.nonce) return;
    handledNonce.current = entry.nonce;
    const s = stateRef.current;
    if (!s.messages.length) {
      void greet(entry.product);
      return;
    }
    const p = productById(entry.product);
    if (p && (s.flowPhase === "greeting" || s.flowPhase === "products") && !s.selectedProducts.includes(p.id)) {
      patch({ selectedProducts: [...s.selectedProducts, p.id] });
      void botSay([{ text: `Ho aggiunto **${p.label.toLowerCase()}** alla tua richiesta.` }]).then(askProducts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loaded, entry.nonce]);

  const restart = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const fresh = initialState();
    stateRef.current = fresh;
    setState(fresh);
    setServerError(null);
    setInput("");
    void greet(entry.product);
  };

  /* ---------- Render ---------- */

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const lastIndex = (flag: keyof ChatMessage) => {
    for (let i = state.messages.length - 1; i >= 0; i--) if (state.messages[i][flag]) return i;
    return -1;
  };
  const widgetActive = (i: number, flag: keyof ChatMessage, phase: FlowPhase) =>
    state.flowPhase === phase && lastIndex(flag) === i && !typing;
  const lastMessageId = state.messages[state.messages.length - 1]?.id;

  const renderWidget = (m: ChatMessage, i: number): ReactNode => {
    if (m.isMultiSelectProducts)
      return (
        <ProductGrid
          active={widgetActive(i, "isMultiSelectProducts", "products")}
          initial={state.selectedProducts}
          onConfirm={onProductsConfirmed}
        />
      );
    if (m.isQuantityStep)
      return (
        <QuantityStep
          active={widgetActive(i, "isQuantityStep", "quantities")}
          productIds={state.selectedProducts}
          initial={state.quantities}
          onConfirm={onQuantities}
        />
      );
    if (m.isMultiSelectNeeds)
      return (
        <NeedsStep
          active={widgetActive(i, "isMultiSelectNeeds", "needs")}
          productIds={state.selectedProducts}
          initial={state.needs.filter((n) => n !== "Consulenza generale")}
          onConfirm={onNeeds}
        />
      );
    if (m.isSuggestedSlotsStep && m.suggestions)
      return (
        <SlotsStep
          active={widgetActive(i, "isSuggestedSlotsStep", "slots")}
          suggestions={m.suggestions}
          onPick={onSlotPick}
          onCustom={() => runAction({ label: "", actionId: "custom_picker" })}
        />
      );
    if (m.isCustomDatePickerStep)
      return (
        <CustomDatePicker
          active={widgetActive(i, "isCustomDatePickerStep", "customDate")}
          defaults={m.customDefaults}
          checkDay={fetchDay}
          onConfirm={onCustomConfirm}
        />
      );
    if (m.isContactStep)
      return (
        <ContactForm
          active={widgetActive(i, "isContactStep", "contact")}
          initial={state.contact}
          submitting={submitting}
          serverError={lastIndex("isContactStep") === i ? serverError : null}
          onChange={(c) => patch({ contact: c })}
          onSubmit={onContactSubmit}
        />
      );
    if (m.isConfirmedStep && m.confirmedLines) return <ConfirmedCard lines={m.confirmedLines} calendarUrl={m.calendarUrl} />;
    return null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chat con ${C} di ${CONFIG.companyName}`}
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/50 backdrop-blur-sm md:items-center md:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-paper md:h-[720px] md:max-h-[calc(100dvh-3rem)] md:max-w-[440px] md:rounded-md md:shadow-card">
        <header className="flex items-center gap-3 border-b border-alu-soft bg-white px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-key font-display text-lg font-bold text-white [font-stretch:112%]">
            {C[0]}
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-[#22a35a]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold leading-tight">
              {C} · {CONFIG.companyName}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-[#22a35a]/10 px-2 py-0.5 text-xs font-semibold text-[#17803f]">
              <span className="size-1.5 rounded-full bg-[#22a35a]" />
              Online
            </span>
          </span>
          <button
            type="button"
            onClick={restart}
            aria-label="Ricomincia la conversazione"
            title="Ricomincia"
            className="flex size-10 items-center justify-center rounded-md text-ink-2 hover:bg-paper cursor-pointer"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi la chat"
            className="flex size-10 items-center justify-center rounded-md hover:bg-paper cursor-pointer"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
          {state.messages.map((m, i) => {
            const widget = m.role === "bot" ? renderWidget(m, i) : null;
            const buttonsActive = m.id === lastMessageId && !typing;
            return (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : "space-y-2"}>
                {m.text && (
                  <p
                    className={`max-w-[88%] whitespace-pre-line rounded-md px-3.5 py-2.5 text-[0.9375rem] leading-relaxed ${
                      m.role === "user" ? "bg-ink text-white" : "bg-white text-ink shadow-[0_1px_2px_rgb(31_31_31/0.06)]"
                    }`}
                  >
                    <RichText text={m.text} />
                  </p>
                )}
                {m.review && <ReviewCard review={m.review} />}
                {widget}
                {m.buttons && m.buttons.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${buttonsActive ? "" : "pointer-events-none opacity-50"}`} inert={!buttonsActive}>
                    {m.buttons.map((b) => (
                      <button
                        key={b.label + (b.payload ?? "")}
                        type="button"
                        onClick={() => runAction(b)}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-md px-4 py-2 text-left text-[0.9375rem] font-semibold transition-colors cursor-pointer ${
                          b.variant === "primary"
                            ? "bg-key text-white hover:bg-key-dark"
                            : "border border-ink/20 bg-white hover:border-ink"
                        }`}
                      >
                        {b.actionId === "call" && <Phone className="size-4" aria-hidden="true" />}
                        {b.actionId === "whatsapp" && <MessageCircle className="size-4" aria-hidden="true" />}
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {typing && (
            <div className="inline-flex gap-1 rounded-md bg-white px-4 py-3" aria-label={`${C} sta scrivendo`}>
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-2 animate-bounce rounded-full bg-alu" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={onSend}
          className="flex items-center gap-2 border-t border-alu-soft bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Scrivi a ${C}…`}
            aria-label="Scrivi un messaggio"
            maxLength={1000}
            enterKeyHint="send"
            className="h-12 min-w-0 flex-1 rounded-md border border-ink/20 bg-paper px-4 text-base focus:border-ink focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Invia"
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-key text-white hover:bg-key-dark disabled:opacity-40 cursor-pointer"
          >
            <SendHorizontal className="size-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

