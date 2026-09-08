import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WEDDING_DAY_LABEL } from "@/lib/wedding";

// The motion-only props are pulled out so they never reach the DOM (React
// warns on unknown attributes), then `void`ed to say the discard is deliberate
// — the same shape welcome-band.test.tsx and our-story/vine-art.test.tsx use.
// An `_`-prefix does not work here: this config carries no `varsIgnorePattern`,
// so prefixed names still read as unused.
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
    }) => {
      void initial;
      void whileInView;
      void viewport;
      void transition;

      return <div {...props}>{children}</div>;
    },
  },
  useReducedMotion: () => true,
}));

import { CountdownBand } from "@/components/letter/countdown-band";

describe("CountdownBand", () => {
  it("places the hero date display before the countdown heading", () => {
    render(<CountdownBand />);

    const date = screen.getByText(WEDDING_DAY_LABEL);
    const heading = screen.getByRole("heading", {
      name: "counting down to the day",
    });

    expect(date.compareDocumentPosition(heading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText("SAT")).toBeInTheDocument();
    expect(screen.queryByTestId("countdown-calendar")).not.toBeInTheDocument();
    expect(screen.queryByText("until we say I do")).not.toBeInTheDocument();
  });
});
