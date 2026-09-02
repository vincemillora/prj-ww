"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Multi-select filter selection. `null` means "all checked" (the default and
 * the state we snap back to when the user unchecks the last item), so newly
 * created labels are included without any state bookkeeping.
 */
export type Selection = Set<string> | null;

export function toggleSelection(sel: Selection, allIds: string[], id: string): Selection {
  const next = new Set(sel ?? allIds);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  if (next.size === 0 || next.size === allIds.length) return null;
  return next;
}

export function FilterDropdown({
  prefix,
  options,
  selected,
  onToggle,
}: {
  prefix: string;
  options: { id: string; name: string }[];
  selected: Selection;
  onToggle: (id: string) => void;
}) {
  const summary =
    selected == null
      ? "All"
      : options
          .filter((o) => selected.has(o.id))
          .map((o) => o.name)
          .join(", ");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            // 44px on a phone, where it sits between two round 44px buttons and
            // is itself a touch target; the desktop keeps the design's 28px chip.
            className="h-11 rounded-full border-input px-4 text-sm font-normal text-muted-foreground sm:h-7 sm:px-3.5 sm:text-xs"
          >
            <span className="font-medium text-secondary-foreground">{prefix}:</span>
            <span className="max-w-40 truncate">{summary}</span>
            <ChevronDown className="size-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          {options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.id}
              checked={selected == null || selected.has(o.id)}
              onCheckedChange={() => onToggle(o.id)}
              closeOnClick={false}
            >
              {o.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
