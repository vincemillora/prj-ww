import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RsvpState } from "@/app/actions/submit-rsvp";

const { submitState } = vi.hoisted(() => ({
  submitState: { current: { ok: false } as RsvpState },
}));

// The server action is unreachable under test, so it is replaced by a resolver
// the test drives: `submitState.current` is what the next submit returns.
vi.mock("@/app/actions/submit-rsvp", () => ({
  submitRsvp: async () => submitState.current,
}));

import { RsvpForm } from "@/components/letter/rsvp-form";

describe("RsvpForm", () => {
  it("opens the going-only sections when the guest accepts and closes them again on decline", async () => {
    const user = userEvent.setup();
    submitState.current = { ok: false };

    render(<RsvpForm token="tok" maxGuests={3} />);

    // Nothing beyond the attendance question until an answer is given.
    expect(screen.queryByText("Any allergies?")).not.toBeInTheDocument();
    expect(screen.queryByText("Who is coming?")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Joyfully accept/i }));

    expect(screen.getByText("Any allergies?")).toBeInTheDocument();
    expect(screen.getByText("Who is coming?")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Regretfully decline/i }));

    // The group leaves through an exit animation, so it unmounts a beat later.
    await waitFor(() =>
      expect(screen.queryByText("Any allergies?")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Who is coming?")).not.toBeInTheDocument();
  });

  it("adds a companion card for each extra seat and removes it again", async () => {
    const user = userEvent.setup();
    submitState.current = { ok: false };

    render(<RsvpForm token="tok" maxGuests={3} />);
    await user.click(screen.getByRole("radio", { name: /Joyfully accept/i }));

    const nameFields = () => screen.queryAllByRole("textbox", { name: /Name/ });
    expect(nameFields()).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Increase Adults" }));
    await waitFor(() => expect(nameFields()).toHaveLength(1));

    await user.click(screen.getByRole("button", { name: "Increase Kids" }));
    await waitFor(() => expect(nameFields()).toHaveLength(2));

    await user.click(screen.getByRole("button", { name: "Decrease Kids" }));
    await waitFor(() => expect(nameFields()).toHaveLength(1));

    await user.click(screen.getByRole("button", { name: "Decrease Adults" }));
    await waitFor(() => expect(nameFields()).toHaveLength(0));
  });

  it("swaps the form out for the reply once the send is accepted", async () => {
    const user = userEvent.setup();
    submitState.current = { ok: true };

    render(<RsvpForm token="tok" maxGuests={1} />);
    await user.click(screen.getByRole("radio", { name: /Regretfully decline/i }));
    await user.click(screen.getByRole("button", { name: /Send RSVP/i }));

    // mode="wait" holds the reply back until the form's exit finishes, so both
    // the disappearance and the arrival are awaited rather than asserted at once.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Send RSVP/i })).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByText(/Regretfully decline|not able to|Reply received|Thank/i)).toBeInTheDocument(),
    );
  });
});
