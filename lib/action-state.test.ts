import { describe, expect, it } from "vitest";
import { z } from "zod";
import { toFieldErrors } from "@/lib/action-state";

describe("toFieldErrors", () => {
  it("keeps the first issue for each field", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required").regex(/^x$/, "Name must be x"),
    });
    const result = schema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toEqual({
        ok: false,
        fieldErrors: { name: "Name is required" },
      });
    }
  });

  it("maps a pathless issue to the form field", () => {
    const schema = z.string().refine(() => false, "Form is invalid");
    const result = schema.safeParse("value");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toEqual({
        ok: false,
        fieldErrors: { form: "Form is invalid" },
      });
    }
  });
});
