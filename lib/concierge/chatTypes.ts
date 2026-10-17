import type { ConciergeReview } from "./reviewsData";

export type FlowPhase =
  | "greeting"
  | "products"
  | "quantities"
  | "smallOrder"
  | "needs"
  | "property"
  | "timeOfDay"
  | "slots"
  | "customDate"
  | "contact"
  | "confirmed";

export type TimeOfDay = "morning" | "afternoon" | "any";

/** Serializable button: what it does is looked up in a handler map, so it survives a reload. */
export interface ChatButton {
  label: string;
  actionId: ActionId;
  payload?: string;
  variant?: "primary" | "secondary";
}

export type ActionId =
  | "greet_book"
  | "explain_posa"
  | "explain_detrazioni"
  | "show_products"
  | "small_survey"
  | "property"
  | "time_of_day"
  | "slot_pick"
  | "custom_picker"
  | "confirm_time"
  | "other_time"
  | "call"
  | "whatsapp"
  | "reschedule"
  | "resume";

export interface SuggestedSlot {
  date: string;
  time: string;
  assumed?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  buttons?: ChatButton[];
  review?: ConciergeReview;
  isMultiSelectProducts?: boolean;
  isQuantityStep?: boolean;
  isMultiSelectNeeds?: boolean;
  isSuggestedSlotsStep?: boolean;
  suggestions?: SuggestedSlot[];
  isCustomDatePickerStep?: boolean;
  customDefaults?: { date?: string; time?: string };
  isContactStep?: boolean;
  isConfirmedStep?: boolean;
  confirmedLines?: [string, string][];
  calendarUrl?: string;
  /** Free-text replies that came from the LLM are sent back as context. */
  fromLlm?: boolean;
}

export interface ContactDraft {
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

export interface ChatState {
  messages: ChatMessage[];
  flowPhase: FlowPhase;
  selectedProducts: string[];
  /** Keys: product id, or "productId:SubLabel" for split products. */
  quantities: Record<string, number>;
  needs: string[];
  propertyType: string;
  timeOfDay: TimeOfDay;
  finalDate: string;
  finalTime: string;
  contact: ContactDraft;
  calendarEventId: string;
  isReschedule: boolean;
  leadTracked: boolean;
  chatStarted: boolean;
  shownReviews: string[];
  /** Product the chat was opened with, for the greeting. */
  entryProduct: string;
}
