# Codebase Standards Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the full wedding RSVP repository to current installed Next.js, shadcn Base UI, and Tailwind v4 conventions while preserving behavior and visual output and adding durable automated tests.

**Architecture:** Keep routes and public feature entry points stable. Extract pure feature logic from Client Components and Server Actions, correct application-level shadcn/Tailwind composition, and split only mixed-responsibility large modules. Preserve Server Component, Cache Components, authorization, database, and cache-tag boundaries.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, Tailwind CSS v4, shadcn `base-nova` on Base UI, Vitest, jsdom, React Testing Library, pnpm.

## Global Constraints

- Preserve all routes, user-visible behavior, data contracts, database schema, authorization rules, cache tags, and Cache Components/PPR behavior.
- Preserve the public letter's locked palette, typography, spacing, section order, motion, and responsive behavior from `PRODUCT.md`.
- Preserve `/dashboard` and `/login` visuals.
- Prefer defined Tailwind values; retain arbitrary values only for required geometry, animation math, fluid roles, safe areas, or locked artwork measurements.
- Keep the RSVP form's native radios and checkboxes because `docs/rsvp-spec.md` records their scroll-behavior rationale.
- Do not upgrade production dependencies or add database migrations.
- Keep `docs/rsvp-spec.md` synchronized with changed RSVP file responsibilities and implementation descriptions.

---

## File Structure

### Test infrastructure

- Create `vitest.config.ts` for jsdom, alias resolution, setup files, and test matching.
- Create `tests/setup.ts` for `@testing-library/jest-dom/vitest` and cleanup.
- Modify `package.json` and `pnpm-lock.yaml` for test scripts and development dependencies.

### Pure shared and feature logic

- Create `lib/action-state.ts` for the shared action-state type and first-error-per-field Zod formatter.
- Create `components/letter/rsvp-form/form-state.ts` for companions, missing fields, capacity messages, and fallback summaries.
- Create `app/actions/rsvp-logic.ts` for RSVP FormData parsing and party validation/normalization.
- Create `app/(protected)/dashboard/guests/guest-form.ts` for admin FormData parsing and party calculations.
- Create `app/(protected)/dashboard/board/board-data.ts` for filtering, grouping, and response progress.
- Create `app/(protected)/dashboard/guest-csv.ts` for CSV serialization.

### UI standards

- Add `components/ui/field.tsx`, `components/ui/input-group.tsx`, and `components/ui/spinner.tsx` with the shadcn CLI.
- Refactor RSVP/admin forms to use Field composition without altering layout.
- Refactor Select and DropdownMenu call sites to use required groups.
- Replace application `space-y-*` stacks with flex/grid `gap-*` and prefer defined Tailwind values.

### Large module decomposition

- Create `components/letter/our-story/types.ts`, `memories.ts`, `vine-geometry.ts`, `vine-florals.tsx`, and `decorations.tsx`.
- Keep `components/letter/our-story.tsx` as the stable `OurStory` presentation entry point.

### Next.js surfaces and documentation

- Add route metadata for public/admin surfaces without changing routes.
- Add accessible `error.tsx` boundaries for public and protected surfaces.
- Replace optimizable raw images with `next/image`.
- Update `README.md` and `docs/rsvp-spec.md` for tests and new file responsibilities.

---

### Task 1: Establish the test runner and characterize existing pure utilities

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `lib/dietary.test.ts`
- Create: `lib/companions.test.ts`
- Create: `lib/validation.test.ts`
- Create: `app/(protected)/dashboard/board/headcount.test.ts`
- Create: `lib/dal.test.ts`

**Interfaces:**
- Consumes: existing exports from `lib/dietary.ts`, `lib/companions.ts`, `lib/validation.ts`, board `headcount.ts`, and pure capability helpers from `lib/dal.ts`.
- Produces: `pnpm test`, `pnpm test:watch`, and a reusable jsdom test environment.

- [ ] **Step 1: Add test dependencies and scripts**

