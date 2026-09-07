import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ClarityAnalytics } from "@/components/analytics/clarity";

const searchParams = { current: new URLSearchParams() };

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.current,
}));

afterEach(() => {
  searchParams.current = new URLSearchParams();
  document.getElementById("ms-clarity")?.remove();
  delete window.clarity;
});

const tag = () =>
  document.getElementById("ms-clarity") as HTMLScriptElement | null;

describe("ClarityAnalytics", () => {
  it("loads the Clarity tag once, even across a StrictMode double mount", () => {
    render(<ClarityAnalytics />);
    render(<ClarityAnalytics />);

    expect(document.querySelectorAll("#ms-clarity")).toHaveLength(1);
    expect(tag()?.src).toBe("https://www.clarity.ms/tag/yegm3ff50x");
    expect(tag()?.async).toBe(true);
  });

  it("names the session after the invite code in the URL", () => {
    searchParams.current = new URLSearchParams("id=ABC123");

    render(<ClarityAnalytics />);

    // The tag is still downloading under test, so the call lands in the stub's
    // queue — which is exactly the ordering the component exists to guarantee.
    expect(window.clarity?.q).toEqual([
      ["identify", "ABC123", undefined, undefined, "ABC123"],
    ]);
  });

  it("identifies nothing when the visitor arrived without an invite code", () => {
    render(<ClarityAnalytics />);

    expect(window.clarity?.q).toBeUndefined();
  });
});
