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
      "/locket/locket-frame.png",
    );

    const photoLayer = screen.getByTestId("countdown-locket-photos");
    expect(photoLayer).toHaveStyle({
      maskImage: "url(/locket/locket-window-mask.png)",
    });

    const photos = screen.getAllByTestId("countdown-locket-photo");
    expect(photos).toHaveLength(2);
    expect(photos[0]).toHaveAttribute(
      "href",
      "https://picsum.photos/seed/ww-locket-left/360/420",
    );
    expect(photos[1]).toHaveAttribute(
      "href",
      "https://picsum.photos/seed/ww-locket-right/360/420",
    );
  });
});
