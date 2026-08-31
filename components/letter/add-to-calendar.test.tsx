import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AddToCalendar } from "@/components/letter/add-to-calendar";

describe("AddToCalendar", () => {
  it("opens the calendar destinations on first click", async () => {
    const user = userEvent.setup();

    render(<AddToCalendar />);

    // `name` is not a text matcher, so it takes no `exact` option: a string
    // name is already matched against the full, whitespace-normalized
    // accessible name. `exact: true` was a no-op that failed the typecheck.
    await user.click(screen.getByRole("button", { name: "Add to calendar" }));

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
