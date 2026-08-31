"use client";

import { Send } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { letterButton } from "@/components/letter/letter-button";
import {
  EXIT_S,
  LETTER_EASE,
  MOTION_REDUCE_OPEN,
} from "@/components/letter/motion-tokens";
import { disabledControl } from "@/components/letter/rsvp-form/form-style";
import { Spinner } from "@/components/ui/spinner";

/**
 * The end of the form: the server's error if it rejected the reply, the list of
 * everything still blocking the send, and the send button itself. `missing` is
 * the parent's single source of incompleteness — it disables the button, is
 * spelled out above it, and marks the matching fields invalid up in the form.
 *
 * MOTION: both messages open and close rather than appearing and vanishing.
 * The reason matters here more than anywhere else in the letter — this block sits
 * DIRECTLY above the one button the site exists for, so anything that pops in
 * shoves that button down under the guest's thumb mid-tap. A short collapse
 * makes the shove visible, and the collapse on the way out means the button
 * travels back up at a speed the eye can follow instead of jumping.
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
  const reduce = !!useReducedMotion();
  // Reduced motion is honoured twice: the hook zeroes the durations, and
  // MOTION_REDUCE_OPEN pins the open state in CSS, which is the guarantee — a
  // message stuck at `height: 0` would hide the reason the send is blocked.
  const collapse = {
    className: cn("overflow-hidden", MOTION_REDUCE_OPEN),
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: reduce
      ? { duration: 0 }
      : { duration: EXIT_S, ease: LETTER_EASE },
  } as const;

  return (
    // No rule above the action: the button is the end of the page, not
    // another section of it. Spacing alone carries the separation.
    <div className="mt-8 flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {error && (
          <motion.div key="error" {...collapse}>
            <p
              role="alert"
              className="text-center text-meta italic text-destructive"
            >
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Why the button will not send. A dead control with no stated reason is
          the worst of both worlds, so the same `missing` list that disables it
          is spelled out here and tied to it by aria-describedby. */}
      <AnimatePresence initial={false}>
        {missing.length > 0 && (
          <motion.div key="blocked" {...collapse}>
            <div
              id="send-blocked"
              aria-live="polite"
              className="flex flex-col gap-1 text-center text-meta italic text-destructive"
            >
              {missing.map((m) => (
                <p key={m.field}>{m.message}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
