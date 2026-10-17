# Bosetti Serramenti: homepage rebuild plan

Source: *Brief homepage – Bosetti Serramenti* (Noemi, 9 Oct 2026), plus a review of the current Next.js 16 build on desktop and on mobile (375 px).

**Goal:** a homepage that looks like a family workshop that makes aluminium windows, not a SaaS landing page. It has one main job, booking the free sopralluogo (site visit). It also has to look strong in the 5 to 8 second reveal in the Loom video: hero, then family, then calendar.

---

## 1. What's wrong today (diagnosis)

### A. The brand system drifted from the brief
| Brief says | Build does |
|---|---|
| Headings in **Archivo 700** | `globals.css` maps `--font-heading` to **Inter 600** with −0.045em tracking. Archivo is only used in the logo. |
| Red **only for buttons and details** | Red is used for stars, eyebrows, step numbers, icons, borders and hovers, so it is everywhere and stops meaning "click here". |
| Mostly **warm white + aluminium grey**, dark only for contrast sections | Family cards, the aluminium band, process cards, reviews and the wizard are all dark `#2B2B2B`. Most of the page is dark. |
| Warm, artisan feel | Uppercase **Fragment Mono** labels on every element ("01 / 04 · SOPRALLUOGHI", "PASSO 02") feel like a tech template. |

### B. The hero tries to do too much
- It has two CTAs for the same action ("Prenota il sopralluogo gratuito" opens the modal, "Scegli data dal calendario" scrolls to the form). The header and the mobile sticky bar add two more, so a phone shows 4 booking buttons on the first screen.
- A product slider card competes with the headline. The brief asks for one photo of a large sliding door (alzante), a title, one button and the 4.9 stars.
- The 1210×525 slider photo is stretched to 82vh, so it looks soft. "Da padre in figli" is grey on a photo, which is low contrast.
- The intro paragraph has 50 words and names all 4 people. That belongs in the family section.

### C. The family section is the heart of the page, but it has no faces
- Each person has a monogram circle ("MB", "CB") where a photo should be. The brief explicitly asks for **photos and roles**.
- The cards are dense: dark boxes with an index, a monogram, a role, a description, a quote and a phone number.

### D. Content integrity (fix before showing it to Marco)
- The review **"Elena e Davide M."** mentions all four family members in one perfect sentence. It reads as invented, and it is labelled "Recensione verificata Google".
- The family-card quotes are **paraphrased** and attributed to real reviewers. For example, "Seri, precisi e puntuali dal primo contatto fino al montaggio" is credited to Mario B., but his review doesn't say that.
- The phone numbers were mapped to people (339 → Marco, 338 → Claudio/Leonardo) by assumption. The brief only says nobody explains who to call for what, which is defect #6.
- `legalName` and the VAT number in `data/company.ts` have to be checked.
- If Marco spots one invented review, the whole pitch loses credibility. Use only real reviews, word for word, and mark anything assumed as *da confermare*.

### E. Booking wizard (the feature being sold)
- The dates are hard-coded to 13 to 21 Oct 2026, and the default date (14 Oct) has **already passed**.
- The **privacy consent is pre-ticked** (`privacyConsent: true`). That is not GDPR-compliant, and it is a bad look for a pitch about doing things properly.
- Nothing is actually submitted. That's fine for the prototype, but the success screen should say what happens next, as the brief describes.

### F. Mobile and technical
- At 375 px the header's "Prenota sopralluogo" button overflows the screen.
- `app/page.tsx` is `"use client"`, so the whole page renders on the client. That is bad for SEO and LCP. Only the modal state needs to be client-side.
- Images use plain `<img>`, not `next/image`, and are low-resolution. The `unsplash` and `paginesi` remote patterns are unused.
- There is no `LocalBusiness` JSON-LD, which costs local SEO for "serramenti alluminio Montichiari".
- The page is long. Each product card has about 80 words plus 3 bullets.

---

## 2. Design direction

**"Bottega editoriale":** a warm off-white page, generous whitespace, large Archivo headings and real photos doing the work. It follows the Formwork reference (warm editorial layout, 4-step process, team section), and the product cards follow Winder.

