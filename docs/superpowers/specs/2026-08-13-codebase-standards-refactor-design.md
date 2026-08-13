# Codebase Standards Refactor Design

**Date:** 2026-08-13
**Status:** Approved for implementation planning

## Objective

Refactor the full wedding RSVP repository to follow the installed Next.js 16,
React 19, shadcn Base UI, and Tailwind CSS v4 conventions while preserving
existing behavior and rendered design. Add a focused automated test foundation
before restructuring behavior-bearing code.

The refactor covers the public wedding letter, RSVP flow, login, protected
dashboard, authentication helpers, Server Actions, shared utilities, and retired
components that remain in the repository. The work is a standards and
maintainability pass, not a redesign or product change.

## Constraints

- Preserve all routes, user-visible behavior, data contracts, database schema,
  authorization rules, cache tags, and Cache Components/PPR behavior.
- Preserve the guest letter's locked section order, palette, typography roles,
  spacing roles, responsive behavior, and motion behavior from `PRODUCT.md`.
- Preserve `/dashboard` and `/login` visuals from the imported hi-fi design.
- Keep `docs/rsvp-spec.md` synchronized with any RSVP implementation details
  that change during the refactor. Refactoring alone must not change approved
  RSVP decisions.
- Use the repository's installed versions and local Next.js documentation as
  authority. Do not upgrade Next.js, React, Tailwind, shadcn, Drizzle, or other
  production dependencies as part of this work.
- Use Tailwind's defined values wherever possible. Do not create arbitrary
  values, theme tokens, custom utilities, or custom CSS merely to avoid using
  the existing scale.
- Preserve arbitrary values only when they encode necessary design geometry,
  SVG alignment, fluid `clamp()` roles, safe-area calculations, animation math,
  or locked hi-fi measurements without a visually equivalent defined value.
- Do not introduce speculative abstractions. Extract code only when it creates
  a clear responsibility boundary, removes meaningful duplication, or makes
  behavior independently testable.

## Selected Approach

Use a phased, behavior-preserving standards refactor:

1. Establish Vitest and React Testing Library and characterize existing pure
   behavior.
2. Extract pure logic from UI and Server Actions behind existing contracts.
3. Correct Next.js, shadcn, and Tailwind usage without changing rendered output.
4. Decompose only the largest mixed-responsibility modules.
5. Synchronize documentation and verify the complete application through code
   checks and rendered browser inspection.

This approach is preferred over a mechanical-only cleanup because the current
large modules would remain difficult to test and maintain. It is preferred over
a deep architectural rewrite because the application already builds and its
visual design is intentionally settled.

## Architecture and Boundaries

The current feature-oriented repository structure remains in place. Route URLs
and public import entry points do not change.

### Next.js boundaries

- Pages, layouts, and non-interactive feature composition remain Server
  Components by default.
- Client Components remain limited to browser APIs, local interaction state,
  drag and drop, audio, lightboxes, and animation.
- Database reads remain in `lib/data.ts`; protected pages and server code consume
  those cached query functions rather than querying Drizzle directly.
- Authentication and authorization remain in `lib/dal.ts` and related auth
  modules. UI capability checks remain mirrors of authoritative server gates.
- Mutations remain Server Actions or existing authentication Route Handlers.
- `searchParams` stays asynchronous and is forwarded without being awaited by
  the public page shell. The RSVP request-time read stays below Suspense so `/`
  remains partially prerendered.
- Cache directives, cache lifetimes, cache tags, and invalidation semantics stay
  unchanged unless fresh Next.js 16 build evidence exposes an existing defect.
- Add route-surface error boundaries where they can provide accessible recovery
  from unexpected failures without swallowing redirects or expected action
  errors.

### Pure feature modules

Extract behavior-bearing logic into feature-local modules with no React or
database dependency:

- RSVP form party composition, missing-field calculation, capacity messaging,
  and fallback reply construction.
- RSVP action input parsing, Zod issue mapping, and party/capacity validation.
- Admin guest form parsing and live party-count validation.
- Dashboard board filtering, status grouping, pagination calculations, and
  response progress.
- Guest-row serialization and CSV quoting.
- Shared action-state error formatting where identical behavior currently
  appears in multiple actions.

These modules retain the existing external types and strings. UI components and
Server Actions become orchestration layers around them.

