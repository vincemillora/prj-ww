# Wedding RSVP Site — Project Spec (Option A)

> **Current typography:** The application uses Montserrat for sans text and **Parisienne** for the shared script face through `next/font/google`.

> **RSVP envelope:** The front paper carries the rustic-ink variant of the existing couple logo, nested in the same rotated layer so it always follows the envelope's tilt.

> **Status:** Admin auth + dashboard **built**. **Guest management built** — invitees, per-person invite tokens, editable labels, and admin CRUD on a **single-page “Manage RSVP”** dashboard at `/dashboard` (**kanban board** — see below — with search + label filter and CSV export; sidebar-less). Visuals follow the imported **hi-fi** Claude Design `Wedding RSVP Dashboard.dc.html` (“wisteria & fig”; fonts **DM Sans** / **Gilda Display** / **Parisienne** (script; originally Pinyon Script in the imported design); gradient bg; mobile/iPad responsive; **decorative floral layer** — page-corner sprays, a name sprig, account-chip sprigs, and guest-card corner frames from the design, in `components/dashboard/florals.tsx`). The guest list follows the imported **kanban** designs (`Wedding RSVP - Kanban{,- Tablet,- Mobile}.dc.html`): desktop/tablet show three drag-and-drop status columns (Awaiting reply / Attending / Declined — warm tinted, dashed borders, dragging a card calls `moveGuestStatus`); phones swap the board for three status tab pills over the same card list (no drag — status changes via the edit dialog); on mobile each card carries the leafy corner frame on one corner's two edges (stem on the card border), cycling the corner (tl→tr→br→bl) per item via `CardCornerFrame`. Vines are **leafy frames whose stem sits exactly ON the outline** (`components/dashboard-florals.tsx`; strict rule — the spray art's stems are inset 10% of its height, so the frame is shifted by −10% of its rendered height: 230px → −23px, 128px → −13px). **Awaiting** = bottom-left frame, **Declined** = top-right frame, **Attending** = **no vine** (explicit decision after full-outline attempts failed review). On mobile the vines are **per card only** — `CardCornerFrame` on each item, corner cycled tl→tr→br→bl; never on the tab list container. Column headers show a **headcount** (people, not rows): **Attending** sums the reply party (`adults` + `kids`) so a family that answered "2 adults, 1 kid" counts 3; **Awaiting** and **Declined** sum each row's `maxGuests` allotment so a declined family of 4 counts 4. **Attending** additionally breaks out **adults** and **kids** subtotals. The mobile status **tab pills** show the same headcount (not a row count). Cards have **no avatars** (guests aren't accounts) and show contact info under the name — **phone first** (higher priority), then email; both when present, an em-dash when neither. Each card shows the ×party figure plus a spelled-out reply head-count (“2 adults · 1 kid” — zero/none parts hidden), a labeled **Replied** date (when answered), and groups guest + admin notes under one **Notes** section (color-coded Guest/Admin sub-labels). The Attending column's stats also show the **adults · kids totals** beside the headcount. The former stat-card row and paginated table were replaced by the board; long columns paginate with a per-column “Show more” (20 at a time). The guest-facing RSVP form (the page a `?id=<token>` link opens) is **built** at `/`: reads the invitee by token, shows a personalized greeting, hides the form when no/unknown token, and shows a confirmation when already answered. Its contents are wrapped in a **scroll-driven envelope reveal** (`components/envelope-reveal.tsx`, `"wisteria & fig"`) using a **pinned, sinking-envelope** pattern: a `sticky` stage on the plain white page holds an **olive paper** CSS envelope (landscape, `aspect-ratio:1.7`, fluid width `min(92vw, 140dvh)`; ported from CodePen `ahoidahl/mydZXQJ`, scroll-driven instead of hover) whose **four flaps meet at the centre** (clean symmetric shape, sharp corners, **no wax seal**). The envelope starts dead-centre and, as you scroll, **glides down** by `--env-drop` over its own long scroll segment until only its **top half** stays visible — **top quarter on ≥1024px** — while the **top flap rotates fully open** (`rotateX`; its z-index is swapped so it stays visible standing behind the letter) and the letter rises up through the centre; the **front flaps** (`.env-front` bottom + `.env-face-*` sides, z-index 12, `pointer-events:none`) tuck the letter's base while never covering content above the centre. Motion runs as **CSS scroll-driven keyframes on the compositor** where supported, else via an eased (`easeInOutCubic`) rAF scroll listener writing `--pf`/`--pd`/`--pl`; a “Scroll to open” cue fades on first scroll. **Responsive**: the envelope scales fluidly with the screen; the letter is 84% of it (92% ≤640px) and its content column is 80% of the letter on `sm+` with a `24dvh` bottom tuck allowance. A single **paper letter — which IS the page content** (the long wedding letter from `components/wedding-letter.tsx`) — slides UP out of the pocket 1:1 with scroll and settles with its **base still tucked in the pocket**. The **RSVP section** (`components/letter/rsvp.tsx`, reads the `?id=<token>` link → form / thank-you / gating note) is rendered **OUTSIDE the reveal** as a normal-flow sibling in `app/page.tsx`, appearing just below the letter: its form conditionally mounts fields (adults/kids steppers, the “Other” text) and the reveal's rise transform is a **percentage of the letter height**, so any in-letter height change would rescale that transform and jump the whole letter — keeping the form in normal flow avoids this. The vinyl music player intro (`components/vinyl-player.tsx`, #54) is currently **hidden** (not rendered by `app/page.tsx`; kept for reuse). The illusion holds via a clip window (`.letter-clip`, `overflow:hidden`, bottom edge = pocket mouth) that hides anything below the mouth, plus the front flaps (z-index 12, `pointer-events:none` so the form stays clickable) drawn in front of the letter’s base. Tall content scrolls inside the paper (`.env-content`, `max-h:82dvh`). Motion is a single scroll-progress custom property `--p` (0→1) written each frame; all transforms live in CSS (`app/globals.css · "Envelope reveal"`) so it scrubs with the scrollbar; **honors `prefers-reduced-motion`** (pin/envelope dropped, letter shown statically). The form is **styled** in the "wisteria & fig" system with shadcn/ui (`Button`, `Input`, `Label`, `Textarea`, `Separator`) plus selectable radio-cards for the attend/decline choice (`has-[:checked]` highlight); it sits on the reveal letter. The **going** branch uses −/+ **steppers** for the adults/kids counts and collects **allergies** — checkbox presets from `lib/dietary.ts` (Shellfish / Shrimp / Fish / Chicken / Peanuts / Eggs / Dairy / Halal) plus an **Other** checkbox that opens a free-text field; stored on `guests.dietary` (text[]) + `guests.dietary_other` (text) and shown on the dashboard card + CSV export. This is the source of truth for the RSVP feature.
> **For Claude / agents:** Read this file before designing or writing any RSVP-related code.
> When code and this spec disagree, treat it as a bug — fix one of them, don't silently diverge.
> Update this spec in the same change whenever a decision here changes.

