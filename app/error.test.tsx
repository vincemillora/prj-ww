import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PublicError from "@/app/error";
import ProtectedError from "@/app/(protected)/error";

const sensitiveMessage = "Database password leaked in stack trace";

describe.each([
  ["public", PublicError],
  ["protected", ProtectedError],
] as const)("%s error boundary", (_, ErrorBoundary) => {
  it("offers recovery without exposing the original error", async () => {
    const retry = vi.fn();
    const user = userEvent.setup();

    render(
      <ErrorBoundary
        error={new Error(sensitiveMessage)}
        unstable_retry={retry}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(sensitiveMessage)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
