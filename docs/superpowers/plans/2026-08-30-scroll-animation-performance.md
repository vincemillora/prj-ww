# Scroll and Animation Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public wedding letter load and scroll more smoothly on mobile without changing its approved UI or interaction behavior.

**Architecture:** Keep the existing feature composition and Motion library, but move the hero's changing blur onto a fixed raster layer animated only by opacity and transform. Narrow Client Component boundaries, gate hidden floral measurement work, defer the map iframe to an idle period near its viewport, and optimize active decorative assets without changing their rendered geometry.

**Tech Stack:** Next.js 16.2.9 App Router, React 19, TypeScript, Motion 12, Tailwind CSS v4, Vitest, React Testing Library, Next Image.

**Spec:** `docs/superpowers/specs/2026-08-30-scroll-animation-performance-design.md`

## Global Constraints

- Preserve section order, dimensions, spacing, sticky ranges, responsive breakpoints, typography roles, colors, copy, photography, decorative art, overlays, and z-index relationships.
- Preserve the hero's initial sharp state, final blurred state, 1 to 1.15 zoom, and existing 0 to 0.6 scroll interval.
- Preserve reduced-motion behavior and avoid introducing new continuous motion.
- Do not change RSVP product decisions, DTOs, persistence, authorization, or `docs/rsvp-spec.md` unless an actual RSVP decision changes.
- Do not modify `/login`, `/dashboard`, authentication, database, or deployment behavior.
- Do not upgrade or add production dependencies.
- Use the installed Next.js documentation under `node_modules/next/dist/docs/` as authority.
- Follow red-green-refactor for every behavior-bearing source change.
- Keep the known unrelated `components/letter/rsvp.test.tsx` overflow expectation unchanged and report it separately during full-suite verification.

---

### Task 1: Move the hero blur onto a fixed compositor layer

**Files:**
- Modify: `components/letter/opening-backdrop.test.tsx`
- Modify: `components/letter/opening-backdrop.tsx`

**Interfaces:**
- Consumes: Motion `useScroll()` and `useTransform()`; statically imported `heroLily` image.
- Produces: `OpeningBackdrop()` with one shared scale MotionValue, one blur-layer opacity MotionValue, a sharp image layer, and a fixed 8px blurred decorative image layer.

- [ ] **Step 1: Write the failing compositor-layer test**

Replace the single-image assertions with a test that requires two presentation layers and the new opacity mapping:

```tsx
it('crossfades a fixed blur layer while preserving the existing hero zoom', () => {
  const { container } = render(<OpeningBackdrop />);
  const images = container.querySelectorAll('img[src*="hero-lily"]');

  expect(images).toHaveLength(2);
  expect(container.querySelector('[data-slot="hero-background-sharp"]')).toBeInTheDocument();
  expect(container.querySelector('[data-slot="hero-background-blur"]')).toHaveClass('blur-[8px]');
  expect(useTransformMock).toHaveBeenNthCalledWith(1, expect.anything(), [0, 0.6], [1, 1.15]);
  expect(useTransformMock).toHaveBeenNthCalledWith(2, expect.anything(), [0, 0.6], [0, 1]);
});
```

Update the Motion mock so it accepts `style` without serializing MotionValue test doubles and remove the obsolete `useMotionTemplate` mock.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test components/letter/opening-backdrop.test.tsx`

Expected: FAIL because only one hero image exists, the blur data slot is absent, and the second transform still maps to blur radius 0 to 8.

- [ ] **Step 3: Implement the fixed blur layer**

In `OpeningBackdrop`, remove `useMotionTemplate`, derive `blurOpacity`, and render both images inside the shared scaled parent:

```tsx
const scale = useTransform(scrollYProgress, [0, 0.6], [1, 1.15]);
const blurOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

<motion.div className="absolute inset-0" style={{ scale }}>
  <Image
    data-slot="hero-background-sharp"
    src={heroLily}
    alt=""
    fill
    preload
    placeholder="blur"
    sizes="100vw"
    className="object-cover object-center"
  />
  <motion.div
    data-slot="hero-background-blur"
    className="absolute inset-0 blur-[8px]"
    style={{ opacity: blurOpacity }}
  >
    <Image
      src={heroLily}
      alt=""
      fill
      loading="eager"
      placeholder="blur"
      sizes="100vw"
      className="object-cover object-center"
    />
  </motion.div>