---

## 1. Overview

> **Current route status:** The route-specific details in the historical status paragraph above are superseded by this section. The guest letter and RSVP form live at `/rsvp`; `/` is the invitation entry page and preserves a supplied `?id=<token>` when linking onward.

### Public routes

- `/` is a hero-background invitation entry point; its envelope link preserves an incoming
  `?id=<token>` code as `/rsvp?id=<token>`. The link is a client transition, not a document
  navigation: tapping the envelope plays an opening animation for one beat and then pushes,
  so the tap is acknowledged immediately instead of leaving the old page frozen while `/rsvp`
  loads. `/`, its loading screen, and the letter's hero all stand on the same `LaceBackdrop`,
  so only the foreground moves and the journey reads as one continuous scene.
- `/rsvp` renders the guest-facing wedding letter and RSVP form.
- `/dashboard` and all dashboard routes are unchanged.
- **iOS Safari chrome, and why the letter stops short of the screen edge.**
  All figures measured on iPhone 17 Pro / iOS 26.5, with **real swipe gestures** — this
  cannot be tested with `window.scrollTo`, which never minimises the address bar and puts
  every reading in the wrong state.
  - Scrolled by a real gesture, Safari minimises its address bar to a floating pill and a
    plain page's **flowed content genuinely reaches the bottom of the screen**, under the
    pill. This is what the reference site does; it sets no `viewport-fit` at all.
  - **What stops it here: any painted `position: sticky` layer.** The band appears the
    moment such a layer scrolls into the viewport and then does NOT go away for the rest
    of the session — it latches. Height is not the trigger: an ordinary 56px painted
    sticky nav bar reproduces it. An empty or text-only sticky does not. Removing
    `sticky` always clears it. Verified on device: with every painted sticky removed from
    the letter, content reaches the bottom row of the screen under the minimised pill.
  - **The band is Safari's own opaque chrome material, NOT our document canvas.** It
    stays white with the canvas forced to `#ff00ff`. Colour matching is therefore not a
    mitigation — there is nothing of ours to match. `theme-color` is ignored outright on
    iOS 26, static or mutated.
  - **Instrument warning — read before re-testing.** Counting canvas-coloured pixels is
    structurally blind to this bug: the band is chrome, so a "no canvas pixels" reading
    says nothing. This was measured wrongly several times before being caught by eye.
    Test by looking at the screen, and scroll with a real touch drag — a trackpad or
    wheel scroll never collapses the address bar, so it parks you in the expanded state,
    which reserves a strip on every page ever made (a page containing nothing but one
    striped div reserves an identical one).
  - **Standing trade-off.** The letter's pinned scenes and edge-to-edge content are
    mutually exclusive on iOS 26. The pins are: `OpeningBackdrop`'s backdrop zoom,
    `Hero`'s pinned type, `PrenupGallery`'s scroll-driven pan, `Rsvp`'s backdrop hold,
    and `RsvpEnvelope`'s glide-and-tuck. Keeping any one of them keeps the band. Both
    public routes keep `viewport-fit=cover`.
  - **DECIDED: the scenes win and the band is accepted.** The pinned motion is part of
    the approved design, so it is not traded away for the last ~58pt of screen. Nothing
    in our CSS moves this band — not the canvas colour, not `theme-color`, not
    `viewport-fit`, not `env(safe-area-inset-*)` (both insets are `0px` in portrait
    Safari), not `overscroll-behavior`, not swapping `vh` for `dvh`/`svh` (already done
    throughout), not moving `overflow` off the sticky. All measured. Re-open only if a
    future iOS changes the sticky behaviour; the removal spike is preserved on branch
    `spike/ios26-no-painted-sticky` (commit `16e6c10`) if it ever needs re-evaluating.
  - Unrelated to the band, `FooterLace` declares `bg-lace` (`--lace: #877863`, the
    measured average of `public/lace-bg.png`) rather than `bg-paper`, so the frame before
    the drapery decodes does not flash white under the white sign-off type.

An **invite-only** wedding RSVP website. The couple pre-registers each invitee (a party/household)
in a Google-authenticated admin dashboard (`/dashboard`), which mints a per-person link
(`?id=<token>`). Each invitee later opens their personalized link and submits attendance. The
couple manages invitees + tags and (once the guest form is built) reviews responses in the dashboard.

- **Repo:** `github.com/tt-vince/prj-ww`
- **Hosting:** Vercel
- **Database:** Neon Postgres (connected via Vercel Marketplace integration — not a Claude MCP)
- **No separate backend service.** The only server logic is a Next.js Server Action co-located
  in the app.

### Non-goals (explicitly out of scope for v1)

- **Guest** accounts / guest login. The per-person `token` is a **capability link**, not a credential — anyone holding the URL can fill that invitee's RSVP. Admins **do** authenticate — via Google sign-in (§7).
- Editing or deleting an existing RSVP from the guest side.
- Email confirmations / notifications.
- Multi-event or plus-one-**by-name** management (a numeric `max_guests` allotment + `adults`/`kids` reply covers party size).
- Internationalization.

---

## 2. Tech stack (actual, as scaffolded)

| Concern | Choice | Version in repo |
|---|---|---|
| Framework | Next.js App Router | `next@16.2.9` |
| UI runtime | React | `react@19.2.4` |
| Styling | Tailwind CSS | `tailwindcss@^4` |
| Language | TypeScript | `^5` |
| Package manager | pnpm | `pnpm@10.12.4` |
| ORM | Drizzle ORM + Drizzle Kit | `drizzle-orm@^0.45`, `drizzle-kit@^0.31` |
| DB driver | `@neondatabase/serverless` (`drizzle-orm/neon-http`) | `^1.1.0` |
| Validation | zod | `zod@^4` |
| Auth / sessions | Custom Google OAuth 2.0 + `jose` JWT cookie | `jose@^6`, `server-only` |
| Components | shadcn/ui (base-ui, `nova` preset) | initialized — `button`, `card`, `table`, `badge`, `alert`, `separator`, `empty` |

