# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: invited wedding guests.** Each guest receives a personalized capability link
(`?id=<token>`) sent through chat — Messenger or Instagram — and opens it on their phone,
usually one-handed, often mid-conversation. A meaningful minority later open the same link on
a desktop browser. Both breakpoints matter; the phone is the first read.

Guests arrive to answer one question ("are you coming?") and to look up practical details
(when, where, what to wear, where to stay) repeatedly over the months before the wedding.

**Secondary: the couple and their admins**, who use the Google-authenticated dashboard at
`/dashboard`. They work on a phone or a laptop, in short bursts, over the same nine months —
checking who has replied, chasing the ones who have not, and reading dietary and companion
detail off a board. Since 2026-09-02 these surfaces share the guest letter's visual world; see
Brand Commitments.

## Product Purpose

An invite-only wedding site. The couple pre-registers each invitee (a party/household) in the
admin dashboard, which mints a per-person link. The guest opens their link, reads the wedding
letter, and submits attendance plus head-count and dietary needs.

Success: every invited party opens their link and submits a reply without asking a follow-up
question, and returns to it later for logistics instead of messaging the couple.

## Positioning

Not a generic RSVP form. The guest-facing top page is a **single long-form letter** — hero,
countdown, our story, the day itself, attire, location, hotels, RSVP, gifts, FAQ — read top to
bottom as one continuous document, with the reply embedded near the end rather than sitting on
its own page. Personal correspondence that happens to collect data.

## Operating Context

- Distribution is chat-app links, not email. No notifications, no guest accounts; the token in
  the URL is the entire identity mechanism.
- Guests may share their link, lose it, or reopen it many times over ~9 months.
- Sections are full-bleed and deliberately overlap; the page scrolls natively as one document
  (`components/letter/wedding-letter.tsx` composes the `components/letter/*` sections).

## Capabilities and Constraints

Design work covers both the guest letter (`app/page.tsx` → `components/letter/wedding-letter.tsx`
and everything under `components/letter/`) and the admin surfaces (`/login`, `/dashboard`,
`/dashboard/users`, `components/dashboard/`). They are now one visual world — see Brand
Commitments — but they are not interchangeable: the letter is a document to be read, the admin
is a task surface, and the rules that differ between them are recorded there.

**Superseded:** until 2026-09-02 this section read "Design scope is the top page only … do not
touch `/dashboard` or `/login` — those follow imported hi-fi Claude Design files and are
settled." The imported files (`Wedding RSVP Dashboard.dc.html`, `Wedding RSVP - Kanban*.dc.html`)
are no longer the visual authority for those routes; their layout and interaction survive, their
palette and type do not.

- Next.js 16 App Router (root `app/`, no `src/`), React 19, Tailwind v4, TypeScript, pnpm.
  Next 16 conventions differ from older training data — read `node_modules/next/dist/docs/`
  before writing framework code.
