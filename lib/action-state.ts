import type { z } from "zod";

/** Result returned by form Server Actions and consumed through `useActionState`. */
export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const OK_ACTION_STATE: ActionState = { ok: true };

/** Convert Zod issues to the first user-facing message for each form field. */
export function toFieldErrors(error: z.ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, fieldErrors };
}
