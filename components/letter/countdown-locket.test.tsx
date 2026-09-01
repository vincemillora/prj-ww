import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CountdownLocket } from "@/components/letter/countdown-locket";

describe("CountdownLocket", () => {
  it("renders decorative ribbon, locket frame, and both temporary photo windows", () => {
    render(<CountdownLocket />);

    const locket = screen.getByTestId("countdown-locket");
    expect(locket).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByTestId("countdown-locket-ribbon").getAttribute("src"),
    ).toContain("url=%2Flocket%2Fribbon.png");
    expect(
      screen.getByTestId("countdown-locket-frame").getAttribute("src"),
    ).toContain(
      "url=%2Flocket%2Flocket-frame.png",
    );
    for (const layer of [
      screen.getByTestId("countdown-locket-ribbon"),
      screen.getByTestId("countdown-locket-frame"),
    ]) {
      expect(layer).toHaveAttribute("loading", "lazy");
      expect(layer).toHaveAttribute(
        "sizes",
        "(max-width: 608px) 19rem, (max-width: 896px) 50vw, 28rem",
      );
    }

    const photoLayer = screen.getByTestId("countdown-locket-photos");
    expect(photoLayer).toHaveStyle({
      maskImage: "url(/locket/locket-window-mask.png)",
    });

    expect(screen.getAllByTestId("countdown-locket-photo-placeholder")).toHaveLength(2);
    expect(screen.queryByTestId("countdown-locket-photo")).not.toBeInTheDocument();
  });
});