> ⚠️ **Next.js 16 caveat (see `AGENTS.md`):** APIs and conventions differ from older training
> data. Read the relevant guide in `node_modules/next/dist/docs/` before writing framework code.
> This repo uses the **root `app/`** directory (no `src/`). The original plan's `src/...` paths
> are corrected throughout this spec to match the actual layout.

### Dependencies to add

```bash
pnpm add drizzle-orm @neondatabase/serverless zod jose server-only
pnpm add -D drizzle-kit
# shadcn components added via the shadcn skill/MCP (form, input, button, radio-group, textarea, label, card, table, badge)
```

---

## 3. Architecture

Greenfield feature — nothing to replace.

```
Browser (guest)
   │  fills RSVP form  (client component, shadcn/ui + react-hook-form + zod)
   ▼
Next.js App Router  /              (Server Component shell)
   │  form submits to ↓
Server Action  submitRsvp()         (runs on Vercel — no separate service)
   │  validate (zod)  →  insert via Drizzle
   ▼
Neon Postgres  (DATABASE_URL injected by Vercel Marketplace)
   ▲
   │  read-only
Admin dashboard  /dashboard  (Google-authenticated)  →  single-page "Manage RSVP" (guest + label CRUD) + admin users

Admin auth:  /login → Google OAuth (PKCE+state+nonce) → /api/auth/callback/google → jose session cookie
   proxy.ts  = optimistic redirect for /dashboard/*    ·    lib/dal.ts = authoritative status/role check
```

The "backend" is `submitRsvp()`, the admin read/manage queries, and the Google OAuth route handlers. No separate service, no second deploy.

---

## 4. Data model

Three feature tables (`guests`, `labels`, `guest_labels`) plus the `users` admin table, defined in
Drizzle. A Postgres enum `rsvp_status` backs `guests.status`. **This build ships the admin
management side plus the guest reply form** — the reply columns
(`status`/`adults`/`kids`/`guest_note`/`dietary`/`dietary_other`/`responded_at`) are written by the public
`?id=<token>` form (`submitRsvp`), which also lets the guest supply `email`/`phone`.

### Table: `guests` (invitees / "people")

Admin-managed. Each row is a party/household with a stable, unguessable `token` used in the
wedding-site link (`?id=<token>`) and a `max_guests` seat allotment.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `token` | `text` | **not null, unique** | Short URL-safe token → `?id=<token>` (capability link) |
| `name` | `text` | **not null** | Party / household name |
| `max_guests` | `integer` | not null, default `1` | Seat allotment (1–20) |
| `email` | `text` | nullable | Admin-only contact |
| `phone` | `text` | nullable | Admin-only contact |
| `admin_note` | `text` | nullable | Private, dashboard-only |
| `sns_accounts` | `jsonb` | not null, default `'{}'` | Admin-only social handles keyed by platform (`messenger`, `instagram`); the app builds the deep link from a fixed per-platform template (`lib/sns.ts`). Extensible — add a platform there |
| `status` | `rsvp_status` enum | not null, default `pending` | Guest reply — set by the form; admin-editable in **Edit guest** (not on create) |
| `adults` | `integer` | nullable | # adults attending — set by the form or the admin dialog |
| `kids` | `integer` | nullable | # kids attending — set by the form or the admin dialog; total (`adults` + `kids`) ≤ `max_guests` |
| `guest_note` | `text` | nullable | Guest's message — set later |
| `dietary` | `text[]` | not null, default `'{}'` | Guest's selected dietary preset keys (`lib/dietary.ts`); set by the form, cleared on a decline |
| `dietary_other` | `text` | nullable | Free-text when the guest ticks **Other**; set by the form, cleared on a decline |
| `responded_at` | `timestamptz` | nullable | Set later |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `updated_at` | `timestamptz` | not null, default `now()` | Set on write |

### Enum: `rsvp_status`

```
'pending' | 'going' | 'not_going'
```

`pending` = awaiting reply. **Fixed set — not runtime-editable.** Dashboard head-count counts rows
where `status = 'going'` (`adults` + `kids` summed for "expected guests").

### Table: `labels` (editable tags)

Admin-managed tags (e.g. "Bride's family", "College friends"), attached to guests many-to-many.
Add / rename / delete at runtime from the dashboard.

| Column | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | **not null, unique** |
| `created_at` | `timestamptz` | not null, default `now()` |

### Table: `guest_labels` (join, many-to-many)

| Column | Type | Constraints |
|---|---|---|
| `guest_id` | `uuid` | FK → `guests.id`, **on delete cascade** |
| `label_id` | `uuid` | FK → `labels.id`, **on delete cascade** |
| — | — | composite PK (`guest_id`, `label_id`) |

> No unique constraint on guest `email` — the invite `token` is the identity, and one guest = one
> editable row (future upsert). Deleting a guest or a label cascades the join rows automatically.

### Table: `users` (admin identities)

Authenticated admin users only — guests never appear here. Rows are provisioned out-of-band (directly in the DB); Google sign-in only refreshes an existing row's profile, it never creates one.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `google_sub` | `text` | **not null**, unique | Google `sub` claim — stable identity |
| `email` | `text` | **not null**, unique | From verified Google email |
| `name` | `text` | nullable | Google profile name |
| `picture` | `text` | nullable | Google avatar URL |
| `role` | `user_role` enum | not null, default `admin` | `superadmin` \| `admin` \| `viewer` |
| `status` | `user_status` enum | not null, default `pending` | `pending` \| `active` \| `disabled` |
| `created_at` | `timestamptz` | not null, default `now()` | |
| `last_login_at` | `timestamptz` | nullable | Updated each login |

### Enums (auth)

```
user_role   = 'superadmin' | 'admin' | 'viewer'
user_status = 'pending' | 'active' | 'disabled'
```

> **Exactly one superadmin.** A partial unique index `one_superadmin_idx ON users(role) WHERE role='superadmin'` guarantees at most one superadmin row can ever exist. Admins are **not** self-provisioned: sign-in only authenticates a user already present in `users` (matched by `google_sub`); an unknown Google account is denied, no row created. New admins are provisioned out-of-band via a manual DB insert. **Bootstrap exception:** while `users` is empty, the first Google account to sign in is auto-provisioned as the `superadmin` (active); this path closes the instant any row exists. No in-app recovery if that account is lost — recovery is likewise a manual DB update.

> The `comments` table (proof-of-concept) remains in the DB but is **not** managed by Drizzle — left as-is.

---

## 5. Validation / DTOs

zod schemas live in `lib/validation.ts` and are the **single source of type truth** — the admin
forms and the Server Actions both infer from them, so types are declared once.