### Large module decomposition

Decompose only files that currently contain clearly separate responsibilities:

- `components/letter/our-story.tsx` keeps `OurStory` as its public entry point,
  while memory data, vine geometry, floral placement, decorative charms, and
  polaroid presentation move into focused sibling modules under an
  `our-story/` folder.
- `components/letter/rsvp-form.tsx` keeps `RsvpForm` as its public entry point,
  while its pure state derivation and larger form sections move into the
  existing `rsvp-form/` feature folder.
- `app/(protected)/dashboard/guests/guest-dialog.tsx` keeps `GuestDialog` as its
  public entry point, while form types, pure state calculations, field
  composition, and larger sections move into focused files in the same feature
  folder.
- Dashboard board and card modules may gain focused presentation helpers, but
  their current feature folder and public types remain stable.
- `components/dashboard/florals.tsx` may be split by artwork family only if the
  split reduces file responsibility without changing SVG markup or rendering.
- `app/globals.css` remains the single Tailwind v4 and theme entry point. Its
  sections may be reordered and stale comments corrected, but complex named
  letter effects remain scoped CSS rather than being forced into utilities.

## UI and shadcn Usage

The repository uses shadcn's `base-nova` style on Base UI primitives. Application
call sites will be aligned with that API; installed primitive source remains
shadcn-owned and is changed only when an upstream-compatible fix is required.

- Use existing installed primitives before adding custom markup.
- Add any missing primitives through `pnpm exec shadcn`, after consulting the
  matching component documentation. Do not copy registry source manually.
- Use Base UI's `render` composition API rather than Radix `asChild` patterns.
- Group `SelectItem` and `DropdownMenuItem` elements under their required group
  components.
- Preserve accessible dialog titles and descriptions.
- Use shadcn Field primitives for application forms where they can replace
  repeated label/control/description/error wrappers without changing layout.
- Use InputGroup primitives for prefixed social-account inputs.
- Use ToggleGroup for compact option sets only where its Base UI interaction
  semantics match the current form behavior.
- Use existing Button variants and sizes before applying call-site styling.
- Compose pending buttons with a spinner, `disabled`, and icon data attributes.
- Use Badge, Separator, Empty, Alert, and Skeleton instead of equivalent custom
  markup when their semantics and design match the current screen.
- Keep native RSVP radio and checkbox controls where `docs/rsvp-spec.md`
  explicitly records their scroll-behavior rationale. The refactor must not
  silently replace them with controlled Base UI components.
- Keep Avatar fallbacks and icon-library usage consistent with the configured
  Lucide library.

## Tailwind CSS Strategy

Tailwind v4 remains configured through `@import "tailwindcss"`, `@theme`, and the
existing PostCSS integration in `app/globals.css`.

Use the following priority order for every styling cleanup:

1. Existing Tailwind utility from the defined scale.
2. Existing project theme token or semantic color.
3. Existing reusable component or extracted markup composition.
4. Existing scoped custom CSS for complex named visual behavior.
5. A new token or custom CSS rule only when the value is genuinely semantic and
   repeated, and no existing value is suitable.

Specific cleanup rules:

- Replace `space-x-*` and `space-y-*` stacks with flex/grid plus `gap-*`.
- Use `size-*` when width and height are equal.
- Use semantic colors and existing project tokens for application UI.
- Use `cn()` for conditional or merged classes, not for static strings.
- Keep complete statically detectable class strings; do not construct utility
  fragments dynamically.
- Prefer defined spacing, radius, font-size, line-height, width, height, and
  position utilities over bracketed values when the visual result is
  equivalent.
- Do not add manual dark-mode overrides where semantic tokens already express
  both themes.
- Do not add manual overlay z-index values to shadcn overlays.
- Preserve raw decorative SVG colors and documented dashboard palette values
  where the product specification identifies them as locked artwork.
- Preserve the guest letter's registered type and spacing roles. Any change to a
  `text-*` role must remain synchronized between `app/globals.css` and
  `lib/utils.ts` so `tailwind-merge` does not drop the role.

## Images, Fonts, and Metadata

- Continue loading Montserrat and Parisienne with `next/font` from the root
  layout.
- Correct root and route metadata so the public wedding page is not described as
  an admin console while preserving existing page content.