</motion.div>
```

Keep preload on the sharp copy only. The identical optimized URL allows the browser to reuse the network response.

- [ ] **Step 4: Run focused tests and lint**

Run: `pnpm test components/letter/opening-backdrop.test.tsx && pnpm exec eslint components/letter/opening-backdrop.tsx components/letter/opening-backdrop.test.tsx`

Expected: PASS with zero ESLint errors.

- [ ] **Step 5: Commit the hero optimization**

```bash
git add components/letter/opening-backdrop.tsx components/letter/opening-backdrop.test.tsx
git commit -m "perf: composite the hero blur"
```

---

### Task 2: Narrow static section hydration to reusable reveal leaves

**Files:**
- Create: `components/letter/in-view-reveal.tsx`
- Create: `components/letter/in-view-reveal.test.tsx`
- Modify: `components/letter/welcome-band.tsx`
- Modify: `components/letter/welcome-band.test.tsx`
- Modify: `components/letter/day-itself.tsx`

**Interfaces:**
- Produces: `InViewReveal` with props `{ as?: 'div' | 'li'; className?: string; distance?: number; duration?: number; ease?: 'easeOut' | [number, number, number, number]; children: React.ReactNode }`.
- Consumes: `InViewReveal` from Server Components using only serializable props.

- [ ] **Step 1: Write the failing reveal contract tests**

Create `in-view-reveal.test.tsx` with a Motion mock that exposes received animation values as data attributes. Cover the normal and reduced-motion contracts:

```tsx
it('reveals a list item once with the configured distance and timing', () => {
  reduceMotion = false;
  render(
    <InViewReveal as="li" distance={24} duration={0.7} ease="easeOut">
      Event
    </InViewReveal>,
  );
  const item = screen.getByRole('listitem');
  expect(item).toHaveAttribute('data-initial', JSON.stringify({ opacity: 0, y: 24 }));
  expect(item).toHaveAttribute('data-animate', JSON.stringify({ opacity: 1, y: 0 }));
  expect(item).toHaveAttribute('data-viewport', JSON.stringify({ once: true, amount: 0.4 }));
});

it('starts visible when reduced motion is requested', () => {
  reduceMotion = true;
  render(<InViewReveal>Welcome</InViewReveal>);
  expect(screen.getByText('Welcome')).toHaveAttribute('data-initial', 'false');
});
```

- [ ] **Step 2: Run the reveal test and verify RED**

Run: `pnpm test components/letter/in-view-reveal.test.tsx`

Expected: FAIL because `components/letter/in-view-reveal.tsx` does not exist.

- [ ] **Step 3: Implement the client reveal leaf**

Create `in-view-reveal.tsx` with `'use client'`, `motion`, and `useReducedMotion`. Build one shared props object and return `motion.li` when `as === 'li'`, otherwise `motion.div`:

```tsx
const reveal = { opacity: 1, y: 0 };
const viewport = { once: true, amount: 0.4 };

export function InViewReveal({
  as = 'div', className, distance = 20, duration = 0.9,
  ease = [0.16, 1, 0.3, 1], children,
}: InViewRevealProps) {
  const reduceMotion = useReducedMotion();
  const props = {
    className,
    initial: reduceMotion ? (false as const) : { opacity: 0, y: distance },
    whileInView: reveal,
    viewport,
    transition: { duration, ease },
  };
  return as === 'li'
    ? <motion.li {...props}>{children}</motion.li>
    : <motion.div {...props}>{children}</motion.div>;
}
```

- [ ] **Step 4: Run the reveal test and verify GREEN**

Run: `pnpm test components/letter/in-view-reveal.test.tsx`

Expected: PASS.

- [ ] **Step 5: Replace Welcome and Day Itself Motion wrappers**

Remove `'use client'` and direct Motion imports from `welcome-band.tsx` and `day-itself.tsx`. Replace the Welcome wrapper with default `InViewReveal`, each event `motion.li` with:

```tsx
<InViewReveal
  as="li"
  distance={24}
  duration={0.7}
  ease="easeOut"
  className="relative flex flex-col items-start gap-3 pb-12 pl-16 last:pb-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-10 md:pl-0"