- **Type:** Archivo 700 for H1/H2 (slightly wide, about −0.02em, *not* the current −0.055em). Inter 400/500 at 17–18 px for body. Remove Fragment Mono, and use small-caps Inter 500 eyebrows instead.
- **Colour:** about 80% `#F6F4F1` and white, aluminium `#9EA3A8` for rules and secondary text, and `#1F1F1F` for text. Use `#2B2B2B` for **two** contrast moments only: the "Produciamo noi" band and the footer. Use `#A8282A` only on primary buttons, the key icon and one detail line per section.
- **Shape:** fewer pills and fewer rounded-2xl cards. Use straight rules, photo-led blocks and an 8 px radius. That is closer to aluminium profiles than to an app UI.
- **Motion:** one subtle fade-up on scroll at most. No sliders.
- **Logo:** keep the SVG redraw, but ask Marco for the vector file and check the red against it.

---

## 3. New homepage structure

This follows the brief's order, with the family section straight after the hero as the brief's partner notes ask.

| # | Section | Content | Changes vs today |
|---|---|---|---|
| 0 | **Header** | Logo · Famiglia · Prodotti · Come funziona · Contatti · `030 961983` · **[Prenota il sopralluogo]** (red) | Becomes a thin bar that turns solid on scroll. On mobile: logo + phone icon + hamburger. The CTA is removed there because the sticky bar covers it. |
| 1 | **Hero** | Full-bleed photo of the large alzante (slider-1). H1: *"Serramenti in alluminio fatti da noi, a Montichiari. Da padre in figli."* One line: *"Tagliamo, assembliamo e montiamo noi. Il sopralluogo è gratis."* **One** red button, plus a Google ★ 4,9 · 39 recensioni chip. | No slider card, no second CTA, no paragraph. Use the photo at an aspect ratio that suits its size (about 70vh desktop, 4:5 crop on mobile) with a stronger bottom gradient. |
| 2 | **La famiglia Bosetti** | H2: *"Chi prende le misure è chi costruisce e monta."* 4 portrait cards: photo, name, role, one sentence each. One real review quote ("una famiglia come poche") as a pull-quote. | Photos replace monograms. Light background. Quotes only word for word from real reviews. Phone numbers move to Contatti. |
| 3 | **Produciamo noi, in alluminio** (dark band) | Workshop photo. *"Dal taglio del profilo al montaggio a casa tua: sempre le stesse mani."* 3 benefits with icons: **Dura** (no maintenance, doesn't rust) · **Isola** (thermal break) · **Leggero** (thin frames, more light). Stat row: *da oltre 30 anni · produzione propria · Montichiari*. | Shorter. One of the only two dark sections. |
| 4 | **Prodotti** | 6 photo cards: Finestre · Alzanti scorrevoli · Porte · Persiane e scuri · Vetrine · Zanzariere e tapparelle. Each has a photo, a title, one line and "Chiedi un sopralluogo →", which opens the wizard with that product pre-selected. | Remove bullets and paragraphs. Use a 3×2 grid on desktop and horizontal snap-scroll on mobile. |
| 5 | **Come funziona** | 4 steps in a row: Sopralluogo (Marco o Leonardo) → Preventivo (Simona) → Produzione (in laboratorio) → Montaggio. One short line each, plus *"Il sopralluogo è gratis e senza impegno."* | Light background, a numbered horizontal timeline, no dark cards. |
| 6 | **Recensioni** | Big *4,9 ★ · 39 recensioni su Google*, then 3–4 real reviews word for word (first name + initial), plus "Leggi tutte su Google →" (link to the GBP listing). | Remove the invented review and the 4 "highlight" tiles. Light or white cards. |
| 7 | **Prenota il sopralluogo** | H2: *"Il sopralluogo è gratis. Prenotalo adesso, ti richiamiamo per conferma."* The 4-step wizard sits inline here. | Moves after reviews (closing argument) and before contacts. Light frame. See §4 for the fixes. |
| 8 | **Contatti** | Map + address + hours. Three numbers, **each labelled with what to call it for** (*da confermare con Marco*), WhatsApp **chat** (wa.me, not share), email. | Fixes defect #6. |
| 9 | **Footer** (dark) | Logo, address, VAT number (verified), social links, privacy. | |
| — | **Mobile sticky bar** | Chiama · WhatsApp · **Prenota sopralluogo** (red) | Already exists. Restyle it, and make it hide while the wizard is on screen. |

**Brief §8 "booking form repeated at the bottom":** section 7 is the inline wizard and every CTA above it opens the same wizard in a modal. That covers the brief without showing two copies of the form on the page.

---

## 4. Booking wizard fixes

1. **Dynamic slots:** generate the next 10 working days from *today*. Skip Sundays, offer Saturday mornings only, and use 8–12 / 14–18 on weekdays. Alternate Marco and Leonardo as placeholders until Google Calendar is connected.
2. **Privacy consent unchecked by default**, required, with a link to the privacy policy.
3. **Step 2:** keep the piece counter and photo upload, and use `capture="environment"` so the phone camera opens directly on mobile.
4. **Success screen:** *"Fatto! Leonardo passa da te giovedì 23 alle 9:30. Ti richiamiamo per conferma e ti mandiamo un promemoria il giorno prima."* Add an "Aggiungi al calendario" (.ics) link.
5. **Light theme** to match the new page, and a progress bar with 4 steps.
6. **Real backend (phase 2, not the prototype):** Google Calendar free/busy + event creation, an email summary to Simona (types, quantities, photos), and confirmation + reminder emails to the customer. Reuse the engine from preventivogratuito.falzoneserramenti.it.

---

## 5. Technical work

- Make `app/page.tsx` a **server component**. Move the modal state into a small `BookingProvider` client context so sections stay server-rendered.
- Fix `globals.css` tokens: `--font-heading` → Archivo, remove Fragment Mono, add tokens for spacing and radius, and use Tailwind theme colours (`bg-bg-light`, `text-accent-red`) instead of hard-coded hex values in every component.
- Use `next/image` for every photo, with `priority` on the hero and proper `sizes`. Remove the unused `remotePatterns`.
- Add `LocalBusiness` / `HomeAndConstructionBusiness` JSON-LD (address, hours, phones, aggregateRating 4.9/39) and OG images.
- Accessibility: AA contrast (hero text, grey on warm white), visible focus states, a focus trap in the modal, and 44 px tap targets.
- Read `node_modules/next/dist/docs/` before touching config, as AGENTS.md says (Next 16, with `cacheComponents` turned on).

---

## 6. Assets and info needed from Bosetti (prototype can use placeholders)

- [ ] Logo as a vector file (AI/SVG/PDF), to confirm the red
- [ ] Photos of the family (4 portraits + 1 group shot in the workshop)
- [ ] Workshop photos (cutting, assembly) and high-res photos of installed alzanti
- [ ] Who answers which phone number, for what
- [ ] Permission to quote reviews by first name + initial
- [ ] Which Google Calendar(s) the sopralluoghi go into

Until these arrive: use slider-1…5 for the hero, products and band (the brief says these are fine for the video). Family cards use a tasteful placeholder (a warm-grey silhouette and name, with no fake stock faces).

---

## 7. Execution order

1. **Foundations:** tokens, fonts (Archivo), server page + BookingProvider, header/footer/sticky bar, fix the mobile header overflow.
2. **Hero + Famiglia:** these make up the Loom reveal, so polish them first.
3. **Produciamo noi + Prodotti + Come funziona.**
4. **Recensioni (real reviews only) + Contatti** (labelled numbers, WhatsApp chat).
5. **Wizard fixes** (dynamic slots, consent, light theme, success copy).
6. **SEO/a11y pass:** JSON-LD, next/image, contrast, Lighthouse ≥ 90 on mobile.
7. **QA:** check 375 / 768 / 1440 px in the browser, click through the full booking flow, `npm run build` + lint, and record the reveal clip.

**Done when:** the first two scrolls on mobile show the alzante, the H1, one red CTA, 4.9 ★ and four family faces. The wizard books a future slot in 4 taps. No invented content remains. `npm run build` passes.