Run:

```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts` with jsdom, `tests/setup.ts`, `@` mapped to the repository root, CSS enabled, and `**/*.test.{ts,tsx}` matching.

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

- [ ] **Step 3: Write characterization tests**

Cover exact current behaviors, including:

```ts
expect(dietaryList(["shellfish", "vegan"], "  No pork  ")).toEqual([
  "Shellfish",
  "Vegan",
  "No pork",
]);
expect(partyBreakdown(2, 1)).toBe("2 adults · 1 kid");
expect(canEdit("viewer")).toBe(false);
```

Build a `FormData` fixture proving `collectCompanions` sorts adults before kids and preserves repeated dietary fields. Test create/update schema blank normalization, capacity errors, and going-party minimums.

- [ ] **Step 4: Run the tests**

Run: `pnpm test`

Expected: all characterization tests pass because they lock existing behavior before extraction.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/setup.ts lib/*.test.ts 'app/(protected)/dashboard/board/headcount.test.ts'
git commit -m "test: add regression test foundation"
```

---

### Task 2: Extract shared action and RSVP business logic test-first

**Files:**
- Create: `lib/action-state.test.ts`
- Create: `lib/action-state.ts`
- Create: `app/actions/rsvp-logic.test.ts`
- Create: `app/actions/rsvp-logic.ts`
- Modify: `app/actions/submit-rsvp.ts`
- Modify: `app/(protected)/dashboard/guests/actions.ts`

**Interfaces:**
- Produces: `ActionState`, `OK_ACTION_STATE`, and `toFieldErrors(error: z.ZodError): ActionState` from `lib/action-state.ts`.
- Produces: `parseRsvpFormData(formData: FormData)`, `validateRsvpParty(input, companions, maxGuests)`, and an RSVP persistence payload from `app/actions/rsvp-logic.ts`.
- Preserves: `submitRsvp(_prev, formData): Promise<RsvpState>` and all existing user-facing messages.

- [ ] **Step 1: Write failing shared action-state tests**

Assert that multiple Zod issues for one field keep the first message and a pathless issue maps to `form`.

Run: `pnpm test lib/action-state.test.ts`

Expected: FAIL because `lib/action-state.ts` does not exist.

- [ ] **Step 2: Implement the shared action state**

```ts
export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const OK_ACTION_STATE: ActionState = { ok: true };
export function toFieldErrors(error: z.ZodError): ActionState { /* first issue per field */ }
```

Run: `pnpm test lib/action-state.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing RSVP logic tests**

Cover:

- invalid schema fields return field errors;
- going without adults returns `How many adults are attending?`;
- party over capacity returns the existing seat message;
- companion kind/count mismatches return the existing party-name message;
- a decline normalizes counts to `null`, dietary to `[]`, and companions to `[]`;
- a valid going reply returns the exact persistence payload.

Run: `pnpm test app/actions/rsvp-logic.test.ts`

Expected: FAIL because `rsvp-logic.ts` does not exist.

- [ ] **Step 4: Implement pure RSVP parsing and validation**

Move only pure parsing and validation from `submit-rsvp.ts`. Keep Drizzle selects/inserts/updates and `updateTag` in the Server Action.

Run: `pnpm test app/actions/rsvp-logic.test.ts`

Expected: PASS.

- [ ] **Step 5: Refactor both Server Action modules**

Import the shared action state and pure RSVP helpers. Remove duplicated error mapping and inline party calculations. Preserve authorization, query order, write order, cache invalidation, and return contracts.

Run: `pnpm test && pnpm lint`

Expected: zero failures and zero new warnings.

- [ ] **Step 6: Commit**

```bash
git add lib/action-state.ts lib/action-state.test.ts app/actions/rsvp-logic.ts app/actions/rsvp-logic.test.ts app/actions/submit-rsvp.ts 'app/(protected)/dashboard/guests/actions.ts'
git commit -m "refactor: isolate server action validation"
```