>
```

Replace the getaway-car `motion.div` with the same reveal configuration using the existing className. Do not change any descendants or layout classes.

- [ ] **Step 6: Run section tests, build boundary checks, and lint**

Run: `pnpm test components/letter/in-view-reveal.test.tsx components/letter/welcome-band.test.tsx components/letter/day-itself.test.tsx && pnpm exec eslint components/letter/in-view-reveal.tsx components/letter/in-view-reveal.test.tsx components/letter/welcome-band.tsx components/letter/welcome-band.test.tsx components/letter/day-itself.tsx`

Expected: PASS with zero ESLint errors. If `day-itself.test.tsx` is absent, Vitest should still run the two existing paths and the new reveal test via its filename filters.

- [ ] **Step 7: Commit the hydration boundary refactor**

```bash
git add components/letter/in-view-reveal.tsx components/letter/in-view-reveal.test.tsx components/letter/welcome-band.tsx components/letter/welcome-band.test.tsx components/letter/day-itself.tsx
git commit -m "perf: narrow letter reveal hydration"
```

---

### Task 3: Stop hidden Our Story floral measurement work

**Files:**
- Create: `components/letter/our-story/vine-art.test.tsx`
- Modify: `components/letter/our-story/vine-art.tsx`
- Modify: `components/letter/our-story.tsx`

**Interfaces:**
- Extends: `VineFlorals` with optional `media?: 'mobile' | 'desktop'`.
- Behavior: mobile uses `(max-width: 639px)` and desktop uses `(min-width: 640px)`; inactive branches disconnect `ResizeObserver` and disable `whileInView` on their hidden sprigs.

- [ ] **Step 1: Write the failing responsive observer test**

Create a focused test with controlled `matchMedia`, `ResizeObserver`, and a Motion span mock. The test must render a desktop branch under a non-matching mobile viewport and then trigger a breakpoint change:

```tsx
it('measures and animates only while its responsive branch is active', () => {
  mediaMatches = false;
  const { container } = render(<VineFlorals rows={2} reach={32} media="desktop" />);
  expect(resizeObserve).not.toHaveBeenCalled();
  expect(container.querySelector('[data-while-in-view="true"]')).not.toBeInTheDocument();

  mediaMatches = true;
  act(() => mediaListener?.({ matches: true } as MediaQueryListEvent));
  expect(resizeObserve).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[data-while-in-view="true"]')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the vine test and verify RED**

Run: `pnpm test components/letter/our-story/vine-art.test.tsx`

Expected: FAIL because `media` is not accepted and the existing effect always starts `ResizeObserver`.

- [ ] **Step 3: Gate measurement and sprig viewport animation**

Add `media` to `VineFlorals`. Keep `mediaActive` initialized to `true` for hydration-safe server output. In its effect, create `startObserver`, `stopObserver`, and `sync(matches)` functions. When no media is supplied, start immediately. Otherwise subscribe to the exact media query, call `sync(query.matches)`, and clean up the listener and observer on unmount.

Use the active state in the sprig Motion props:

```tsx
initial={!mediaActive || reduce ? undefined : { opacity: 0 }}
whileInView={!mediaActive || reduce ? undefined : { opacity: 1 }}
```

Pass `media="mobile"` and `media="desktop"` from the two existing `OurStory` branches. Keep both DOM compositions and every existing class, path, position, and breakpoint unchanged.

- [ ] **Step 4: Run focused tests and lint**

Run: `pnpm test components/letter/our-story/vine-art.test.tsx components/letter/our-story.test.tsx && pnpm exec eslint components/letter/our-story/vine-art.tsx components/letter/our-story/vine-art.test.tsx components/letter/our-story.tsx`

Expected: PASS with zero ESLint errors.

- [ ] **Step 5: Commit the responsive observer gate**

```bash
git add components/letter/our-story/vine-art.tsx components/letter/our-story/vine-art.test.tsx components/letter/our-story.tsx
git commit -m "perf: pause hidden story florals"
```

---

### Task 4: Defer Location map creation to nearby browser idle time

**Files:**
- Create: `components/letter/deferred-map.tsx`
- Create: `components/letter/deferred-map.test.tsx`
- Modify: `components/letter/location.tsx`

**Interfaces:**
- Produces: `DeferredMap({ title, src, active }: { title: string; src: string; active: boolean })`.
- Behavior: reserves the exact 20rem/24rem map box, observes with `rootMargin: '1200px 0px'`, mounts during `requestIdleCallback({ timeout: 800 })`, falls back to a 150ms timer, and cleans up pending work.

- [ ] **Step 1: Write the failing idle-mount tests**

Create controlled IntersectionObserver and idle callback doubles. Assert real iframe presence rather than the doubles themselves:

```tsx
it('mounts the iframe during idle time after the map approaches', () => {
  render(<DeferredMap title="Map — Anvy" src="https://maps.example/embed" active />);
  expect(screen.queryByTitle('Map — Anvy')).not.toBeInTheDocument();

  act(() => intersectionCallback([{ isIntersecting: true }] as IntersectionObserverEntry[]));
  expect(screen.queryByTitle('Map — Anvy')).not.toBeInTheDocument();

  act(() => idleCallback({ didTimeout: false, timeRemaining: () => 10 }));
  expect(screen.getByTitle('Map — Anvy')).toHaveAttribute('src', 'https://maps.example/embed');
});

it('uses a bounded timer when requestIdleCallback is unavailable', () => {
  vi.useFakeTimers();
  delete window.requestIdleCallback;
  render(<DeferredMap title="Map — Anvy" src="https://maps.example/embed" active />);
  act(() => intersectionCallback([{ isIntersecting: true }] as IntersectionObserverEntry[]));
  act(() => vi.advanceTimersByTime(150));
  expect(screen.getByTitle('Map — Anvy')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the deferred map test and verify RED**

Run: `pnpm test components/letter/deferred-map.test.tsx`

Expected: FAIL because `DeferredMap` does not exist.

- [ ] **Step 3: Implement the viewport and idle boundary**

Create a Client Component with a wrapper ref and `mounted` state. The wrapper always renders:

```tsx
<div
  ref={containerRef}
  className="mt-4 h-[20rem] overflow-hidden rounded-md border border-ink/15 md:h-[24rem]"
>
  {mounted ? (
    <iframe
      title={title}
      src={src}
      className={cn('block size-full border-0', !active && 'pointer-events-none')}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  ) : null}
</div>
```

The effect observes the wrapper, disconnects after the first intersection, schedules `setMounted(true)` through idle callback or timer, and cancels the observer, idle callback, and timer on cleanup.

- [ ] **Step 4: Replace only the existing map wrapper**

In `location.tsx`, import `DeferredMap` and replace lines 202-214 with:

```tsx
<DeferredMap
  title={`Map — ${VENUE.name}`}
  src={VENUE.embed}
  active={front === 'venue'}
/>
```

Do not change card dimensions, drag behavior, pointer behavior, caption, or map link.

- [ ] **Step 5: Run focused tests and lint**

Run: `pnpm test components/letter/deferred-map.test.tsx components/letter/wedding-letter.test.tsx && pnpm exec eslint components/letter/deferred-map.tsx components/letter/deferred-map.test.tsx components/letter/location.tsx`

Expected: PASS with zero ESLint errors.

- [ ] **Step 6: Commit the map deferral**

```bash
git add components/letter/deferred-map.tsx components/letter/deferred-map.test.tsx components/letter/location.tsx
git commit -m "perf: defer the location map"
```

---

### Task 5: Optimize decorative assets without changing geometry

**Files:**
- Modify: `components/letter/countdown-locket.test.tsx`
- Modify: `components/letter/countdown-locket.tsx`
- Modify: `public/laces/Untitled-1 [Recovered]-15.svg`

**Interfaces:**
- Countdown locket public component and asset paths stay unchanged.
- Our Story lace public URL and viewBox stay unchanged.

- [ ] **Step 1: Write the failing locket loading assertions**

Extend the existing locket test:

```tsx
for (const layer of [
  screen.getByTestId('countdown-locket-ribbon'),
  screen.getByTestId('countdown-locket-frame'),
]) {
  expect(layer).toHaveAttribute('loading', 'lazy');
  expect(layer).toHaveAttribute(
    'sizes',
    '(max-width: 608px) 19rem, (max-width: 896px) 50vw, 28rem',
  );
}
```

- [ ] **Step 2: Run the locket test and verify RED**

Run: `pnpm test components/letter/countdown-locket.test.tsx`

Expected: FAIL because the raw `<img>` elements have neither lazy-loading nor responsive `sizes` output.

- [ ] **Step 3: Migrate the two ordinary overlays to Next Image**

Import `Image` from `next/image` and replace the ribbon and frame `<img>` elements with `Image fill` elements. Keep their `src`, `alt`, test IDs, classes, order, and decorative parent unchanged. Add:

```tsx
const LOCKET_SIZES =
  '(max-width: 608px) 19rem, (max-width: 896px) 50vw, 28rem';
```

Pass `sizes={LOCKET_SIZES}` to both images. Leave the masked inline SVG photographs unchanged.

- [ ] **Step 4: Run the locket test and lint**

Run: `pnpm test components/letter/countdown-locket.test.tsx && pnpm exec eslint components/letter/countdown-locket.tsx components/letter/countdown-locket.test.tsx`

Expected: PASS with zero ESLint errors and removal of the production `no-img-element` warnings from this component.

- [ ] **Step 5: Replace the lace with the validated optimized candidate**

Verify the candidate still exists and has the locked viewBox, then replace the public asset mechanically:

```bash
test -f /tmp/prj-ww-lace-audit.N2ROog/lace-default.svg
rg 'viewBox="31 82.8 94 42"' /tmp/prj-ww-lace-audit.N2ROog/lace-default.svg
cp /tmp/prj-ww-lace-audit.N2ROog/lace-default.svg 'public/laces/Untitled-1 [Recovered]-15.svg'
```

Confirm `wc -c` reports approximately 7.1 KB rather than 2.5 MB and the viewBox remains exact. This candidate was already raster-compared at mobile/desktop tile sizes with zero differing pixels.

- [ ] **Step 6: Run related tests and commit assets**

Run: `pnpm test components/letter/countdown-locket.test.tsx components/letter/our-story.test.tsx && git diff --check`

Expected: PASS and no whitespace errors.

```bash
git add components/letter/countdown-locket.tsx components/letter/countdown-locket.test.tsx 'public/laces/Untitled-1 [Recovered]-15.svg'
git commit -m "perf: optimize letter artwork delivery"
```

---

### Task 6: Full verification and repeatable performance comparison

**Files:**
- Modify only if verification reveals a regression in a changed file.

**Interfaces:**
- Consumes: completed public-page performance refactor.
- Produces: fresh test, lint, build, visual, network, and scroll-profile evidence.

- [ ] **Step 1: Run the full automated verification suite**

Run:

```bash
pnpm test
pnpm exec eslint components/letter/opening-backdrop.tsx components/letter/opening-backdrop.test.tsx components/letter/in-view-reveal.tsx components/letter/in-view-reveal.test.tsx components/letter/welcome-band.tsx components/letter/welcome-band.test.tsx components/letter/day-itself.tsx components/letter/our-story.tsx components/letter/our-story/vine-art.tsx components/letter/our-story/vine-art.test.tsx components/letter/deferred-map.tsx components/letter/deferred-map.test.tsx components/letter/location.tsx components/letter/countdown-locket.tsx components/letter/countdown-locket.test.tsx
pnpm build
git diff --check
```

Expected: all new and existing tests pass except the documented pre-existing RSVP overflow expectation if it remains stale; ESLint has zero errors in changed files; build and diff check succeed.

- [ ] **Step 2: Inspect production rendering**

Start the production server and inspect 390px mobile and 1440px desktop views. Capture the hero at scroll progress 0, approximately 0.3, and 0.6; compare section positions, image crops, lace repetition, floral positions, locket stacking, Location dimensions, card paging/dragging, map controls, and reduced-motion rendering.

Expected: no layout, copy, color, crop, interaction, or accessibility regression. The accepted midpoint difference is only the approved sharp-to-fixed-blur interpolation.

- [ ] **Step 3: Repeat the mobile scroll profile**

Use the same production Chrome profile parameters as diagnosis: 392 by 849 viewport, DPR 3, 4x CPU throttling, one first-scroll pass, one warmed pass, and a focused 0-to-1500px hero pass.

Expected: no changing CSS filter on the hero, no filter-driven approximately 99ms warmed hero frame, improved first-scroll Our Story/Location spikes, and zero added CLS.

- [ ] **Step 4: Verify network behavior**

Inspect production network entries for the active story lace and Google Maps iframe.

Expected: the story lace response is no longer megabyte scale; the map iframe is absent from initial critical requests and begins only after its approach trigger.

- [ ] **Step 5: Review final repository state**

Run:

```bash
git status --short
git log --oneline --decorate -7
```

Expected: no uncommitted implementation changes and a short sequence of scoped performance commits after the approved design and plan commits.
