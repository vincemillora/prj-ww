import type { GuestStatus } from "@/app/(protected)/dashboard/board/types";

/**
 * The three status lanes.
 *
 * Every value is a CSS variable declared in app/globals.css, so a lane is
 * retuned in one place and the dark variant follows for free. These used to be
 * twenty-two hexes copied out of the imported hi-fi design ("Wedding RSVP -
 * Kanban.dc.html") in a wisteria-gold / sage / dusty-rose palette that appeared
 * nowhere else in the product; they are now three earth pigments mixed off the
 * letter's linen and espresso.
 *
 * The ink constants that used to live here (INK, MUT, FAINT, CARD_BORDER,
 * CHIP_BORDER, CHIP_TEXT, RULE) are gone — they are Tailwind utilities now
 * (`text-foreground`, `text-muted-foreground`, `text-ink-faint`, `border`,
 * `border-chip-edge`, `text-secondary-foreground`, `border-rule`), so the board
 * no longer paints itself through `style` props the theme cannot see.
 */
export const COLUMNS: {
  key: GuestStatus;
  label: string;
  short: string;
  dot: string;
  bg: string;
  hoverBg: string;
  border: string;
  activeText: string;
}[] = [
  {
    key: "pending",
    label: "Awaiting reply",
    short: "Awaiting",
    dot: "var(--dot-pending)",
    bg: "var(--pending-wash)",
    hoverBg: "var(--pending-wash-over)",
    border: "var(--pending-edge)",
    activeText: "var(--pending-ink)",
  },
  {
    key: "going",
    label: "Attending",
    short: "Attending",
    dot: "var(--dot-going)",
    bg: "var(--going-wash)",
    hoverBg: "var(--going-wash-over)",
    border: "var(--going-edge)",
    activeText: "var(--going-ink)",
  },
  {
    key: "not_going",
    label: "Declined",
    short: "Declined",
    dot: "var(--dot-declined)",
    bg: "var(--declined-wash)",
    hoverBg: "var(--declined-wash-over)",
    border: "var(--declined-edge)",
    activeText: "var(--declined-ink)",
  },
];

export type BoardColumn = (typeof COLUMNS)[number];

/** Guest cards revealed per “Show more” press. */
export const PAGE = 20;