---

### Task 3: Extract dashboard data and CSV behavior test-first

**Files:**
- Create: `app/(protected)/dashboard/board/board-data.test.ts`
- Create: `app/(protected)/dashboard/board/board-data.ts`
- Create: `app/(protected)/dashboard/guest-csv.test.ts`
- Create: `app/(protected)/dashboard/guest-csv.ts`
- Modify: `app/(protected)/dashboard/guests-board.tsx`
- Modify: `app/(protected)/dashboard/export-guests-button.tsx`

**Interfaces:**
- Produces: `filterGuests(rows, query, selection)`, `groupGuestsByStatus(rows)`, and `responseProgress(rows)`.
- Produces: `serializeGuestCsv(rows, baseUrl): string` and `GUEST_CSV_FILENAME`.
- Preserves: current board filtering rules and downloaded UTF-8 BOM CSV shape.

- [ ] **Step 1: Write failing board-data tests**

Use a complete `GuestRow` fixture and assert case-insensitive matching across name, email, phone, and label; any selected label matches; grouping returns all three status arrays; zero rows returns 0%; two of three replies rounds to 67%.

Run: `pnpm test 'app/(protected)/dashboard/board/board-data.test.ts'`

Expected: FAIL because `board-data.ts` does not exist.

- [ ] **Step 2: Implement board-data helpers and refactor the component**

Keep `useMemo` in `GuestsBoard`, but delegate calculation to the pure helpers. Keep optimistic rows, drag state, and pagination state in the Client Component.

Run: `pnpm test 'app/(protected)/dashboard/board/board-data.test.ts'`

Expected: PASS.

- [ ] **Step 3: Write failing CSV tests**

Assert exact header order, doubled embedded quotes, CRLF row endings, semicolon-separated labels/dietary, companion text, date truncation, and `${baseUrl}/?id=${token}`.

Run: `pnpm test 'app/(protected)/dashboard/guest-csv.test.ts'`

Expected: FAIL because `guest-csv.ts` does not exist.

- [ ] **Step 4: Implement CSV serialization and simplify the button**

Move status labels, cell escaping, header construction, and row serialization into the pure module. Keep Blob, object URL, anchor click, and URL revocation in `ExportGuestsButton`.

Run: `pnpm test && pnpm lint`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit**

```bash
git add 'app/(protected)/dashboard/board/board-data.ts' 'app/(protected)/dashboard/board/board-data.test.ts' 'app/(protected)/dashboard/guest-csv.ts' 'app/(protected)/dashboard/guest-csv.test.ts' 'app/(protected)/dashboard/guests-board.tsx' 'app/(protected)/dashboard/export-guests-button.tsx'
git commit -m "refactor: extract dashboard data transforms"
```

---

### Task 4: Extract RSVP and admin form state test-first

**Files:**
- Create: `components/letter/rsvp-form/form-state.test.ts`
- Create: `components/letter/rsvp-form/form-state.ts`
- Modify: `components/letter/rsvp-form.tsx`
- Create: `app/(protected)/dashboard/guests/guest-form.test.ts`
- Create: `app/(protected)/dashboard/guests/guest-form.ts`
- Modify: `app/(protected)/dashboard/guests/guest-dialog.tsx`

**Interfaces:**
- Produces: `buildCompanionFields(adults, kids)`, `getMissingRsvpFields(state)`, `getCapacityMessage(state)`, and `buildFallbackSummary(state)`.
- Produces: `guestFormValues(formData)` and `getGuestPartyState({ mode, status, maxGuests, adults, kids, serverError })`.
- Preserves: current strings, controlled state, submit snapshot, and server action APIs.

- [ ] **Step 1: Write failing RSVP form-state tests**

Assert stable slugs (`adult-2`, `kid-1`), missing status/name ordering, over-capacity wording, at-capacity wording, solo behavior, and going/decline fallback summaries.