- shadcn/ui (base-ui, `nova` preset) is the component baseline; check shadcn before hand-rolling.
- `motion` (v12) carries the letter's motion language. Timings, easing and the
  reduced-motion floor live in `components/letter/motion-tokens.ts`; the shared
  reveals are `in-view-reveal.tsx` (plain block entrance), `letter-reveals.tsx`
  (the heading ink-stroke, its kicker, and the attire plate's develop) and
  `ornament-drift.tsx` (the only scroll-linked enter+exit, ornaments only).
  **`useReducedMotion()` cannot be trusted on its own in this stack** — it is a
  one-shot `useState` seeded from module state that is still `null` during the
  render that matters, so it reports `false` while motion itself declines to
  animate, leaving content stuck at its server-rendered hidden state. Put
  `MOTION_REDUCE_SAFE` (or `MOTION_REDUCE_OPEN` for a height collapse) on
  anything whose resting state comes from motion.
- The page shell stays statically prerendered (Cache Components / PPR); only the RSVP body
  streams in under Suspense. Design work must not force the shell dynamic.
- Guest replies: `going` / `not_going` only, with `adults` + `kids` bounded by the party's
  `max_guests`, plus dietary presets and free text.
- No i18n, no guest login, no email confirmations, no RSVP editing after submit.
- Retired but kept for reuse: `components/letter/envelope-reveal.tsx`; the vinyl player (`components/letter/vinyl-player.tsx`) spins in the countdown band.
  The envelope-intro scroll approach was tried and reverted — do not reintroduce it unasked.
- `docs/rsvp-spec.md` is the source of truth for data model, DTOs, and admin behavior; keep it
  in sync when a decision there changes.

## Brand Commitments

- **Colors are locked: the home page is antique linen + espresso olive, while existing white
  surfaces stay white.** The guest letter (`app/page.tsx` → `components/letter/wedding-letter.tsx` →
  `components/letter/*`) uses **antique linen `#B9AA93`** for its canvas and **espresso olive
  `#2C2A1B`** for text and buttons. Established paper sections, cards, and QR quiet zones remain
  **white `#FFFFFF`**. Shadows are espresso-tinted (`rgba(44,42,27,…)`), not black.
  - Implementation: `--linen: #b9aa93`, `--paper: #ffffff`, `--ink: #2c2a1b`, and their Tailwind theme keys live in `app/globals.css`;
    the `.letter-theme` scope re-points the shadcn tokens (`foreground`, `primary`, `muted-
    foreground`, `border`, `input`, `ring`, `destructive`, `script`…) onto linen, white, and espresso for that
    subtree, so shadcn components used inside the letter need no per-component colour. Use the
    `text-ink` / `bg-ink` / `border-ink` utilities with opacity modifiers — don't reintroduce
    hex literals.
  - Alpha survives only where it is physically a scrim or shadow. Otherwise text, rules, fills,
    borders, and icons are full linen, white, or full espresso; the RSVP form's `ink/20` rules and card
    frames are the sole opacity exception.
  - The one exception to ink-tinting is the hero photo scrim, which is neutral `bg-black/30`:
    ink-tinting it cast a green wash over the lily photograph, and a scrim's job is to darken
    the image, not to colour it. **The scrim is a legibility requirement, not a mood choice** —
    the couple's names are white script over drapery whose brightest folds reach 0.54 relative
    luminance, and with no scrim a tenth of the glyph area measured below 3:1 against the pixels
    directly behind it (worst case 1.55:1). 30% is the measured floor at which nothing falls
    below 3:1. The value was `/50`, tuned for the retired lily photo; on the current artwork
    that darkens the backdrop 4x for no legibility gain. The measurement table lives in
    `components/letter/opening-backdrop.tsx` — re-measure it if the backdrop image is replaced.
  - Hover states invert between white and espresso instead of tinting; placeholder fills are hairline stripes
    of one colour on the other, not a wash.
  - **Granted exception — the complete list. Nothing else may be added without the couple's
    say-so.** The prenup gallery uses near-black film stock (`--film: #151512`) so its
       perforated 35mm silhouette reads as physical film rather than another ink panel. The
       RSVP form's section rules are thinned espresso (`ink/20`). Five
       full-ink hairlines inside one small card read as heavier than the answers they separate.
       Applies to the rules dividing the form's sections and the companion cards' frames
       (`components/letter/rsvp-form.tsx`, `components/letter/rsvp-reply.tsx`) — not to rules
       anywhere else in the letter, which stay full espresso on linen. Required marks and error
       states use espresso too, with `required` attributes and textual alerts carrying the meaning.
  - **Exempt:** photographs (`/hero-lily.jpg`, `/beach-location.jpg`) and
    `public/attire-guide.png`, which is a multi-colour palette illustration and is the content.
    Everything else drawn in CSS or SVG obeys these colours plus the granted opacity exception above.
- **One world across guest and admin. "Wisteria & fig" is retired.** The admin used to run a
  second identity — plum `#4a2f3a` on white with a `#8a76b0` wisteria accent and a sage script,
  imported from a hi-fi design file. Beside the letter it read as a different product. The
  `:root` token set in `app/globals.css` is now built on the letter's own materials, and the
  admin surfaces inherit it.
  - **The admin's ground is white, not linen.** The unity is the ink, the type, the botanicals
    and the pigments — not the canvas. An admin is in a task, reading a dense board of names,
    counts and notes, and that wants the quietest ground available; antique linen stays the
    letter's, where it is the paper the invitation is written on.
  - **`/login` stands on the guest drapery.** It reuses `components/letter/lace-backdrop.tsx` —
    the same artwork as `/` (the envelope invitation), the loading screen and the letter's hero —
    with the couple's real monogram on a white card. A door, not a desk. It carries no floral
    frame of its own: the photograph is already the ornament.
  - **The admin gets a tonal ladder the letter forbids itself.** A guest card ranks a name, label
    chips, a head-count, a contact table, dietary notes and a control row inside a postcard, and
    size/face/weight alone cannot do that. Three quieter inks, each tinted FROM the espresso and
    never grayed: `--ink-2 #5c584a` (7.12:1 on white), `--ink-3 #6b6754` (5.69:1),
    `--ink-faint #77725c` (4.83:1).
    - **`--ink-faint` is for white grounds only.** On the three status washes it
      measures 4.10 / 4.05 / 3.89:1, under the floor. Text on a lane takes
      `--ink-3`, which clears it on all three (4.83 / 4.77 / 4.58:1). An earlier
      draft of this file claimed all three steps passed on every wash; they do not.
    - None of them are legible on antique linen (2.50:1 and below), which is one more
      reason the admin ground is white. `.letter-theme` flattens all three back to full ink.
  - **The kanban's three status hues are earth pigments, used only as state.** Raw sienna for
    awaiting, olive for attending, clay for declined, each with a wash, a drag-over wash, an
    edge, a mark and a darkened `-ink` that passes on its own wash. They replaced the imported
    wisteria-gold / sage / dusty-rose set. Colour on the admin is reserved for state; primary
    actions are espresso, like the letter's buttons.
  - **The admin's botanicals are the letter's real assets.** `components/dashboard/florals.tsx`
    keeps the imported design's stem geometry (edge-anchored on real component borders) but draws
    every leaf and bloom from `/florals/{rose-bloom,leaf-large,leaf-small}.svg` — the same three
    plants Our Story grows — masked to a flat colour so the call site picks the pigment. The
    hand-drawn blossoms, ellipse leaves and cartoon bride-and-groom of the imported design, and
    the 81 hardcoded hexes behind them, are gone.
  - **The admin's type scale is FIXED rem, not the letter's fluid roles.** Product UI is read at
    a fixed distance and a clamped heading that shrinks inside a kanban column looks worse, not
    better. The admin uses Tailwind's built-in ladder plus two additions: `--text-2xs` (11px,
    registered in `lib/utils.ts` like every other role) and `.label-caps`, the tracked micro-caps
    role that eleven call sites used to hand-write at 9px/10px/10.5px.
