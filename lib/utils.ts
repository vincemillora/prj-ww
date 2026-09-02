import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * The letter's type roles (app/globals.css) have to be declared to
 * tailwind-merge, because it cannot infer them.
 *
 * Its `font-size` group only recognises the built-in t-shirt sizes and
 * arbitrary lengths, so a role name like `text-title` falls through to the
 * `text-color` group. That made `cn('text-title', 'text-ink')` a colour-vs-colour
 * conflict: last one wins, and the SIZE was silently dropped. Every heading,
 * kicker and button in the letter pairs a role with a colour, so all of them
 * were rendering at whatever size they inherited.
 *
 * Registering the roles here fixes every call site at once, and makes
 * `cn('text-body', 'text-meta')` resolve to `text-meta` the way a size conflict
 * should. Add a role to globals.css and it must be added here too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            // The admin's extra small step (fixed rem, not a letter role).
            "2xs",
            "micro",
            "label",
            "kicker",
            "meta",
            "body",
            "lead",
            "subhead",
            "heading",
            "entry",
            "title",
            "figure",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