### `guestCreateSchema` / `guestUpdateSchema` (admin create/edit)

Shared base (`guestBaseSchema`):

| Field | Rule |
|---|---|
| `name` | string, trimmed, non-empty, max 120 |
| `maxGuests` | integer, 1–20 (coerced; blank → 1) |
| `adults` | optional integer, 0–20 (coerced; blank → omitted → stored `null`) |
| `kids` | optional integer, 0–20 (coerced; blank → omitted → stored `null`) |
| `email` | optional, valid email, max 200 (blank → omitted) |
| `phone` | optional, trimmed, max 30 |
| `adminNote` | optional, trimmed, max 1000 |
| `snsAccounts` | object of platform→handle (`messenger`/`instagram`), each trimmed 1–100 chars; blank handles dropped, default `{}` |
| `labelIds` | array of uuid, default `[]` |

- **Create** (`guestCreateSchema`): **no `status` field** — a new invitee always starts `pending`.
  The admin may pre-fill the expected party count (`adults`/`kids`).
- **Edit** (`guestUpdateSchema`): extends the base with `status` (enum `pending` \| `going` \|
  `not_going`, required). Saving `not_going` zeroes `adults`/`kids` server-side (same as the
  guest form).
- **Cross-field party rules** (both schemas, via `superRefine`, reported under `partySize`):
  party size = `adults + kids`; when either count is given it must be ≤ `maxGuests`; when
  `status = 'going'` the party size must be ≥ 1. The dialog mirrors these checks live; the
  Server Action re-validates and returns them as form field errors.
- Types: `GuestCreateInput` / `GuestUpdateInput`. `rsvpStatusValues` mirrors the pg enum.
- The **Add/Edit guest dialog** is a sectioned form (Guest details / Party count·RSVP reply /
  Contact / Labels / Notes); labels are toggleable badge chips, not checkboxes. The **Contact**
  section also holds SNS handles (Messenger/Instagram usernames, prefixed-input, admin enters the
  handle only). On the board card, **Contact** and **Notes** share one boxed section template;
  Notes render as two tinted boxes (guest note / admin note), and Contact shows email, phone, and
  clickable SNS icon-links (open the profile/chat in a new tab).

### `labelInputSchema` (add/rename tag)

| Field | Rule |
|---|---|
| `name` | string, trimmed, non-empty, max 40 |

### id schemas

`guestIdSchema` / `labelIdSchema` / `userIdSchema` = `z.string().uuid()`.

### Read model

Drizzle-inferred types (`Guest`, `Label`, `GuestLabel` = `typeof …$inferSelect`) power the dashboard
list, which uses the relations query (`db.query.guests.findMany` with `guestLabels.label`). The
guest **response** DTO (attendance-form input) is deferred with the form.

---

## 6. File plan (paths match the real root `app/` layout)

### New files