- **Section set and order are locked.** Hero, welcome band (date strip and countdown), our story, the day
  itself, attire guide, location, hotels, RSVP, gifts, FAQ.
- **Copy is not locked** — all guest-facing content is draft and may be rewritten.
- **Type stack: two faces, and only two.** `app/layout.tsx` loads Montserrat (`--font-sans`)
  and Parisienne (`--font-script`) — nothing else. Earlier drafts of this file also listed
  DM Sans, Gilda Display, Playwrite US Modern and Beth Ellen; DM Sans was the sans face until
  2026-07-27, and the other three were never loaded at all. Adding a third face needs a role
  only it can perform, and a `next/font` entry to go with it.
  - `--font-sans` is global, so Montserrat is also the dashboard's face. The imported hi-fi
    design's DM Sans / Gilda Display pairing is not loaded and never was.
  - Montserrat is materially WIDER than DM Sans, and the countdown row is the tightest line
    in the letter — four number+unit pairs across a 360px phone. `--text-figure`'s floor is
    set by that row, not by taste: every 1px of figure costs about 5px of row width. Re-measure
    it before changing the sans face again.
- **The type scale is locked, and it is a role scale.** The nine roles in `app/globals.css`
  (`micro`, `label`, `meta`, `body`, `lead`, `subhead`, `heading`, `entry`, `title`, `figure`)
  are the letter's only sizes. Two of them — `entry` and `title` — are for Parisienne and are
  sized far above the sans role of the same rank, because the script reads at roughly half its
  nominal size; set a script line at a sans role and it comes out quieter than body copy. Each is one fluid `clamp()` between a 360px phone and a 1280px
  desktop, so `text-body` alone covers both breakpoints — a role must never need an `sm:`
  size beside it. Use a role name; do not reach for `text-sm`, `text-xs`, or a bracketed
  pixel size. The floor is 16px for prose and 12px for anything at all, both measured on the
  narrowest phone. Hierarchy still comes from size, face and weight only — never from tone.
  - **A new role must be registered in `lib/utils.ts` as well as `app/globals.css.`**
    tailwind-merge cannot infer that `text-title` is a size, so it files unknown `text-*`
    names under *colour* — and `cn('text-title', 'text-ink')` then reads as a
    colour-vs-colour conflict and silently DROPS the size. That is not theoretical: it is
    what flattened every section heading, kicker and button on the first pass. `cn`
    extends the `font-size` group with the role names to prevent it.
  - The shadcn primitives are sized for the letter by unlayered `.letter-theme [data-slot=…]`
    rules in the same file, because their own base classes are utilities that a call-site
    class cannot reliably beat. Change the size there, not per component.