Run: `pnpm test components/letter/rsvp-form/form-state.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement RSVP form-state helpers and refactor `RsvpForm`**

Pass one typed state object into the pure functions. Keep React state ownership and form rendering in `RsvpForm`.

Run: `pnpm test components/letter/rsvp-form/form-state.test.ts`

Expected: PASS.

- [ ] **Step 3: Write failing admin guest form tests**

Assert SNS blanks are removed, repeated label IDs are preserved, declined state suppresses live count errors, going with zero people reports the existing error, and over-capacity prefers the server error when present.

Run: `pnpm test 'app/(protected)/dashboard/guests/guest-form.test.ts'`

Expected: FAIL because the module does not exist.

- [ ] **Step 4: Implement admin form helpers and refactor the dialog**

Move `GuestData`, `RsvpStatus`, status options, FormData parsing, and pure party calculations into `guest-form.ts`. Keep dialog open/remount behavior and React form state in `guest-dialog.tsx`.

Run: `pnpm test && pnpm lint`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit**

```bash
git add components/letter/rsvp-form.tsx components/letter/rsvp-form/form-state.ts components/letter/rsvp-form/form-state.test.ts 'app/(protected)/dashboard/guests/guest-dialog.tsx' 'app/(protected)/dashboard/guests/guest-form.ts' 'app/(protected)/dashboard/guests/guest-form.test.ts'
git commit -m "refactor: isolate form state calculations"
```

---

### Task 5: Align application forms and menus with shadcn Base UI

**Files:**
- Create via CLI: `components/ui/field.tsx`
- Create via CLI: `components/ui/input-group.tsx`
- Create via CLI: `components/ui/spinner.tsx`
- Modify: `components/letter/rsvp-form.tsx`
- Modify: `components/letter/rsvp-form/companion-fields.tsx`
- Modify: `components/letter/rsvp-form/dietary-choices.tsx`
- Modify: `components/letter/rsvp-form/section.tsx`
- Modify: `components/letter/rsvp-form/stepper.tsx`
- Modify: `components/letter/rsvp-form/submit-area.tsx`
- Modify: `app/(protected)/dashboard/guests/guest-dialog.tsx`
- Modify: `app/(protected)/dashboard/guests/labels-manager.tsx`
- Modify: `components/dashboard/account-menu.tsx`
- Modify: relevant Select/DropdownMenu call sites found by `rg`.

**Interfaces:**
- Consumes: shadcn Base UI `Field*`, `InputGroup*`, and `Spinner` APIs.
- Preserves: native RSVP radio/checkbox controls, form names, action bindings, accessible descriptions, and layout.

- [ ] **Step 1: Preview and add missing primitives**

Run:

```bash
pnpm exec shadcn add field input-group spinner --dry-run
pnpm exec shadcn add field input-group spinner
```

Read all three generated files and confirm aliases, Base UI composition, Lucide icons, and no unrelated overwrites.

- [ ] **Step 2: Refactor field composition**

Replace repeated raw label/control/error wrappers with `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, and semantic `FieldSet`/`FieldLegend`. Apply `data-invalid` to Field and `aria-invalid` to controls. Preserve the letter-specific header/rule shell around fieldsets.

- [ ] **Step 3: Refactor SNS prefix inputs**

Use `InputGroup`, `InputGroupInput`, `InputGroupAddon`, and `InputGroupText`. Place the addon after the input in DOM order and use `align="inline-start"` so focus behavior follows Base UI documentation.

- [ ] **Step 4: Correct Select and DropdownMenu grouping**

Wrap all `SelectItem` collections in `SelectGroup` and all menu item collections in `DropdownMenuGroup`. Ensure each Base UI `Select` receives its `items` list where required.

- [ ] **Step 5: Correct button pending/icon composition**

Use `Spinner data-icon="inline-start"` in pending shadcn Buttons. Add `data-icon` to icons inside Buttons and remove sizing classes that the primitive owns. Keep the custom letter submit button's visual contract while using the shared Spinner.

