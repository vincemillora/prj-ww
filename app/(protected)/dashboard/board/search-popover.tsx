"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Phone search: a round button that opens the field, rather than a full-width
 * input sitting in the toolbar.
 *
 * A Popover and not a DropdownMenu, even though the label filter beside it is a
 * menu. A menu owns the keyboard — typing into one drives its typeahead, not a
 * text field — so a search box inside one fights the primitive. Popover is the
 * one that just holds a form.
 *
 * The trigger fills in when a query is active: once the field is closed, the
 * round button is the only thing left on screen that can say the board is being
 * filtered, and the result count beside it says by how much.
 */
export function SearchPopover({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const active = query.trim() !== "";
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={active ? "default" : "outline"}
            className="size-11 rounded-full p-0"
            aria-label={active ? `Search guests, filtering by “${query}”` : "Search guests"}
          >
            <Search className="size-[18px]" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[min(18rem,calc(100vw-2rem))]">
        <label htmlFor="board-search" className="label-caps text-muted-foreground">
          Search guests
        </label>
        <Input
          id="board-search"
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Name, email, or phone…"
        />
        {active ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => onQueryChange("")}
          >
            <X data-icon="inline-start" /> Clear
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