- **The spacing rhythm is locked too, and it is also a role scale.** Three roles in
  `app/globals.css` — `gutter` (page side padding), `section` (a section's vertical padding)
  and `heading` (a SectionHeading and the content it introduces) — each one fluid between a
  360px phone and a 1280px desktop. Use `px-gutter`, `py-section`, `mt-heading`; do not
  hand-write `px-5 sm:px-9` or `py-24` again. Two `section` paddings stack between adjacent
  sections, so the role is half the visible gap: 144px on a phone, 224px on a desktop.
  - Unlike the type roles these need no tailwind-merge entry: an unrecognised `px-gutter`
    falls into no existing group, so the worst case is a missed de-duplication, not the
    silent drop that unregistered `text-*` roles suffer.
  - **The domes have their own token, `dome` = `12rem + section`.** Every dome in the letter
    is 12rem deep — either the bite the next section takes with `-mt-48`, or the height of
    the arch a section draws for itself — so the padding that clears one is that 12rem plus
    one `section` of breathing room. `pb-dome` (countdown band), `pt-dome` (prenup, RSVP).
    These were hand-tuned to 18rem, 19rem and 14rem, which left 32px of air under the RSVP
    arch against 112px under Our Story's dome; the token keeps all three in step.
  - **A dome has two sides, and both need checking.** The run from the previous section's
    last content down to the dome, and the run from the dome down to the next heading. The
    RSVP arch was correct on its lower side and 264px against everyone else's 72px on its
    upper side, because it is the one dome drawn as an OVERLAY — the other three are carved
    out of a section's own padding with a border radius and cost no extra height. It bites
    `-mt-section`, not `-mt-48`: at a Hotels card's edge the arch is already ~95px deep, so
    the shoulders, not the crown, limit how far it can rise before ink covers the cards.
  - `-mt-48` and the `180px` curve radius stay literal: they are the dome geometry itself,
    not spacing, and `dome` is derived from them. `pt-28 sm:pt-32` (countdown band and Our
    Story) is a different relationship again — content seated under a section's OWN crown,
    where the curve rises above the content rather than dipping into it.
  - Exceptions, both deliberate: the hero's couple names are sized against the lace frame
    they sit inside rather than the scale, and the countdown row sizes its parts in `em`
    against a single `text-figure` on the row, so the whole line scales from one knob and
    cannot burst its column on a phone.
- Florals: vines must sit on a component's real border (edge-anchored), never float near
  corners. No hand-rolled SVG floral path art — use real assets or minimal geometry.

## Evidence on Hand

- Real: the palette, the section structure, the working RSVP pipeline, the admin dashboard.
- **Placeholder — never present as fact, never invent replacements:**
  - The date `2027-04-10` (`lib/wedding.ts`).
  - Venue, hotels, and attire content in the letter sections.
  - Our-story text, FAQ answers, gift details.
- No photographs of the couple exist in the repo yet. Do not fabricate imagery, quotes, vendor
  names, or logistics.

## Product Principles

1. **The reply is the job.** Judge every decision by whether a guest on a phone finishes the
   RSVP without confusion.
2. **One letter, not a site.** Continuity between sections beats navigational chrome.
3. **Provisional to us, never to the guest.** Design around the real shape of the content;
   never invent facts to fill a layout.
4. **One world, two registers.** Guest and admin share the ink, the type family, the botanicals
   and the pigments. They do not share the ground, the type scale, or the tonal rules — the
   letter is read, the admin is worked in. When the two conflict, the surface's mode decides.
5. **Mobile is the design, desktop is the adaptation** — not the reverse.

## Accessibility & Inclusion

Guests span a wide age range and open the page inside chat-app in-app browsers. Tap targets must
be generous, no essential action may depend on hover or a hidden gesture, and text must stay
legible over the gradient and floral layers. Respect `prefers-reduced-motion` for the scroll
reveals and countdown — and enforce it in CSS, not only in JS, for the reason recorded under
Capabilities and Constraints.

Verifying scroll-triggered motion needs a browser that is actually compositing frames: both
automation panes background their tab, so `document.visibilityState` is `hidden`, the render
lifecycle is paused and `IntersectionObserver` never fires — every reveal reads as stuck at
opacity 0. Drive a self-launched headless Chrome over CDP instead.
