"use client";

import { Fragment, type DragEvent } from "react";
import type { Label as LabelRow } from "@/db/schema";
import { SNS_PLATFORMS, SNS_CONFIG } from "@/lib/sns";
import { dietaryList } from "@/lib/dietary";
import {
  companionDietary,
  companionLabel,
  sortCompanions,
} from "@/lib/companions";
import { SnsIcon } from "@/components/dashboard/sns-icon";

import { cn } from "@/lib/utils";
import { CardCornerFrame, type Corner } from "@/components/dashboard/florals";
import { GuestDialog } from "@/app/(protected)/dashboard/guests/guest-dialog";
import { DeleteGuestButton } from "@/app/(protected)/dashboard/guests/delete-guest-button";
import { CopyLinkButton } from "@/app/(protected)/dashboard/guests/copy-link-button";
import { CardMeta } from "@/app/(protected)/dashboard/board/card-meta";
import { partyBreakdown, partySize } from "@/app/(protected)/dashboard/board/headcount";
import {
  CARD_BORDER,
  CHIP_BORDER,
  CHIP_TEXT,
  FAINT,
  INK,
  MUT,
  RULE,
} from "@/app/(protected)/dashboard/board/tokens";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

function guestDialogData(row: GuestRow) {
  return {
    id: row.id,
    name: row.name,
    maxGuests: row.maxGuests,
    email: row.email,
    phone: row.phone,
    adminNote: row.adminNote,
    snsAccounts: row.snsAccounts,
    adults: row.adults,
    kids: row.kids,
    status: row.status,
    labelIds: row.labels.map((l) => l.id),
  };
}

// Guest card (shared by the desktop columns and the mobile tab list).
export function GuestCard({
  row,
  labels,
  baseUrl,
  canEdit,
  dragging,
  draggable,
  vineCorner,
  onDragStart,
  onDragEnd,
}: {
  row: GuestRow;
  labels: LabelRow[];
  baseUrl: string;
  canEdit: boolean;
  dragging?: boolean;
  draggable?: boolean;
  /** When set (mobile list), draw an alternating corner vine on the card. */
  vineCorner?: Corner;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const answered = row.status === "going";
  const breakdown = partyBreakdown(row.adults, row.kids);
  const snsEntries = SNS_PLATFORMS.map((platform) => ({
    platform,
    handle: row.snsAccounts?.[platform],
  })).filter((e): e is { platform: (typeof SNS_PLATFORMS)[number]; handle: string } =>
    Boolean(e.handle),
  );
  const hasContact = Boolean(row.phone || row.email || snsEntries.length);
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        // No overflow-hidden: the corner frame's stem sits on the border line
        // with a slight outward bleed (like the design) and must not be clipped.
        "relative rounded-[13px] border bg-card p-3.5 shadow-[0_1px_3px_rgba(61,51,43,0.06)] transition-opacity",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
      style={{ borderColor: CARD_BORDER }}
    >
      {vineCorner ? <CardCornerFrame corner={vineCorner} /> : null}
      <div className="relative z-1">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" style={{ color: INK }}>
            {row.name}
          </div>
        </div>
        <div
          className="flex-none font-sans text-[15px] text-stat-going"
          title={answered ? "Party size" : "Seat allotment"}
        >
          ×{partySize(row)}
        </div>
      </div>

      {row.labels.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {row.labels.map((l) => (
            <span
              key={l.id}
              className="rounded-md border px-2 py-0.5 text-[10.5px]"
              style={{ borderColor: CHIP_BORDER, color: CHIP_TEXT }}
            >
              {l.name}
            </span>
          ))}
        </div>
      ) : null}

      {breakdown || row.respondedAt ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
          {/* Reply head-count, spelled out (zero/none parts stay hidden). */}
          <span className="font-medium" style={{ color: CHIP_TEXT }}>
            {breakdown}
          </span>
          {row.respondedAt ? (
            <span style={{ color: FAINT }}>
              <span className="font-semibold tracking-wider uppercase">Replied</span>{" "}
              <span className="tabular-nums">{row.respondedAt.slice(0, 10)}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {hasContact ? (
        <CardMeta title="Contact">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[11.5px]">
            {row.phone ? (
              <>
                <dt style={{ color: MUT }}>Phone</dt>
                <dd className="truncate" style={{ color: INK }}>
                  {row.phone}
                </dd>
              </>
            ) : null}
            {row.email ? (
              <>
                <dt style={{ color: MUT }}>Email</dt>
                <dd className="truncate" style={{ color: INK }}>
                  {row.email}
                </dd>
              </>
            ) : null}
            {snsEntries.map(({ platform, handle }) => {
              const cfg = SNS_CONFIG[platform];
              return (
                <Fragment key={platform}>
                  <dt style={{ color: MUT }}>{cfg.label}</dt>
                  <dd className="truncate">
                    <a
                      href={cfg.url(handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${cfg.label}: ${handle}`}
                      className="inline-flex max-w-full items-center gap-1 truncate hover:underline"
                      style={{ color: INK }}
                    >
                      <SnsIcon platform={platform} className="size-3 shrink-0" />
                      <span className="truncate">{handle}</span>
                    </a>
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </CardMeta>
      ) : null}

      {row.dietary.length || row.dietaryOther ? (
        <CardMeta title="Dietary (invitee)">
          <p className="text-[11.5px] leading-relaxed" style={{ color: INK }}>
            {dietaryList(row.dietary, row.dietaryOther).join(", ")}
          </p>
        </CardMeta>
      ) : null}

      {/* Who else is coming, each with their own restrictions underneath. This is
          the seating/catering list, so a name with nothing under it means that
          person told us they need nothing — not that we failed to ask. */}
      {row.companions.length ? (
        <CardMeta title="Also coming">
          <ul className="flex flex-col gap-1.5">
            {sortCompanions(row.companions).map((c) => {
              const diet = companionDietary(c);
              return (
                <li key={`${c.kind}-${c.position}`}>
                  <p className="text-[11.5px] leading-relaxed" style={{ color: INK }}>
                    {c.name}
                    <span className="ml-1.5 text-[10px] tracking-[0.08em] uppercase" style={{ color: MUT }}>
                      {companionLabel(c.kind, c.position)}
                    </span>
                  </p>
                  {diet ? (
                    <p className="text-[11px] leading-relaxed" style={{ color: CHIP_TEXT }}>
                      {diet}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </CardMeta>
      ) : null}

      {row.guestNote ? (
        <CardMeta title="Guest note">
          <p className="text-[11.5px] leading-relaxed italic" style={{ color: INK }}>
            “{row.guestNote}”
          </p>
        </CardMeta>
      ) : null}

      {row.adminNote ? (
        <CardMeta title="Admin note">
          <p className="text-[11.5px] leading-relaxed" style={{ color: CHIP_TEXT }}>
            {row.adminNote}
          </p>
        </CardMeta>
      ) : null}

      <div
        className="mt-2.5 flex items-center justify-end gap-1 border-t pt-2"
        style={{ borderColor: RULE }}
      >
        <CopyLinkButton token={row.token} baseUrl={baseUrl} />
        {canEdit ? (
          <>
            <GuestDialog mode="edit" labels={labels} guest={guestDialogData(row)} />
            <DeleteGuestButton guestId={row.id} name={row.name} />
          </>
        ) : null}
      </div>
      </div>
    </div>
  );
}
