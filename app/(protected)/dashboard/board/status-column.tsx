"use client";

import type { DragEvent } from "react";
import type { Label as LabelRow } from "@/db/schema";

import { Button } from "@/components/ui/button";
import { ColumnStats } from "@/app/(protected)/dashboard/board/column-stats";
import { ColumnVine } from "@/app/(protected)/dashboard/board/column-vine";
import { GuestCard } from "@/app/(protected)/dashboard/board/guest-card";
import { INK, PAGE, type BoardColumn } from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

// Desktop / tablet kanban column: a tinted drag-and-drop status lane.
export function StatusColumn({
  col,
  cards,
  over,
  dropProps,
  labels,
  baseUrl,
  canEdit,
  filterActive,
  draggingId,
  limit,
  onShowMore,
  onCardDragStart,
  onCardDragEnd,
}: {
  col: BoardColumn;
  cards: GuestRow[];
  over: boolean;
  /** Drop-target wiring from the parent (empty object for read-only viewers). */
  dropProps: {
    onDragOver?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
  };
  labels: LabelRow[];
  baseUrl: string;
  canEdit: boolean;
  filterActive: boolean;
  draggingId: string | null;
  limit: number;
  onShowMore: () => void;
  onCardDragStart: (e: DragEvent, id: string) => void;
  onCardDragEnd: () => void;
}) {
  const shown = cards.slice(0, limit);
  return (
    <div
      {...dropProps}
      className="relative flex flex-col rounded-2xl border border-dashed px-4 pt-4 pb-5 transition-colors"
      style={{
        background: over ? col.hoverBg : col.bg,
        borderColor: over ? col.dot : col.border,
      }}
    >
      <ColumnVine status={col.key} />
      <div className="relative z-1 flex flex-1 flex-col">
      <div className="flex items-center gap-2.5 px-1">
        <span
          className="size-[9px] flex-none rounded-full"
          style={{ background: col.dot }}
        />
        <h2 className="font-sans text-[19px] leading-none" style={{ color: INK }}>
          {col.label}
        </h2>
      </div>
      <div
        className="mx-1 mt-2 mb-3 h-0.5 rounded-full opacity-50"
        style={{ background: col.dot }}
      />
      <div className="px-1 pb-4">
        <ColumnStats cards={cards} showCounts={col.key === "going"} />
      </div>
      <div className="flex flex-col gap-3">
        {shown.map((row) => (
          <GuestCard
            key={row.id}
            row={row}
            labels={labels}
            baseUrl={baseUrl}
            canEdit={canEdit}
            draggable={canEdit}
            dragging={draggingId === row.id}
            onDragStart={(e) => onCardDragStart(e, row.id)}
            onDragEnd={onCardDragEnd}
          />
        ))}
      </div>
      {cards.length === 0 ? (
        <div
          className="py-7 text-center text-[12.5px] italic"
          style={{ color: "#c4b7a0" }}
        >
          {filterActive ? "No matches" : canEdit ? "Drop guests here" : "No guests"}
        </div>
      ) : null}
      {cards.length > limit ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 bg-card/60"
          onClick={onShowMore}
        >
          Show {Math.min(PAGE, cards.length - limit)} more
        </Button>
      ) : null}
      </div>
    </div>
  );
}
