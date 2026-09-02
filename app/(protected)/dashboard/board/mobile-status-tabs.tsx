"use client";

import { cn } from "@/lib/utils";
import { headcount } from "@/app/(protected)/dashboard/board/headcount";
import { COLUMNS } from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow, GuestStatus } from "@/app/(protected)/dashboard/board/types";

// Mobile tab order leads with Attending (per the mobile design).
const MOBILE_ORDER: GuestStatus[] = ["going", "pending", "not_going"];

// Mobile: status tabs
export function MobileStatusTabs({
  tab,
  onTabChange,
  byStatus,
}: {
  tab: GuestStatus;
  onTabChange: (tab: GuestStatus) => void;
  byStatus: Record<GuestStatus, GuestRow[]>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 md:hidden">
      {MOBILE_ORDER.map((key) => {
        const col = COLUMNS.find((c) => c.key === key)!;
        const on = tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            aria-pressed={on}
            className="rounded-xl border px-1.5 pt-2.5 pb-2 text-center transition-colors"
            style={{
              // An unselected tab is a plain white sheet on the linen ground;
              // only the selected one is washed in its lane's pigment.
              background: on ? col.bg : "var(--card)",
              borderColor: on ? col.border : "var(--border)",
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <span
                className="size-[7px] flex-none rounded-full"
                style={{ background: col.dot }}
              />
              <span
                className={cn("text-xs font-semibold", !on && "text-muted-foreground")}
                style={on ? { color: col.activeText } : undefined}
              >
                {col.short}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 block text-2xl leading-none tabular-nums",
                on ? "text-foreground" : "text-ink-faint",
              )}
            >
              {headcount(byStatus[key])}
            </span>
          </button>
        );
      })}
    </div>
  );
}