- [ ] **Step 6: Verify UI component behavior**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: all commands succeed and `/` remains PPR in the route summary.

- [ ] **Step 7: Commit**

```bash
git add components/ui components/letter/rsvp-form.tsx components/letter/rsvp-form 'app/(protected)/dashboard/guests' components/dashboard/account-menu.tsx
git commit -m "refactor: align forms with shadcn composition"
```

---

### Task 6: Normalize application Tailwind usage without redesign

**Files:**
- Modify: application `.tsx` files under `app/` and `components/`, excluding unchanged shadcn-owned `components/ui/*`.
- Modify: `app/globals.css` comments or tokens only when required by a concrete cleanup.

**Interfaces:**
- Preserves: rendered layout and all documented palette/geometry exceptions.
- Produces: no application `space-x-*`/`space-y-*`, defined-scale values where visually equivalent, and statically detectable classes.

- [ ] **Step 1: Inventory violations**

Run:

```bash
rg -n 'space-[xy]-|className=\{`|<img|dark:|z-\[' app components --glob '*.{ts,tsx}'
```

Classify every match as application cleanup, shadcn-owned source, documented geometry, or semantic dark-mode requirement.

- [ ] **Step 2: Replace stack spacing and equal dimensions**

Convert vertical `space-y-*` containers to `flex flex-col gap-*`. Convert equal `w-* h-*` pairs to `size-*`. Preserve list semantics and wrapping behavior.

- [ ] **Step 3: Prefer defined Tailwind values**

Replace bracketed values only when a defined utility yields the same visual measurement or a negligible sub-pixel difference. Retain documented art offsets, CSS calculations, safe-area expressions, responsive image geometry, and locked type roles.

- [ ] **Step 4: Normalize conditional classes and tokens**

Use `cn()` for conditional/merged classes. Remove application dark overrides already represented by semantic tokens. Keep dashboard artwork palette constants and guest-letter semantic tokens.

- [ ] **Step 5: Run code checks**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: zero test failures, zero lint warnings, successful production build.

- [ ] **Step 6: Commit**

```bash
git add app components lib app/globals.css
git commit -m "refactor: normalize tailwind utility usage"
```

---

### Task 7: Decompose `OurStory` without changing rendering

**Files:**
- Create: `components/letter/our-story/types.ts`
- Create: `components/letter/our-story/memories.ts`
- Create: `components/letter/our-story/vine-geometry.ts`
- Create: `components/letter/our-story/vine-geometry.test.ts`
- Create: `components/letter/our-story/vine-florals.tsx`
- Create: `components/letter/our-story/decorations.tsx`
- Modify: `components/letter/our-story.tsx`

**Interfaces:**
- Preserves: `export function OurStory()` from `components/letter/our-story.tsx`.
- Produces: exported `Memory`, memory data, geometry helpers, vine/floral rendering, and decorative presentation modules consumed only by `OurStory`.

- [ ] **Step 1: Write failing geometry tests**

Test `vineHeight`, `vineNodes`, side alternation, x-position calculation, and tangent/heading output at stable sample inputs.

Run: `pnpm test components/letter/our-story/vine-geometry.test.ts`

Expected: FAIL because the geometry module does not exist.

- [ ] **Step 2: Move types, data, and pure geometry**

Move code without rewriting formulas or values. Export only names consumed across the new files. Run the geometry tests until they pass.

- [ ] **Step 3: Move floral and decorative components**

Move `Vine`, `VineFlorals`, `Polaroid`, `InkCharm`, and `CameraCharm` into focused modules, preserving JSX, SVG attributes, motion props, classes, and DOM order exactly.

- [ ] **Step 4: Reduce the entry component**

Leave `OurStory` responsible for interactive state, section layout, and composition. Keep the existing `"use client"` boundary at the entry and any child modules that use client-only libraries.

- [ ] **Step 5: Verify**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: all pass; public route remains PPR.

- [ ] **Step 6: Commit**

```bash
git add components/letter/our-story.tsx components/letter/our-story
git commit -m "refactor: split our story presentation modules"
```

---

### Task 8: Correct Next.js images, metadata, and error surfaces

**Files:**
- Modify: `app/layout.tsx`
- Create or modify: route-group metadata/layout files only where required to distinguish public and admin titles.
- Create: `app/error.tsx`
- Create: `app/(protected)/error.tsx`
- Create: `app/error.test.tsx`
- Modify: `components/letter/envelope-gallery.tsx`
- Modify: `components/letter/location.tsx`
- Modify: `next.config.ts` only if a verified remote image host needs configuration.

**Interfaces:**
- Preserves: image crop, stack interaction, responsive sizes, route paths, and PPR behavior.
- Produces: accurate public metadata and accessible retry-based error UIs.

- [ ] **Step 1: Write failing error-boundary component tests**

Render each boundary with a synthetic error and retry spy. Assert an accessible heading, no raw error message, and that the retry button calls Next.js 16's documented `unstable_retry` callback.

Run: `pnpm test app/error.test.tsx`

Expected: FAIL because the boundaries do not exist.

- [ ] **Step 2: Implement error boundaries**

Mark error components `"use client"`. Use existing Button and Alert primitives, a concise generic message, and `unstable_retry()` for recovery. The protected boundary includes a safe dashboard link.

- [ ] **Step 3: Fix metadata ownership**

Set public wedding metadata at the public surface and keep admin/login descriptions route-specific. Do not make metadata request-time or force the public shell dynamic.

- [ ] **Step 4: Replace raw images**

Use `next/image` for static/public or stable remote images with accurate `alt`, `fill`/dimensions, object-fit classes, and `sizes`. If a remote placeholder host is retained, add the narrowest allowed host pattern supported by local Next.js 16 docs.

- [ ] **Step 5: Verify**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: zero `<img>` lint warnings and successful route generation.

- [ ] **Step 6: Commit**

```bash
git add app components/letter/envelope-gallery.tsx components/letter/location.tsx next.config.ts
git commit -m "refactor: improve nextjs route surfaces"
```

---

### Task 9: Synchronize documentation and perform full verification

**Files:**
- Modify: `README.md`
- Modify: `docs/rsvp-spec.md`
- Modify: stale source comments found during final review.

**Interfaces:**
- Documents: exact test commands, current file responsibilities, current native control rationale, and current rendering architecture.

- [ ] **Step 1: Update documentation**

Add `pnpm test` and `pnpm test:watch` to README development commands. Update the RSVP spec's file plan to reflect extracted logic and shadcn Field/InputGroup/Spinner use while preserving approved behavior.

- [ ] **Step 2: Run diff checks**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only intentional files changed.

- [ ] **Step 3: Run the complete automated verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: zero test failures, zero lint errors/warnings, successful Next.js build, and `/` still reported as partially prerendered.

- [ ] **Step 4: Inspect rendered public UI**

Run the development server and inspect `/` at approximately 390×844, 768×1024, and 1440×1000. Exercise RSVP attendance branches, capacity controls, companion names, image/deck controls, music control, focus states, and reduced motion.

- [ ] **Step 5: Inspect login and dashboard surfaces**

Inspect `/login` at phone and desktop widths. Inspect `/dashboard` when the configured session permits it; otherwise verify the redirect/login boundary and record authenticated dashboard inspection as unavailable rather than claiming it passed.

- [ ] **Step 6: Review requirements line by line**

Compare the final diff to the approved design, `PRODUCT.md`, `docs/rsvp-spec.md`, and `docs/roles-and-permissions.md`. Confirm no schema, authorization, cache-tag, route, visual, or product behavior change entered the refactor.

- [ ] **Step 7: Commit documentation**

```bash
git add README.md docs/rsvp-spec.md
git commit -m "docs: document refactor test workflow"
```
