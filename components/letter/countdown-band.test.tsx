import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
  it("places the locket before the countdown heading", () => {
    render(<CountdownBand />);

    const locket = screen.getByTestId("countdown-locket");
    const heading = screen.getByRole("heading", {
      name: "counting down to the day",
    });

    expect(locket.compareDocumentPosition(heading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText("until we say I do")).toBeInTheDocument();
  });
});
