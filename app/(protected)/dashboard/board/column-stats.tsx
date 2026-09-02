import { cn } from "@/lib/utils";
import { headcount } from "@/app/(protected)/dashboard/board/headcount";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

/**
 * Column head-count. `guests` is shown everywhere; the adults/kids totals
 * (from the replies) are only meaningful for the Attending column, so they
 * are opt-in via `showCounts` — Awaiting/Declined show the guest count alone.
 *
 * The figures are tabular: these numbers change under a drag, and proportional
 * digits make the whole row re-flow when a count crosses 9 or 99.
 *
 * The figure is full ink and the unit is the tertiary tone, which clears 4.5:1
 * on the white page (5.69:1) and on all three lane washes (4.58:1 at the
 * tightest, the clay one) — the two grounds this row actually renders on.
 */
function Stat({ value, unit, size }: { value: number; unit: string; size?: "sm" }) {
  return (
    <div className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span
        className={cn(
          "leading-none tabular-nums text-foreground",
          size === "sm" ? "text-2xl" : "text-3xl",
        )}
      >
        {value}
      </span>
      <span className="label-caps text-muted-foreground">{unit}</span>
    </div>
  );
}

export function ColumnStats({
  cards,
  showCounts,
  size,
}: {
  cards: GuestRow[];
  showCounts: boolean;
  size?: "sm";
}) {
  const adults = cards.reduce((sum, r) => sum + (r.adults ?? 0), 0);
  const kids = cards.reduce((sum, r) => sum + (r.kids ?? 0), 0);
  const people = headcount(cards);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <Stat value={people} unit="guests" size={size} />
      {showCounts ? (
        <>
          <div className="h-5 w-px bg-chip-edge" />
          <Stat value={adults} unit="adults" size={size} />
          <div className="h-5 w-px bg-chip-edge" />
          <Stat value={kids} unit="kids" size={size} />
        </>
      ) : null}
    </div>
  );
}
