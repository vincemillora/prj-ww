import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WEDDING_DAY_LABEL } from "@/lib/wedding";

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      initial: _initial,
      whileInView: _whileInView,
      viewport: _viewport,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
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
