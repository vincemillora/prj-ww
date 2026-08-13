"use client";

import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { letterButton } from "@/components/letter/letter-button";
import { disabledControl } from "@/components/letter/rsvp-form/form-style";
import { Spinner } from "@/components/ui/spinner";

/**
 * The end of the form: the server's error if it rejected the reply, the list of
 * everything still blocking the send, and the send button itself. `missing` is
 * the parent's single source of incompleteness — it disables the button, is
 * spelled out above it, and marks the matching fields invalid up in the form.
 */
export function SubmitArea({
  pending,
  error,
  missing,
  onAttemptSend,
}: {
  pending: boolean;
  error?: string;
  missing: { field: string; message: string }[];
  /** The guest tried the dead button: time to show what is still missing. */
  onAttemptSend: () => void;
}) {
  return (
    // No rule above the action: the button is the end of the page, not
    // another section of it. Spacing alone carries the separation.
    <div className="mt-8 flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-center text-meta italic text-destructive">
          {error}
        </p>
      )}

      {/* Why the button will not send. A dead control with no stated reason is
          the worst of both worlds, so the same `missing` list that disables it
          is spelled out here and tied to it by aria-describedby. */}
      {missing.length > 0 && (
        <div
          id="send-blocked"
          aria-live="polite"
          className="flex flex-col gap-1 text-center text-meta italic text-destructive"
        >
          {missing.map((m) => (
            <p key={m.field}>{m.message}</p>
          ))}
        </div>
      )}

      {/* The one action, in the letter's button voice. Until the reply is
          complete it stays unfilled with a dashed hairline and inks in when it
          is ready. `onClick` fires before the disabled check on nothing, so the
          wrapper below catches the attempt instead: a pointer-events-none
          button would swallow it and leave the guest with no feedback. */}
      <div onPointerDown={onAttemptSend} onFocusCapture={onAttemptSend}>
        <button
          type="submit"
          disabled={pending || missing.length > 0}
          aria-describedby={missing.length > 0 ? "send-blocked" : undefined}
          // One step above the shared button voice: every other control in the
          // letter is a secondary action, and this is the one the site exists
          // for. The voice is unchanged — same face, caps and tracking.
          className={cn(
            letterButton(),
            "h-12 w-full justify-center text-meta",
            disabledControl,
          )}
        >
          {pending ? (
            <Spinner aria-hidden data-icon="inline-start" strokeWidth={1.5} />
          ) : (
            <Send aria-hidden data-icon="inline-start" strokeWidth={1.5} />
          )}
          {pending ? "Sending…" : "Send RSVP"}
        </button>
      </div>
    </div>
  );
}
