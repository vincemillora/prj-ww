# Scroll and Animation Performance Refactor Design

**Date:** 2026-08-30
**Status:** Approved for implementation planning

## Objective

Improve first-load and mobile scrolling performance on the public wedding
letter while preserving its approved layout, copy, palette, typography,
responsive composition, interaction model, and overall motion direction.

The work is a targeted delivery and runtime refactor, not a redesign. It covers
the public guest page only. `/login`, `/dashboard`, RSVP data behavior,
authentication, database code, and administration surfaces remain out of scope.

## Evidence and Performance Model

Profiling used the production build at a 392 by 849 CSS-pixel mobile viewport,
device scale factor 3, and 4x CPU throttling. The measurements are diagnostic
signals rather than promises for every device.

- The first automated page scroll showed large one-time frame gaps around the
  Our Story and Location sections. Those gaps disappeared on a fully warmed
  repeat scroll, identifying deferred media, iframe, decode, and entrance work
  as the primary cause rather than persistent layout computation.
- The hero remained the persistent hot path. Its full-viewport background
  animates both scale and CSS `filter: blur()` from scroll progress. A focused
  warmed comparison recorded a roughly 99 ms worst frame with the animated
  filter and a roughly 18 ms worst frame when only the filter was disabled.
- The active Our Story lace SVG transfers at approximately 1.9 MB compressed.
  An SVGO candidate transfers at under 1 KB compressed and produced zero pixel
  differences across the tested one-tile and repeated desktop renders.
- The hero lace remains a large LCP resource. Meaningfully shrinking it would
  require a visible asset-quality decision, so this design does not alter it.

## Selected Approach

Use the balanced option approved by the user:

1. Replace the hero's continuously changing blur radius with a compositor-safe
   crossfade between sharp and fixed-blur layers while retaining the existing
   scroll-linked zoom, blur destination, and timing range.
2. Remove unnecessary client and observer work without changing rendered
   section structure or interaction behavior.
3. Reduce below-fold transfer and prepare the Location map without making it
   compete with initial critical rendering.
4. Verify the result through focused behavioral tests, production builds,
   rendered comparisons, and repeatable mobile performance profiles.

This is preferred over a strict code-only pass because that would leave the
measured hero stall intact. It is preferred over disabling or reducing motion
because the current animation language is part of the approved guest UI.

## Visual and Behavioral Invariants

- Preserve section order, dimensions, spacing, sticky ranges, responsive
  breakpoints, typography roles, colors, copy, photography, decorative art,
  overlays, and z-index relationships.
- Preserve the hero's initial sharp state, final blurred state, 1 to 1.15 zoom,
  and existing scroll interval. The interpolation may use layer opacity rather
  than an intermediate blur radius, which is the accepted balanced tradeoff.
- Preserve reduced-motion behavior and avoid introducing new continuous motion.
- Preserve Our Story floral positions and entrance timing for the active
  viewport layout.
- Preserve Location card dragging, stacking, map controls, external links, and
  imagery. Map preparation must not intercept pointer input or move the card.
- Preserve lightbox layout transitions and the Prenup, RSVP envelope, FAQ, and
  audio interactions.
- Do not change RSVP product decisions or data contracts. No RSVP spec update is
  required unless implementation uncovers an actual spec-affecting decision.

## Architecture and Implementation Boundaries

### Hero compositor path

`OpeningBackdrop` continues to own the sticky viewport and `useScroll` range.
It derives the current scale and a 0-to-1 blur-layer opacity from the same
progress interval.

- Render the same optimized hero image in a sharp layer and a fixed 8px blurred
  layer. Browsers can share the decoded source while compositing the layers.
- Apply the existing scroll-linked scale to a shared parent so both layers keep
  identical framing.
- Animate only transform and opacity during scrolling. The blurred layer's
  filter value remains constant so it can be rasterized instead of repainted
  for every scroll update.
- Keep the existing image preload/priority behavior on one image only. The
  duplicate presentation layer must not create a second network request or an
  additional accessibility announcement.
- Clip blur overflow inside the existing backdrop boundary without changing
  visible hero dimensions.

### Client-boundary narrowing

Server-render static section composition and hydrate only the leaves that need
Motion or browser APIs.

- Introduce a focused in-view reveal client leaf that preserves the existing
  opacity/y transition, viewport amount, once behavior, and reduced-motion
  handling.
