import { cva, type VariantProps } from 'class-variance-authority';

/**
 * The guest letter's one button style.
 *
 * Every action in the letter — the two "Open in Maps" links, the calendar
 * pill, the RSVP submit — speaks in the same voice: the sans face in the scale's
 * `label` role, upper case, wide tracking. That treatment is deliberate. At letter sizes the ink
 * text around it is set in serif and script faces, so a button reading as a
 * sentence competes with the prose; a tracked, uppercase label reads as a
 * control instead, which is how the calendar strip's weekday labels in
 * components/letter/countdown-band.tsx already behave.
 *
 * Colour comes from the letter's two bases (see the .letter-theme block in
 * app/globals.css). Each variant inverts the same ink and paper pair:
 *   solid       — the default, for light sections. Filled ink, inverting
 *                 to paper on hover.
 *   outline     — same ground, for a section that already has a louder element
 *                 in it, so the action does not become the loudest thing.
 *   outlineOnInk — the ink sections, drawn in paper for contrast.
 */
export const letterButton = cva(
  'inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 font-sans text-label uppercase tracking-[0.16em] transition focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid:
          'border-ink bg-ink text-paper hover:bg-paper hover:text-ink focus-visible:outline-ink',
        outline:
          'border-ink bg-transparent text-ink hover:bg-ink hover:text-paper focus-visible:outline-ink',
        /* Ink sections use paper for every visible control edge. */
        outlineOnInk:
          'border-paper bg-transparent text-paper hover:bg-paper hover:text-ink focus-visible:outline-paper',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);

export type LetterButtonVariants = VariantProps<typeof letterButton>;