| File | Purpose |
|---|---|
| `docs/rsvp-spec.md` | **This document** — the reference spec (create first). |
| `.env.example` | Documents required env vars (see §8). |
| `drizzle.config.ts` | Drizzle Kit config pointing at `DATABASE_URL`. |
| `db/schema.ts` | `users` + `rsvps` tables, enums, partial superadmin index (`comments` left unmanaged). |
| `db/index.ts` | Neon + Drizzle client (singleton). |
| `lib/validation.ts` | zod schemas / DTOs (§5). `rsvpResponseSchema` includes `dietary` (array of `lib/dietary.ts` keys) + optional `dietaryOther`. |
| `lib/dietary.ts` | Allergy presets (keys + labels; the older diet keys are kept in `RETIRED_LABELS` for display only) shared by the form, `rsvpResponseSchema`, the dashboard card, and the CSV export, plus `dietaryList()` for display. |
| `app/actions/submit-rsvp.ts` + `app/actions/rsvp-logic.ts` | The `submitRsvp` Server Action and its pure FormData parsing / party-validation boundary. The action owns authorization, persistence, and cache invalidation; the logic module is regression-tested without a database. |
| `lib/action-state.ts` | Shared `ActionState`, successful-state constant, and zod field-error mapping used by RSVP and admin Server Actions. |
| `app/page.tsx` | Invitation entry page. Renders `<LaceBackdrop />` and `<EnvelopeInvitation href={…} />`, preserving an incoming `?id=<token>` in the RSVP URL it builds. |
| `components/invitation/envelope-invitation.tsx` | Client component owning the invitation stage — senders' line, tappable envelope, hint — and the handoff into `/rsvp`. A real `next/link` anchor (modified clicks and open-in-new-tab still work) whose click sets `data-opening` on the stage, then pushes after `OPEN_BEAT_MS` (460ms) so the envelope visibly lifts and dissolves before the route changes; a second timer restores the invitation after `OPEN_RESET_MS` (6s) if the push never lands, since the envelope animates to `opacity: 0`. `prefers-reduced-motion` is read in the event handler (not a hook, which would have to guess during SSR) and skips the beat entirely, letting the anchor navigate. Uses Next's **default** prefetch, deliberately not `prefetch={true}` — the default fetches the CDN-cacheable prerendered shell (`s-maxage=31536000`), while a forced prefetch fetches the 55.7 KB `private, no-cache` navigation payload and runs `getGuestByToken` for every visitor who merely loads `/`. All four envelope layers are `loading="eager"`: the envelope is the above-the-fold subject and the lace collar was measuring as the page's LCP. CSS under “Invitation to letter handoff” in `globals.css`. |
| `app/rsvp/page.tsx` | Guest letter / RSVP page shell. Renders `<WeddingLetter searchParams={…} />` and the floating `<VinylPlayer />`; forwards the `searchParams` promise carrying `?id=<token>` to the letter. |
| `components/letter/rsvp-form.tsx` (+ `rsvp-form/` subcomponents and `rsvp-form/form-state.ts`) | Client RSVP form composed with shadcn `Field`/`FieldSet`/`FieldGroup`/`FieldError`, `Input`, `Textarea`, and `Spinner`; pure companion, capacity, missing-field, and fallback-summary calculations live in the tested `form-state.ts`. Adults/kids are −/+ steppers — the whole **“Who is coming?”** section is hidden when `maxGuests === 1` (nothing to count: the invitee is adult 1 and no one else fits), and `adults`/`kids` post as hidden inputs (`1`/`0`) so the action reads a one-seat reply like any other; the dietary hint drops its “anyone you bring below” clause in that case. An allergies fieldset (preset checkboxes + **Other** → text) posts `dietary`/`dietaryOther`. Attendance radios and allergy checkboxes intentionally remain native inputs: the Base UI controlled checkbox interaction previously scrolled the page inside the envelope reveal. |
| `components/letter/lace-backdrop.tsx` | The drapery artwork (`lace-bg.png`) and its neutral 30% scrim, absolutely positioned into whatever `relative` container it is given. Shared by `app/page.tsx` and the loading screen so the backdrop is provably identical across the handoff; `opening-backdrop.tsx` still paints its own copy because its image is scroll-scaled inside a `motion` layer and its scrim lives in the sticky viewport — change the scrim in one and change it in the other. |
| `components/letter/loading-screen.tsx` | The public site's loading screen, shared by `app/loading.tsx` (“Getting your letter”) and `app/rsvp/loading.tsx` (“Opening your letter”). Stands on `LaceBackdrop` and carries the same white monogram the hero holds inside its lace frame, so the background never changes across the journey. Indeterminate progress bar (a light sweeping a 2px track) rather than a spinner or a fake percentage; `role="status"` sits on the caption so assistive tech gets the words, not the shape. Names are a `<p>`, not an `<h1>` — a Suspense fallback should not inject a heading into the outline. CSS-only animation, since this screen usually stands in for JS that has not arrived yet. |
| `components/letter/wedding-letter.tsx` | Server component composing the guest letter sections from `components/letter/*`, including the closing `Rsvp` section. It accepts and forwards `searchParams` to `Rsvp`. Couple names/date come from `lib/wedding.ts`. |
| `components/letter/rsvp.tsx` | Server component: the **RSVP** section, rendered OUTSIDE the envelope reveal (normal flow, below the letter — the reveal's percentage-based rise transform would jump the letter on the form's conditional-field height changes). The supplied floral painting at `/rsvp-bg.png` fills the RSVP ground without an overlay; its white dome, heading, envelope, and deadline copy remain in the foreground. The section deliberately does **not** clip overflow so the envelope can stick against the viewport. `RsvpEnvelope` keeps the upright card in ordinary document flow, while separate non-interactive sticky back/lining/lace (`z-10`) and front (`z-30`) layers, tilted 5° clockwise with the lace shifted 10px right, let the card (`z-20`) pass through the pocket as the guest scrolls. The envelope canvas remains exactly 100px wider than the card. A 30svh sticky runway lets the Send button just clear the pocket rather than allowing the full card to scroll away; no Motion transforms, measured height, or `ResizeObserver` are used, so reduced-motion has the same static layout. Awaits the forwarded `searchParams` to read `?id=<token>` inside its own `<Suspense>` (dynamic body; striped shell + card frame prerender). Three states: `RsvpForm` (pending), a thank-you (already answered), or a “reply by your personal link” note (no/unknown token). |
| `lib/wedding.ts` | Single source for the couple's names + wedding date (placeholders for now) — imported by the dashboard header, the countdown, and the wedding letter. |
| `components/letter/envelope-reveal.tsx` | Client scroll-driven envelope→letter reveal (pinned; see status note). Wine-red CSS envelope, landscape, fluid width `min(92vw, 140dvh)`, **four flaps meeting at the centre** (no seal, sharp corners). Starts centred, then **sinks** by `--env-drop` (half visible; quarter on ≥1024px) while the **top flap rotates open** (`rotateX`; z-index swapped so it stays visible behind the letter); the front flaps (`.env-front` bottom + `.env-face-*` sides, z-index 12) tuck the letter's base. Letter = page content, base-anchored in `.letter-clip` (overflow-hidden); content column = 80% of the letter on `sm+`, with a `24dvh` bottom tuck allowance. Motion: CSS scroll-driven keyframes on the compositor where supported, else eased `--pf`/`--pd`/`--pl` via rAF scroll listener; `.env-cue`; `prefers-reduced-motion` shows the letter statically. CSS in `globals.css` under "Envelope reveal". |
| `lib/session.ts` | Pure `jose` encrypt/decrypt + cookie name/age (safe to import in `proxy.ts`). |
| `lib/oauth.ts` | Google OAuth: PKCE/state/nonce, token exchange, id_token verify (JWKS). |
| `lib/users.ts` | `updateUserOnLogin` — refresh an existing admin on login; returns `null` for unknown accounts, except it bootstraps the first-ever sign-in as `superadmin` while `users` is empty. |
| `lib/dal.ts` | `getCurrentUser` / `requireUser` / `requireSuperadmin` (React `cache()` per request; user row via `lib/data.ts` `getUserById`, cached cross-request under tag `user:<id>`). |
| `lib/data.ts` | Cached query layer — `'use cache'` functions (`getGuestsWithLabels`, `getAllLabels`, `getUsers`, `getUserById`, `getGuestByToken`) tagged for precise invalidation (see Caching section). |
| `proxy.ts` | Optimistic redirect for `/dashboard/*` (replaces `middleware.ts`). |
| `app/api/auth/google/route.ts` | Initiate OAuth (GET → redirect to Google). |
| `app/api/auth/callback/google/route.ts` | OAuth callback: verify, authenticate existing user, gate, session. |
| `app/api/auth/logout/route.ts` | POST → clear session cookie + leftover OAuth txn cookies. |
| `app/login/page.tsx` | "Continue with Google" + pending/error messaging; redirects already-signed-in active admins to `/dashboard`. |
| `app/(protected)/layout.tsx` | Sidebar-less shell — centered `max-w-[1300px]` container on the wisteria bg (page-corner floral sprays sit in their own `absolute inset-0 overflow-hidden` layer so their bleed clips without cutting page chrome; horizontal scroll guarded on `<body>`); top-right `AccountMenu`. |
| `app/(protected)/dashboard/page.tsx` | Single-page **“Manage RSVP”** — stat cards (Attending/Declined/Awaiting/Invited) + guest table + inline CRUD, per the imported design. |
| `app/(protected)/dashboard/guests-board.tsx` (+ `board/` subcomponents and `board/board-data.ts`) | Client kanban board (imported design): 3 drag-and-drop status columns on `md+` (HTML5 dnd, `useOptimistic` status flip → `moveGuestStatus`), status tab pills + card list on phones; search + label-filter dropdown; per-column “Show more” (20 at a time). Filtering, grouping, and progress calculations live in the tested pure data module. Column tints/inks remain hardcoded from the frozen design (like the floral art). |
| `app/(protected)/dashboard/export-guests-button.tsx` + `dashboard/guest-csv.ts` | Client CSV download backed by a tested pure serializer of the full guest list (includes dietary and companion data). |
| `app/(protected)/dashboard/guests/actions.ts` | Guest + label Server Actions (create/update/delete, plus `moveGuestStatus` for kanban drags); invalidate via `updateTag('guests'/'labels')`. |
| `app/(protected)/dashboard/guests/{guest-dialog,guest-form,labels-manager,delete-guest-button,copy-link-button}.tsx` | Client CRUD UI composed with shadcn dialog, `Field`, `InputGroup`, Select, badge label-chips, Spinner, and alert-dialog; tested guest-form normalization / party-state logic is isolated in `guest-form.ts`. |
| `components/dashboard/account-menu.tsx` | Header account chip + dropdown (shadcn `DropdownMenu`) — hosts label management (`LabelsManager`, hidden for `viewer`), the superadmin Users link, and sign out (replaces the sidebar nav). |
| `components/dashboard/florals.tsx` | Decorative floral SVG art (server component) from the hi-fi design — exported flourishes (`PageFloralTopLeft/BottomRight`, `NameSprig`, `AccountSprigTopLeft/BottomRight`, `CardSprayTopRight/BottomLeft`) rendered by `(protected)/layout.tsx` (page corners) and `dashboard/page.tsx` (name/account/card). Built from `Blossom` + `Leaf` primitives; `aria-hidden`, `pointer-events-none`, art colors hardcoded to match design. |
| `lib/guest-token.ts` | Short unguessable invite-token generator (crypto). |
| `app/(protected)/dashboard/users/page.tsx` | User management (superadmin only). |
| `app/(protected)/dashboard/users/actions.ts` | activate/deactivate Server Actions. |
| `components/ui/*` | shadcn Base UI components installed through the CLI (including `Field`, `InputGroup`, `Spinner`, `DropdownMenu`, `Progress`, and `ToggleGroup`). Application forms compose these primitives rather than duplicating control shells. |