- Convert `WelcomeBand` and `DayItself` back to Server Components, leaving the
  countdown/calendar and reveal leaves as Client Components.
- Do not move the page-wide `MotionProvider`, dynamically load the lightbox, or
  replace `motion/react` globally. Drag, shared-layout, and layout animations
  require the current Motion feature set.

### Our Story runtime and asset work

- Replace the active lace SVG with the already validated optimized markup while
  retaining its exact path output, viewBox, public path, repetition behavior,
  and CSS sizing.
- Optimize only other active SVGs that reproduce with zero pixel differences;
  exclude any asset whose raster comparison changes.
- Keep both responsive floral DOM compositions when required for hydration-safe
  server output, but prevent the CSS-hidden branch from starting resize and
  viewport-observer work. Re-evaluate media-query state on breakpoint changes.
- Keep the active branch's sprig motion and re-entry semantics unchanged.

### Below-fold media preparation

- Migrate the countdown locket's ordinary decorative image overlays to
  `next/image` with explicit geometry and accurate `sizes`, preserving their
  current frame and crop. Do not rewrite the inline masked photographs unless
  visual verification proves an equivalent optimized path.
- Wrap Location map mounting in a small viewport-aware boundary. Begin mounting
  when the section is approaching, then schedule the iframe creation during an
  idle period when supported, with a bounded fallback so fast scrolling still
  reveals the map promptly.
- Keep `loading="lazy"` on the iframe. The boundary changes when its work starts;
  it does not make the map an initial critical resource.
- Do not eagerly preload every gallery or card image. That would move work into
  the critical path and compete with the hero.

## Error and Fallback Behavior

- The hero always renders the sharp layer even if the blurred presentation
  layer fails; no JavaScript is required for the base background to exist.
- The deferred map reserves the exact existing card area. Before iframe mount,
  retain the current card surface so there is no layout shift.
- If `requestIdleCallback` is unavailable, use a short bounded timer after the
  viewport trigger. Cancel observers and pending work on unmount.
- Media-query listeners and resize observers must be cleaned up and must not
  update state after unmount.
- Reduced-motion visitors receive the current static/final presentation without
  scroll-linked filter work.

## Testing Strategy

Add focused regression tests before changing behavior-bearing boundaries:

- `OpeningBackdrop` maps scroll progress to the existing scale and new opacity
  range and renders one sharp plus one decorative fixed-blur layer.
- The shared reveal leaf preserves the current transition, viewport, and
  reduced-motion contract used by Welcome and Day Itself.
- The inactive responsive vine branch does not start observers, while the active
  branch retains its current animation configuration.
- The deferred map mounts after the approach trigger and idle callback, uses its
  fallback when idle callbacks are unavailable, and cleans up pending work.
- Countdown locket tests verify the same asset paths, order, and decorative
  semantics after the `next/image` migration.

Avoid brittle snapshots of full sections or assertions that merely inventory
Tailwind classes. Existing interaction tests remain the behavioral safety net.

## Verification and Acceptance Criteria

Completion requires fresh evidence from all of the following:

1. Focused tests for each changed performance boundary pass.
2. `pnpm test` is run in full. The pre-existing RSVP overflow expectation is
   reported separately and is not changed without authorization.
3. `pnpm exec eslint` on changed source and test files has zero errors.
4. `pnpm build` and `git diff --check` succeed.
5. Mobile and desktop rendered comparisons confirm no layout, copy, image crop,
   or interaction regressions. Hero comparisons include the start, midpoint,
   and final scroll states.
6. Reduced-motion rendering is checked at a representative mobile viewport.
7. The same 392 by 849, DPR 3, 4x CPU profile is repeated for first and warmed
   scrolls. The hero must avoid the measured filter-driven long frame, and the
   first-scroll section spikes must improve without increasing layout shift.
8. Network evidence confirms the optimized story lace no longer transfers at
   megabyte scale and that map work is absent from the initial critical path.

If visual comparison, interaction behavior, or performance evidence regresses,
revert the responsible optimization independently rather than weakening the
locked UI constraints.

## Explicit Non-Goals

- Redesigning, removing, or shortening animations.
- Changing the hero lace or accepting visible image-quality loss.
- Replacing Motion with another animation library or a site-wide custom engine.
- Applying broad `content-visibility`, which would destabilize sticky and
  scroll-linked geometry.
- Refactoring dashboard, login, RSVP business logic, authentication, database,
  or deployment configuration.
- Deleting unused public assets as part of this runtime-focused change.