- Replace raw `<img>` elements with `next/image` when the source and dimensions
  permit optimization. Use `fill` and accurate `sizes` for responsive framed
  images, preserving cropping and stacking behavior.
- Keep raw image markup only when a browser-generated or animation-specific
  behavior makes `next/image` materially unsuitable, and document that reason
  locally.

## Data Flow and Error Handling

No data model or contract changes are planned.

- Zod and Drizzle remain the sources of truth for action input and persisted
  types.
- Reuse a pure first-error-per-field formatter for consistent action state.
- Parse `FormData` in pure adapters, then validate it with the existing schemas.
- Separate RSVP business validation from database orchestration so capacity,
  companion counts, and declined-reply normalization can be tested directly.
- Expected validation, invalid-link, duplicate-response, authorization, and
  uniqueness failures keep the current returned action-state behavior.
- Unexpected database, configuration, and infrastructure failures are not
  converted into misleading validation messages. They propagate to the nearest
  Next.js error boundary unless an existing contract explicitly handles them.
- Error boundaries provide an accessible heading, concise explanation, and a
  retry or safe navigation action. They must not expose secrets or raw database
  errors.

## Test Foundation

Add development-only dependencies for Vitest, jsdom, React Testing Library, and
DOM matchers. Add repository scripts for a one-shot test run and watch mode.

Tests focus on durable behavior rather than implementation details:

- guest create/update and RSVP Zod schemas;
- companion `FormData` collection, sorting, labels, dietary display, and flat
  text formatting;
- RSVP party capacity, required companion counts, missing-field messages,
  decline normalization, and submitted reply summaries;
- role capability helpers;
- dashboard headcounts, filtering, status grouping, pagination, and response
  percentage;
- CSV escaping, column order, dietary content, companions, and invite URLs;
- wedding-date derived values and other pure shared helpers where timezone-safe
  expectations can be stated;
- focused component interactions for the RSVP form, guest dialog, board filters,
  and accessible error UI where pure tests are insufficient.

Avoid snapshots of large component trees, CSS-class inventories, and tests that
assert implementation-only hook structure. Database actions use pure-helper
tests plus existing production build/type checks; no test database or migration
workflow is introduced by this refactor.

For every behavior extracted or changed, write the characterizing or desired
test first, confirm that it fails for the intended missing boundary or defect,
then implement the smallest refactor that makes it pass.

## Verification

Completion requires fresh evidence from all of the following:

1. `pnpm test` completes with zero failures.
2. `pnpm lint` completes with zero errors and zero warnings.
3. `pnpm build` completes successfully, including TypeScript and Next.js route
   generation.
4. The public page is rendered and inspected at representative phone, tablet,
   and desktop widths, including reduced-motion behavior where practical.
5. `/login` and `/dashboard` are inspected at phone and desktop widths. When an
   authenticated dashboard session is unavailable, verify the accessible login
   and redirect boundary and explicitly record the remaining authenticated
   inspection limitation.
6. Changed interactions are exercised in the browser: RSVP branching and
   validation, image/deck controls, dialog opening and form validation, board
   filtering, mobile status tabs, and desktop drag affordances where available.
7. The final diff is reviewed against this design, `PRODUCT.md`,
   `docs/rsvp-spec.md`, and `docs/roles-and-permissions.md` for unapproved visual,
   behavioral, authorization, or caching changes.

## Documentation

- Update `README.md` with the new test commands.
- Update `docs/rsvp-spec.md` only where file responsibilities, component usage,
  or implementation descriptions change. Do not rewrite approved product
  decisions as part of cleanup.
- Correct stale comments in source files when they contradict current behavior.
- Record any intentionally retained nonstandard pattern at the closest relevant
  source location, especially native RSVP controls or unavoidable arbitrary
  geometry.

## Out of Scope

- Product redesign, copywriting, new RSVP fields, or changed user flows.
- Database migrations or schema changes.
- Authentication-provider or session-policy changes.
- Dependency upgrades unrelated to the test foundation.
- Replacing the current drag-and-drop mechanism, animation library, ORM, or
  cache strategy.
- Reintroducing the retired envelope reveal or changing the current music-player
  placement.
- Creating a generalized design system beyond the tokens and primitives already
  required by this application.