> **Removed with the single-page redesign:** `app/(protected)/dashboard/guests/page.tsx` (folded into `/dashboard`; the `guests/` folder now holds only the reused client components + `actions.ts`), `components/app-sidebar.tsx`, and the now-unused `components/ui/{sidebar,sheet}.tsx` + `hooks/use-mobile.ts`. **Removed with the kanban redesign:** `app/(protected)/dashboard/guests-table.tsx` (table + stat cards folded into `guests-board.tsx`).
> **Folder convention (2026-07-27 restructure):** guest-letter components live under `components/letter/` (incl. `wedding-letter.tsx`, `rsvp-form.tsx`, the public-only `motion-provider.tsx`, and the retired `envelope-reveal.tsx` / in-band `vinyl-player.tsx`); invitation-entry components under `components/invitation/` (`envelope-invitation.tsx` — `/` only); dashboard-only components under `components/dashboard/` (`account-menu.tsx`, `florals.tsx`, `sns-icon.tsx`); components shared by both surfaces stay at the `components/` root (`countdown.tsx`); shadcn primitives in `components/ui/`. `lace-backdrop.tsx` and `loading-screen.tsx` sit in `components/letter/` despite being used by `/` too, because both exist to make the invitation and the letter read as one scene. Shared letter voice primitives: `components/letter/{section-heading.tsx,letter-button.ts,letter-type.ts}` (script h2 + sans kicker; the one letter button; tracked micro-caps field label). The unused root provider and `components/reveal.tsx` helper were deleted.
| `drizzle/` | Generated migration output (Drizzle Kit). |

### Files to update

| File | Change |
|---|---|
| `README.md` | Setup, env, deploy, and "view responses at `/admin`" section. |
| `package.json` | Add deps (§2) + `db:generate` / `db:migrate` scripts. |
| `app/layout.tsx` | Metadata / fonts for the wedding site (as needed). |

### Files to delete

None.

---

## 7. Server Action & admin auth contracts

> **Role gates:** three roles (`superadmin` / `admin` / `viewer`) with a full capability
> matrix and enforcement layers are specified in **[docs/roles-and-permissions.md](roles-and-permissions.md)**.
> Guest/label actions gate on `requireEditor()`; user management on `requireSuperadmin()`.


### `submitRsvp(input)` — `app/actions/submit-rsvp.ts`

- Directive `"use server"`.
- Input: `RsvpInput` (from FormData or a typed object), re-validated server-side with
  `rsvpInputSchema` — **never trust the client**.
