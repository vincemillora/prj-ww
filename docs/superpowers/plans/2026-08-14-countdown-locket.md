# Countdown Locket Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive ribbon-hung photo locket above the guest letter's countdown without changing the countdown's content or behavior.

**Architecture:** A focused `CountdownLocket` client-compatible presentation component owns the two seeded photo URLs and its layered composition: photo windows first, then the supplied locket frame and ribbon. `CountdownBand` only imports and positions that component ahead of the existing heading, preserving its motion wrapper and all existing countdown/calendar behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library.

## Global Constraints

- Scope is the guest letter only; do not modify `/dashboard`, `/login`, countdown timing, section order, or RSVP behavior.
- Reuse `/public/locket/ribbon.png` and `/public/locket/locket.png`; do not introduce dependencies or new external assets.
- Use fixed `picsum.photos` seed URLs, consistent with `components/letter/prenup.tsx`, until couple photography is provided.
- Keep the group decorative with `aria-hidden` and empty image `alt` text.
- Preserve the letter's Montserrat/Parisienne type roles and white/ink visual system.
- Preserve reduced-motion behavior by keeping the new visual inside the existing countdown reveal rather than introducing autonomous motion.

---

### Task 1: Build and test the isolated locket presentation

**Files:**
- Create: `components/letter/countdown-locket.tsx`
- Create: `components/letter/countdown-locket.test.tsx`

**Interfaces:**
- Consumes: static asset paths `/locket/ribbon.png` and `/locket/locket.png`; two stable Picsum URLs.
- Produces: `CountdownLocket(): React.JSX.Element`, a decorative fixed-aspect-ratio locket composition.

- [ ] **Step 1: Write the failing render-order regression test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountdownLocket } from "@/components/letter/countdown-locket";

describe("CountdownLocket", () => {
  it("renders decorative ribbon, locket frame, and both seeded photo windows", () => {
    render(<CountdownLocket />);

    const locket = screen.getByTestId("countdown-locket");
    expect(locket).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("countdown-locket-ribbon")).toHaveAttribute(
      "src",
      "/locket/ribbon.png",
    );
    expect(screen.getByTestId("countdown-locket-frame")).toHaveAttribute(
      "src",
      "/locket/locket.png",
    );
    expect(screen.getAllByTestId("countdown-locket-photo")).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails because the module does not exist**

Run: `pnpm test components/letter/countdown-locket.test.tsx`

Expected: FAIL with a module-resolution error for `@/components/letter/countdown-locket`.

- [ ] **Step 3: Implement the smallest complete decorative composition**

```tsx
const photos = [
  "https://picsum.photos/seed/ww-locket-left/360/420",
  "https://picsum.photos/seed/ww-locket-right/360/420",
];

const windows = [
  "M 207 517 C 167 485 87 421 88 342 C 89 279 148 270 186 299 C 202 240 302 227 344 282 C 393 347 332 467 249 513 Z",
  "M 590 517 C 630 485 710 421 709 342 C 708 279 649 270 611 299 C 595 240 495 227 453 282 C 404 347 465 467 548 513 Z",
];

export function CountdownLocket() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative aspect-[4/3] w-[clamp(13rem,34vw,18rem)]" data-testid="countdown-locket">
      <img alt="" className="absolute inset-0 h-full w-full object-contain" data-testid="countdown-locket-ribbon" src="/locket/ribbon.png" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 600">
        <defs>{windows.map((d, index) => <clipPath id={`countdown-locket-window-${index}`} key={d}><path d={d} /></clipPath>)}</defs>
        {photos.map((href, index) => <image clipPath={`url(#countdown-locket-window-${index})`} data-testid="countdown-locket-photo" height="320" href={href} key={href} preserveAspectRatio="xMidYMid slice" width="320" x={index === 0 ? 55 : 425} y="225" />)}
      </svg>
      <img alt="" className="absolute inset-0 h-full w-full object-contain" data-testid="countdown-locket-frame" src="/locket/locket.png" />
    </div>
  );
}
```

Keep the locket frame on the top layer, with the two SVG-clipped photos behind it. The root reserves the composition's 4:3 height and ignores pointer input.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `pnpm test components/letter/countdown-locket.test.tsx`

Expected: PASS with one assertion group confirming both static assets and both photo windows.

- [ ] **Step 5: Leave the focused component and test unstaged for review**

The repository's approved RSVP build sequence requires handoff for review and no commit. Do not stage or commit these files.

### Task 2: Place the locket in the countdown band and verify the public surface

**Files:**
- Modify: `components/letter/countdown-band.tsx:3-60`
- Modify: `components/letter/countdown-band.test.tsx` (create if absent)

**Interfaces:**
- Consumes: `CountdownLocket` from `@/components/letter/countdown-locket`.
- Produces: Countdown band DOM order: locket, heading, countdown, calendar action.

- [ ] **Step 1: Write the failing integration test for placement before the heading**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => ({
  motion: { div: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
  useReducedMotion: () => true,
}));

import { CountdownBand } from "@/components/letter/countdown-band";

describe("CountdownBand", () => {
  it("places the decorative locket above the countdown heading", () => {
    const { container } = render(<CountdownBand />);
    const locket = screen.getByTestId("countdown-locket");
    const heading = screen.getByRole("heading", { name: "counting down to the day" });

    expect(locket.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(container).toContainElement(screen.getByText("until we say I do"));
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails because the locket is not in `CountdownBand`**

Run: `pnpm test components/letter/countdown-band.test.tsx`

Expected: FAIL because `getByTestId("countdown-locket")` cannot find the decorative group.

- [ ] **Step 3: Import and position the locket before the existing heading**

```tsx
import { CountdownLocket } from "@/components/letter/countdown-locket";

// Inside the existing motion.div, immediately before the h2:
<CountdownLocket />
<h2 className="font-sans text-subhead text-ink">counting down to the day</h2>
```

Update the component comments to remove the obsolete statement that the band carries no charm. Give the locket a bottom margin in its own component so `CountdownBand` remains responsible only for section hierarchy.

- [ ] **Step 4: Run component tests, lint, and production build**

Run: `pnpm test components/letter/countdown-locket.test.tsx components/letter/countdown-band.test.tsx && pnpm lint && pnpm build`

Expected: all tests pass, ESLint exits 0, and Next.js completes a production build.

- [ ] **Step 5: Inspect responsive rendering in one bounded browser pass**

Run: `pnpm dev`

Inspect the guest page at 360px and 1280px widths. Confirm the locket is centered above the heading, photos stay inside the heart openings, the count remains legible without horizontal overflow, and the calendar action still appears below the count.

- [ ] **Step 6: Leave the completed change unstaged for review**

The repository's approved RSVP build sequence requires handoff for review and no commit. Do not stage or commit these files.

## Self-Review

- Spec coverage: Task 1 covers supplied assets, stable temporary images, decorative semantics, fixed layout reservation, and locket layering. Task 2 covers placement, existing reveal compatibility, and the responsive public-page verification.
- Placeholder scan: no placeholders, incomplete steps, or ambiguous requirements remain.
- Type consistency: `CountdownLocket` is exported once by Task 1 and consumed once by Task 2 with no props.
