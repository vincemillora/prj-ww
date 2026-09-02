"use client";

import { Search, Sparkle } from "lucide-react";
import type { Label as LabelRow } from "@/db/schema";

import { Input } from "@/components/ui/input";
import {
  FilterDropdown,
  type Selection,
} from "@/app/(protected)/dashboard/board/filter-dropdown";
import { SearchPopover } from "@/app/(protected)/dashboard/board/search-popover";
import { GuestDialog } from "@/app/(protected)/dashboard/guests/guest-dialog";

/**
 * Toolbar: reply summary, label filter, search, and — on phones only — the add
 * button.
 *
 * The two breakpoints want different things from the same controls. A desktop
 * has room for a labelled search field sitting open, and its add button belongs
 * in the header beside Export CSV. A phone has neither: a full-width field ate
 * a third of the toolbar before anyone had searched for anything, and the add
 * button used to be a fixed bar pinned across the bottom of the screen, which
 * covered the last guest card and followed the admin down every scroll. Both
 * become round 44px buttons in one row, and the search field lives inside its
 * own popover until it is asked for.
 */
export function BoardToolbar({
  canEdit,
  filterActive,
  filteredCount,
  totalCount,
  pct,
  labels,
  labelSel,
  onToggleLabel,
  query,
  onQueryChange,
}: {
  canEdit: boolean;
  filterActive: boolean;
  filteredCount: number;
  totalCount: number;
  pct: number;
  labels: LabelRow[];
  labelSel: Selection;
  onToggleLabel: (id: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    // No rail or card of its own. On the white ground every control in here
    // already reads at its own tone against the page, and a bordered strip would
    // be chrome between the header and the board — the three tinted lanes below
    // are the only enclosure this screen needs.
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {canEdit ? (
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          {/* Ink, not a lane pigment. The three pigments say “state” on this
              surface, and a hint about dragging is not a state. */}
          <Sparkle className="size-3.5 text-muted-foreground" />
          Drag a guest between columns to update their RSVP
        </div>
      ) : null}
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-secondary-foreground">
        {filterActive
          ? `${filteredCount} of ${totalCount}`
          : `${totalCount} invited · ${pct}% replied`}
      </span>
      <div className="flex-1" />
      {/* `ml-auto` as well as the spacer: on a phone the summary chip and the
          controls do not fit on one line, and without it the group lands
          left-aligned on the second row with the whole right half empty. */}
      <div className="ml-auto flex items-center gap-2">
        {labels.length > 0 ? (
          <FilterDropdown
            prefix="Tags"
            options={labels.map((l) => ({ id: l.id, name: l.name }))}
            selected={labelSel}
            onToggle={onToggleLabel}
          />
        ) : null}

        {/* Phones: search behind a round button, then add. */}
        <div className="sm:hidden">
          <SearchPopover query={query} onQueryChange={onQueryChange} />
        </div>
        {canEdit ? (
          <div className="sm:hidden">
            <GuestDialog mode="create" labels={labels} compact />
          </div>
        ) : null}

        {/* Desktop: the field is open, and add lives in the page header. */}
        <div className="relative hidden w-56 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search guests…"
            className="pl-9"
            aria-label="Search guests"
          />
        </div>
      </div>
    </div>
  );
}
