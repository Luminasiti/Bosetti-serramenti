# Bosetti Serramenti: design system

The site should feel like a family workshop that makes aluminium windows (*bottega di famiglia che produce in alluminio*), not a reseller or a SaaS product. Tokens live in `app/globals.css` (`@theme`). Components live in `components/ui`.

## Audit of the previous build (before the rebuild)

| Category | Defined | Hard-coded values found |
|---|---|---|
| Colours | 6 CSS vars | **588** `[#hex]` arbitrary classes |
| Typography | 3 fonts | **61** `text-[Npx]`; headings in Inter, not Archivo; 96 mono labels |
| Spacing / radius | none | `rounded-2xl` / `rounded-3xl` / `rounded-full` mixed |

Priority actions taken: (1) every colour goes through tokens, (2) Archivo becomes the display face, (3) red is reserved for actions and details, and the mono labels are removed.

## Tokens

### Colour
| Token | Value | Use |
|---|---|---|
| `paper` | `#F6F4F1` | Page background (about 80% of the page) |
| `white` | `#FFFFFF` | Cards and form fields on paper |
| `ink` | `#1F1F1F` | Headings and body text |
| `ink-2` | `#55595D` | Secondary text on paper (contrast 6.4:1) |
| `alu` | `#9EA3A8` | Rules and decoration, and secondary text on dark only (contrast 5.5:1 on graphite). **Never text on paper.** |
| `alu-soft` | `#E4E2DE` | Hairlines and placeholder fills |
| `graphite` | `#2B2B2B` | Two contrast moments only: the "Produciamo noi" band and the footer |
| `key` | `#A8282A` | Primary buttons, the key icon, one detail per section. Never body text. |
| `key-dark` | `#8B1F21` | Hover and active state of `key` |

### Type
- **Display:** Archivo 700, `font-stretch: 112%` (slightly wide, like the logo lettering), tracking −0.02em.
- **Body:** Inter 400/500, 17 px base (18 px from `md`), line-height 1.6.
- **Scale:** `display` clamp(2.5rem → 4.5rem) · `h2` clamp(2rem → 3.25rem) · `h3` 1.375rem · `lead` 1.1875rem · `small` 0.875rem.
- **Eyebrow:** Inter 600, 0.8125rem, uppercase, +0.08em tracking, `ink-2`, with a short red rule in front. This is the only allowed use of all caps.

### Space, shape, motion
- Section rhythm: `py-20 md:py-28`. Container 1240 px with a 20 px gutter (32 px from `md`).
- Radius: `sm` 4 px (inputs, chips) · `md` 8 px (cards, photos). Buttons are 8 px, not pills, which is closer to a squared aluminium profile.
- Shadows: none by default. One soft shadow (`shadow-card`) on hover or on the floating rating chip.
- Motion: 150 ms colour transitions only. Respect `prefers-reduced-motion`. No sliders.

## Components

### Button
| Variant | Use when |
|---|---|
| `primary` (key) | The one main action: prenota il sopralluogo |
| `secondary` (ink outline) | Supporting actions: chiama, WhatsApp, leggi recensioni |
| `ghost-light` | Secondary action on graphite |

States: default · hover (`key-dark` / ink fill) · focus-visible (2 px ink ring with 2 px offset) · disabled (50% opacity). Minimum height 48 px (`lg` 56 px). Renders `<a>` when it has an `href`, otherwise `<button>`. `BookingButton` is the client wrapper that opens the booking modal.

### Eyebrow · SectionHeading · Stars · Photo
- `SectionHeading` = Eyebrow + H2 + optional lead, left-aligned (centred only in the booking section).
- `Photo` = `next/image` with `fill`, radius `md` and `sizes` always set. The hero photo uses `preload`.

### Patterns
- **Family card:** portrait 4:5, then name (h3), role (ink-2), one sentence. Without a real portrait, it shows a placeholder in the alu tone with the initial and the key mark. No stock faces.
- **Product card:** 4:3 photo, title, one line, and "Chiedi un sopralluogo →", which opens the wizard with that product pre-selected.
- **Review card:** white card, stars, the review word for word, then the first name + initial. Only real Google reviews.
- **Booking wizard:** light card, 4-step progress bar, large tap targets. Privacy consent is unchecked by default.

## Do / Don't
| Do | Don't |
|---|---|
| Use red once per viewport for the main action | Use red for stars, icons and numbers all at once |
| Use short sentences with "noi" and "tu" | Use brochure wording ("partner ideale", "a 360°", "soluzioni") |
| Use real photos and real reviews, and mark anything that is a placeholder | Invent reviews or paraphrase quotes and attribute them to customers |
