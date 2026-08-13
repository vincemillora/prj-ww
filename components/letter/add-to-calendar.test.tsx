import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AddToCalendar } from "@/components/letter/add-to-calendar";

describe("AddToCalendar", () => {
  it("opens the calendar destinations on first click", async () => {
    const user = userEvent.setup();

    render(<AddToCalendar />);

    await user.click(
      screen.getByRole("button", { name: "Add to calendar", exact: true }),
    );

    expect(
      await screen.findByRole(
        "menuitem",
        { name: "Google Calendar" },
        { timeout: 5_000 },
      ),
    ).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Outlook" })).toBeVisible();
    expect(
      screen.getByRole("menuitem", {
        name: "Apple Calendar / other (.ics)",
      }),
    ).toBeVisible();
  });
});
