"use client";

import {
  useMemo,
  useOptimistic,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import type { Label as LabelRow } from "@/db/schema";

import { Button } from "@/components/ui/button";
import { type Corner } from "@/components/dashboard/florals";
import {
  filterGuests,
  groupGuestsByStatus,
  responseProgress,
} from "@/app/(protected)/dashboard/board/board-data";
import { BoardToolbar } from "@/app/(protected)/dashboard/board/board-toolbar";
import { ColumnStats } from "@/app/(protected)/dashboard/board/column-stats";
import {
  toggleSelection,
  type Selection,
} from "@/app/(protected)/dashboard/board/filter-dropdown";
import { GuestCard } from "@/app/(protected)/dashboard/board/guest-card";
import { MobileStatusTabs } from "@/app/(protected)/dashboard/board/mobile-status-tabs";
import { StatusColumn } from "@/app/(protected)/dashboard/board/status-column";
import { COLUMNS, PAGE } from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow, GuestStatus } from "@/app/(protected)/dashboard/board/types";
import { moveGuestStatus } from "./guests/actions";

export type { GuestRow, GuestStatus } from "@/app/(protected)/dashboard/board/types";

// Corner cycled per mobile card so each item's vine alternates around the stack.
const CARD_VINE_CYCLE: Corner[] = ["tl", "tr", "br", "bl"];

/**
 * Kanban guest board (imported design): desktop/tablet get three drag-and-drop
 * status columns; phones get status tabs over the same card list (no drag).
 * Search and the label filter apply to every column/tab.
 */
export function GuestsBoard({
  rows,
  labels,
  baseUrl,
  canEdit,
}: {
  rows: GuestRow[];
  labels: LabelRow[];
  baseUrl: string;
  /** Viewers get a read-only board — no drag, no edit/delete controls. */
  canEdit: boolean;
}) {
  const [query, setQuery] = useState("");
  const [labelSel, setLabelSel] = useState<Selection>(null);
  const [tab, setTab] = useState<GuestStatus>("going");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<GuestStatus | null>(null);
  const [limits, setLimits] = useState<Record<GuestStatus, number>>({
    pending: PAGE,
    going: PAGE,
    not_going: PAGE,
  });
  const [, startTransition] = useTransition();

  // Drag moves land instantly; the server action + tag invalidation reconcile.
  const [optimisticRows, applyMove] = useOptimistic(
    rows,
    (state, move: { id: string; status: GuestStatus }) =>
      state.map((r) => (r.id === move.id ? { ...r, status: move.status } : r)),
  );

  const labelIds = useMemo(() => labels.map((l) => l.id), [labels]);

  const filtered = useMemo(
    () => filterGuests(optimisticRows, query, labelSel),
    [optimisticRows, query, labelSel],
  );

  const byStatus = useMemo(() => groupGuestsByStatus(filtered), [filtered]);

  const filterActive = query.trim() !== "" || labelSel != null;
  const pct = responseProgress(optimisticRows);

  function moveTo(id: string, status: GuestStatus) {
    startTransition(async () => {
      applyMove({ id, status });
      await moveGuestStatus(id, status);
    });
  }

  function dropHandlers(key: GuestStatus) {
    if (!canEdit) return {};
    return {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        if (overKey !== key) setOverKey(key);
      },
      onDragLeave: (e: DragEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverKey(null);
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const id = draggingId;
        setDraggingId(null);
        setOverKey(null);
        if (id && optimisticRows.find((r) => r.id === id)?.status !== key) moveTo(id, key);
      },
    };
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: drag hint + summary + label filter + search */}
      <BoardToolbar
        canEdit={canEdit}
        filterActive={filterActive}
        filteredCount={filtered.length}
        totalCount={rows.length}
        pct={pct}
        labels={labels}
        labelSel={labelSel}
        onToggleLabel={(id) => setLabelSel((s) => toggleSelection(s, labelIds, id))}
        query={query}
        onQueryChange={setQuery}
      />

      {/* Mobile: status tabs */}
      <MobileStatusTabs tab={tab} onTabChange={setTab} byStatus={byStatus} />

      {/* Mobile: active tab card list — vines live on the cards themselves
          (CardCornerFrame per item), never floating on this borderless list. */}
      <div className="relative flex flex-col gap-3 md:hidden">
        <div className="relative z-1 flex flex-col gap-3">
        <ColumnStats size="sm" cards={byStatus[tab]} showCounts={tab === "going"} />
        {byStatus[tab].length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-faint italic">
            {filterActive ? "No matches" : "No guests here yet"}
          </div>
        ) : (
          byStatus[tab]
            .slice(0, limits[tab])
            .map((row, i) => (
              <GuestCard
                key={row.id}
                row={row}
                labels={labels}
                baseUrl={baseUrl}
                canEdit={canEdit}
                vineCorner={CARD_VINE_CYCLE[i % CARD_VINE_CYCLE.length]}
              />
            ))
        )}
        {byStatus[tab].length > limits[tab] ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimits((l) => ({ ...l, [tab]: l[tab] + PAGE }))}
          >
            Show {Math.min(PAGE, byStatus[tab].length - limits[tab])} more
          </Button>
        ) : null}
        </div>
      </div>

      {/* Desktop / tablet: kanban columns */}
      <div className="hidden gap-5 md:grid md:grid-cols-3 lg:gap-6">
        {COLUMNS.map((col) => (
          <StatusColumn
            key={col.key}
            col={col}
            cards={byStatus[col.key]}
            over={overKey === col.key}
            dropProps={dropHandlers(col.key)}
            labels={labels}
            baseUrl={baseUrl}
            canEdit={canEdit}
            filterActive={filterActive}
            draggingId={draggingId}
            limit={limits[col.key]}
            onShowMore={() => setLimits((l) => ({ ...l, [col.key]: l[col.key] + PAGE }))}
            onCardDragStart={(e, id) => {
              if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
              setDraggingId(id);
            }}
            onCardDragEnd={() => {
              setDraggingId(null);
              setOverKey(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}