- On success: insert one row via Drizzle, `updateTag('guests')` (refreshes the admin dashboard and the token's cached lookup), return `{ ok: true }`.
- On validation failure: return `{ ok: false, errors }` (field-level) — do not throw for expected
  user error; the form renders the messages.
- JSDoc the action (per §10 conventions).

### `moveGuestStatus(guestId, status)` — kanban drag

- `requireEditor()`; validates the id + `rsvp_status` value.
- Sets `status` only: `not_going` zeroes `adults`/`kids` (same as the forms); `pending` clears
  `respondedAt`; first move into `going`/`not_going` stamps `respondedAt`. Party counts are
  otherwise untouched — the edit dialog owns them, so a card dragged to Attending may show the
  allotment (`×maxGuests`) until counts are filled in.
- `updateTag('guests')`; returns the shared `ActionState`.

### Admin gate — `/dashboard` (Google OAuth)

Admins sign in with Google. There is **no shared password**, and **no self-sign-up**. Access model:

- Sign-in only authenticates a user that **already exists** in `users` (matched by Google `sub`).
  An unknown Google account is **denied** (`/login?error=denied`) — no row is created.
- New admins are provisioned **out-of-band** via a manual DB insert; the sole exception is the
  **bootstrap** — the first Google sign-in while `users` is empty becomes the `superadmin`. New admins — including any later `superadmin` — are otherwise provisioned via a manual DB
  insert. Exactly one superadmin, DB-enforced (`one_superadmin_idx`). No role-change UI.
- A pre-existing `pending` admin still can't access the dashboard until the superadmin
  **activates** them from `/dashboard/users`.

Flow:

1. `/login` first runs the authoritative `getCurrentUser()`: a signed-in **active** admin is
   redirected to `/dashboard` (disabled/deleted → `null` → page renders — no redirect loop; the
   proxy is deliberately *not* used for this, an optimistic cookie check would loop). Otherwise it
   shows "Continue with Google" (plain `<a>` to `/api/auth/google`, never prefetched).
2. `app/api/auth/google/route.ts` generates `state` + `nonce` + PKCE `code_verifier`/`code_challenge`,
   stores them in short-lived `httpOnly` cookies, and redirects to Google.
3. `app/api/auth/callback/google/route.ts` verifies `state` (CSRF), exchanges the code (with the
   PKCE verifier + client secret), verifies the `id_token` against Google's JWKS via `jose`
   (`iss`/`aud`/`exp`/`nonce`/`email_verified`), then `updateUserOnLogin` refreshes the matching
   user's profile (returns `null` when no user matches the Google `sub`).
4. **Gate:** unknown account (`null`) → redirect to `/login?error=denied`; a matched but non-`active`
   user → `/login?pending=1`; both with **no session issued**. If `active` → set an `httpOnly`,
   `secure` (prod), `sameSite=lax`, 7-day `jose` JWT cookie (payload = `{ userId }` only) and
   redirect to `/dashboard`.
5. `proxy.ts` does an **optimistic** cookie check on `/dashboard/*` (matcher covers `/dashboard`
   itself and everything below — all protected pages live there); `lib/dal.ts` does the
   **authoritative** check on every page/action (reads the user via the tag-cached `getUserById`,
   enforces `status === 'active'`, loads `role`). Activate/deactivate and the login callback
   invalidate `user:<id>`, so deactivation still takes effect immediately.
6. User-management Server Actions (`activateUser`/`deactivateUser`) require `requireSuperadmin()`
   and forbid self-modification / disabling a superadmin (lockout prevention).
7. Logout: POST `/api/auth/logout` clears the session cookie **and** any leftover OAuth txn
   cookies (`oauth_state`/`oauth_nonce`/`oauth_verifier`) from abandoned sign-ins, 303 → `/login`.

> Secrets (`GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) only via env — never hardcoded, committed,
> logged, or in URLs. `sameSite=lax` is required so the cookie survives the Google redirect.

## 7b. Caching (Cache Components)

`next.config.ts` sets `cacheComponents: true` (Next 16 PPR). All DB reads go through the
`'use cache'` functions in `lib/data.ts`; pages never query Drizzle directly. Unchanged data is
served from cache; every write invalidates its tags (`updateTag` in Server Actions for
read-your-writes, `revalidateTag` in route handlers).

| Tag | Covers | Invalidated by |
|---|---|---|
| `guests` | guest rows + label joins + token lookups (`getGuestsWithLabels`, `getGuestByToken`) | guest CRUD, label rename/delete, `submitRsvp` |
| `labels` | `getAllLabels` (+ `getGuestsWithLabels`) | `createLabel` / `renameLabel` / `deleteLabel` |
| `users` | `getUsers` | `activateUser` / `deactivateUser`, login callback profile refresh |
| `user:<id>` | `getUserById` (DAL auth lookup) | `activateUser` / `deactivateUser`, login callback |

`cacheLife`: guest/label/user lists `'days'` (tags do the real work), `getGuestByToken` `'hours'`,
`getUserById` `'minutes'` — the short TTL is the safety net for **out-of-band SQL edits** (e.g.
provisioning or disabling an admin directly in the DB), which bypass tag invalidation; such a
change can take up to ~a minute to bite. Dynamic routes keep Suspense fallbacks (`loading.tsx` for
`/dashboard`, `/dashboard/users`, `/login`, `/rsvp`, and the landing page) as cacheComponents
requires. The public two (`app/loading.tsx`, `app/rsvp/loading.tsx`) both render
`<LetterLoadingScreen />` and carry **no** `viewport` export — Next reads that only from `layout`
and `page`, and each route's `page.tsx` already declares the full-bleed viewport they render into.

### 7b.1 Static assets and fonts (HTTP cache)

The guest-facing site is almost entirely artwork, so the asset layer is where the caching actually
pays. Two mechanisms are in play and they must not fight each other:

| Layer | Serves | `Cache-Control` | Owner |
|---|---|---|---|
| `/_next/static/**` | JS, CSS, `next/font` woff2, **statically imported** images | `public, max-age=31536000, immutable` | Next.js (content-hashed — never override) |
| `/_next/image?url=<static import>` | optimized variants of hashed sources | `public, max-age=315360000, immutable` | Next.js |
| `/_next/image?url=/<public path>` | optimized variants of `/public` sources | `public, max-age=2592000, must-revalidate` | derived from the `/public` header below, floored by `images.minimumCacheTTL` |
| `/public/**` (string `src`) | artwork referenced by literal path | `public, max-age=2592000, stale-while-revalidate=86400` | `headers()` in `next.config.ts` |

**Fonts need no configuration.** `app/layout.tsx` loads Montserrat + Parisienne through
`next/font/google`, which self-hosts them under `/_next/static/media/` (content-hashed, `immutable`,
no request to Google) and emits React preload hints for both faces in the streamed RSC payload.

**The `headers()` trap.** A custom header *replaces* the one Next.js sets. An extension rule written
as `/:file(.*).png` also matches `/_next/static/media/lace.<hash>.png`, which downgrades the
content-hashed assets from `immutable` to the 30-day `/public` policy — the assets safest to cache
forever end up with the weakest policy. This shipped once and is invisible unless you inspect live
response headers. Every extension rule therefore uses `[^/]+` to stay inside one path segment, and
`next.config.test.ts` fails the build if a rule reintroduces `(.*)` or mentions `_next`.

**30 days, not a year + `immutable`,** because `/public` art is still replaced in place; when you
swap a file, bump a `?v=` on the reference (`components/letter/our-story.tsx` does this for the lace
mask). Statically imported images are hashed and need no bump — prefer a static import for any new
artwork whose path is a literal, and the whole ritual disappears.

**Not cached:** the public route HTML. Both `/` and `/rsvp` are `◐` Partial Prerender routes: `/`
awaits `searchParams` to carry an incoming `?id=<token>` into its invitation link, while `/rsvp`
forwards the token to the RSVP section. Their request-time responses stream and Next sends `private,
no-cache, no-store`. The prerendered shell still comes from the build (`x-nextjs-prerender: 1`) and
Vercel resumes it at the edge, but the HTML itself is never CDN-cacheable. Making it so would mean
moving the token read out of the server render, which is a deliberate non-goal here (§ public routes
in the file plan).

To verify any of this, `next build && next start` and read the real headers — `next dev` sends
`no-store` on everything. `.claude/launch.json` carries a `prj-ww prod` entry for exactly this.

---

## 8. Environment variables

| Var | Required | Where set | Purpose |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Vercel (Neon Marketplace) + local `.env` | Neon Postgres connection string. |
| `APP_URL` | ✅ | Vercel env + local `.env` | Base URL; builds the OAuth redirect URI. Dev: `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` | ✅ | Vercel env + local `.env` | Google OAuth 2.0 Web client id. |
| `GOOGLE_CLIENT_SECRET` | ✅ | Vercel env + local `.env` | Google OAuth client secret (user-supplied). |
| `SESSION_SECRET` | ✅ | Vercel env + local `.env` | 32+ random bytes; signs the session JWT (`openssl rand -base64 32`). |

`.env.example` documents these with placeholder values. The real `.env` is git-ignored.
Google Cloud: Web OAuth client, redirect URI `${APP_URL}/api/auth/callback/google`, scopes `openid email profile`.

---

## 9. Build sequence

1. **Read context first.** Skim `AGENTS.md` and the relevant `node_modules/next/dist/docs/`
   guides (Server Actions, App Router, forms) — Next 16 differs from older conventions.
2. Add dependencies (§2) and `db:generate` / `db:migrate` scripts.
3. Wire Drizzle + Neon client (`db/index.ts`); define `db/schema.ts`; generate & run the
   initial migration.
4. Write `lib/validation.ts` (DTOs), then `submitRsvp` in `app/actions/submit-rsvp.ts`.
5. Build the RSVP form (`components/letter/rsvp-form.tsx`) and the guest letter route `app/rsvp/page.tsx`;
   connect form → action. **Done** — `submitRsvp` looks up the invitee by `token`,
   rejects unknown/already-answered replies, bounds `adults + kids` to `maxGuests`,
   and writes `status`/`adults`/`kids`/`guestNote`/`dietary`/`dietaryOther`/`respondedAt`, plus optional
   guest-supplied `email`/`phone` (only overwritten when provided). Dietary is cleared on a decline.
   (Migration `drizzle/0005_*` adds the `dietary`/`dietary_other` columns.)
6. Add Google auth: `users` schema + migration, `lib/{session,oauth,users,dal}.ts`, the
   `app/api/auth/*` route handlers, `proxy.ts`, and the `(protected)/dashboard` pages + user-mgmt
   actions (§7). The guest RSVP form (§7 `submitRsvp` + `components/letter/rsvp-form.tsx`) is **built** (design deferred).
7. Document: JSDoc on the action + schema, README setup/deploy section (§10).
8. **Hand off for review — do not commit.** All changes reviewed before any commit.

---

## 10. Conventions

- **Types are inferred once** from zod (`lib/validation.ts`) and Drizzle (`db/schema.ts`).
  No hand-duplicated shapes.
- **JSDoc** the Server Action and the schema (what it does, input/output, failure modes).
- **Secrets** only via env vars — never hardcoded, never committed, never logged, never in URLs.
- **shadcn first:** pull real component source via the shadcn skill/MCP rather than hand-rolling
  form/input/button/radio-group/textarea.
- Keep the guest form a **client component**; keep pages **Server Components** where possible.
- React 19: no `forwardRef` needed; follow the vercel-composition / react-best-practices skills.

---

## 11. Skills & tools to use

| Skill / tool | Use for |
|---|---|
| `fe-nextjs-developer` (primary) | App Router, Server Actions, Server Components, project structure. |
| `next-best-practices` / `next-cache-components` | Next 16 file conventions, RSC boundaries, caching. |
| `shadcn` skill + Shadcn UI MCP | Pull real component source (form, input, button, radio-group, textarea). |
| `typescript-pro` | Strict typing across DTOs, action I/O, Drizzle inference. |
| `be-nestjs-developer` | **Only** for its Drizzle schema conventions & doc guidelines — no NestJS is used. |
| `vercel-react-best-practices` / `vercel-composition-patterns` | React 19 patterns, performance. |

No MCP connectors (Gmail, Slack, Figma) needed. Neon connects through Vercel's Marketplace
integration, not a Claude MCP. `docx`/`pdf` skills considered and excluded.

---

## 12. Locked-in decisions

- **Invite-only.** The couple pre-registers invitees; each gets an unguessable `token` used as
  `?id=<token>`. No open/anonymous form.
- **Guest fields:** name, `max_guests` allotment, optional email/phone, optional `admin_note`, plus
  editable **labels** (tags, many-to-many). The guest reply form also collects optional
  `email`/`phone` (overwrites admin contact only when supplied) and **allergies**
  (`lib/dietary.ts` preset checkboxes + free-text Other; column names stay `dietary`/`dietary_other`). Reply stored as `status` + `adults` + `kids` +
  `guest_note` + `dietary` + `dietary_other`.
- **Status:** fixed enum `pending | going | not_going` (default `pending`). Not runtime-editable.
- **Labels:** admin-editable tag set (add / rename / delete), many per guest.
- **One editable reply per guest** (future upsert). No `email` uniqueness.
- **Admin access:** any **active** admin manages guests + labels (`requireUser`). Google-authenticated
  `/dashboard`. **No self-sign-up** (except the empty-table bootstrap that seeds the first superadmin) — admins are otherwise provisioned via manual
  DB insert; sign-in only authenticates existing users, and unknown accounts are denied. Exactly one
  superadmin, DB-enforced.
- **Build order:** management side first (this build); the guest-facing RSVP form is deferred (§13).

---

## 13. Open questions (resolve before/at build time)

- **Per-companion dietary data — BUILT end to end.** Everyone in a party except the invitee
  (who is adult 1) gets a card in the guest form asking their **name** (required) and their
  **own** restrictions, because `guests.dietary` could only ever describe the invitee. Fields
  post as `companion.<kind>-<n>.{name,dietary,dietaryOther}` (`adult-2`…`adult-N` /
  `kid-1`…`kid-M`); `collectCompanions` + `companionsSchema` (`lib/validation.ts`) validate
  them — the name is required **server-side**, not just by the browser — and `submitRsvp`
  upserts `companions` rows on `(guest_id, kind, position)` before flipping the guest off
  `pending` (migration `drizzle/0006_lucky_landau.sql`, applied). The party must add up: one
  named companion per seat beyond the invitee, or the whole reply is rejected rather than
  half-recorded. Surfaced on the dashboard card ("Also coming") and in the CSV export
  ("Also coming" column), and read back to the guest by `components/letter/rsvp-reply.tsx`,
  which the form also renders on success so "just sent" and "already answered" cannot drift.
  Still open: the admin guest dialog cannot edit or delete companion rows (only the guest form
  writes them), and a guest cannot amend a sent reply — both are couple-side fixes for now.
- Spam/abuse protection on the public form (honeypot field or lightweight rate-limit)? — optional, decide at build.
- Should the same email submitting twice be allowed, de-duped, or upserted? — currently allowed (§4).
- Admin cookie lifetime (session vs N days)?
