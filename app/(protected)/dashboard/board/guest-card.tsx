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
import { GuestDialog } from "@/app/(protected)/dashboard/guests/guest-dialog";
import { DeleteGuestButton } from "@/app/(protected)/dashboard/guests/delete-guest-button";
import { CopyLinkButton } from "@/app/(protected)/dashboard/guests/copy-link-button";
import { CardMeta } from "@/app/(protected)/dashboard/board/card-meta";
import { partyBreakdown, partySize } from "@/app/(protected)/dashboard/board/headcount";
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
  onDragStart,
  onDragEnd,
}: {
  row: GuestRow;
  labels: LabelRow[];
  baseUrl: string;
  canEdit: boolean;
  dragging?: boolean;
  draggable?: boolean;
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
        "relative rounded-[13px] border bg-card p-3.5 transition-opacity",
        // Espresso-tinted, two-part: a tight contact shadow so the card sits ON
        // its lane, and a wider one so it lifts off it. The old value was a
        // single flat rgba(61,51,43,.06) from the imported design — a colour
        // with no relationship to the ink now under it.
        "shadow-[0_1px_1px_color-mix(in_srgb,var(--ink)_8%,transparent),0_3px_8px_color-mix(in_srgb,var(--ink)_5%,transparent)]",
        draggable && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="relative z-1">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{row.name}</div>
        </div>
        {/* Full ink, not the attending green it used to carry: the lane already
            says what the status is, and a going-coloured count on a declined
            card was saying the opposite. */}
        <div
          className="flex-none text-base tabular-nums text-foreground"
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
              className="rounded-md border border-chip-edge px-2 py-0.5 text-2xs text-secondary-foreground"
            >
              {l.name}
            </span>
          ))}
        </div>
      ) : null}

      {breakdown || row.respondedAt ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-2xs">
          {/* Reply head-count, spelled out (zero/none parts stay hidden). */}
          <span className="font-medium text-secondary-foreground">{breakdown}</span>
          {row.respondedAt ? (
            <span className="text-ink-faint">
              <span className="label-caps">Replied</span>{" "}
              <span className="tabular-nums">{row.respondedAt.slice(0, 10)}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {hasContact ? (
        <CardMeta title="Contact">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-2xs">
            {row.phone ? (
              <>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="truncate text-foreground">{row.phone}</dd>
              </>
            ) : null}
            {row.email ? (
              <>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate text-foreground">{row.email}</dd>
              </>
            ) : null}
            {snsEntries.map(({ platform, handle }) => {
              const cfg = SNS_CONFIG[platform];
              return (
                <Fragment key={platform}>
                  <dt className="text-muted-foreground">{cfg.label}</dt>
                  <dd className="truncate">
                    <a
                      href={cfg.url(handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${cfg.label}: ${handle}`}
                      // `py-1 -my-1` grows the hit area to 24px without moving
                      // the row: at the card's 11px type these links measured
                      // 16px tall, under WCAG 2.5.8's minimum target size.
                      className="inline-flex max-w-full items-center gap-1 truncate py-1 -my-1 text-foreground underline-offset-2 hover:underline"
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
          <p className="text-2xs leading-relaxed text-foreground">
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
                  <p className="text-2xs leading-relaxed text-foreground">
                    {c.name}
                    <span className="label-caps ml-1.5 text-muted-foreground">
                      {companionLabel(c.kind, c.position)}
                    </span>
                  </p>
                  {diet ? (
                    <p className="text-2xs leading-relaxed text-secondary-foreground">{diet}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </CardMeta>
      ) : null}

      {row.guestNote ? (
        <CardMeta title="Guest note">
          <p className="text-2xs leading-relaxed text-foreground italic">“{row.guestNote}”</p>
        </CardMeta>
      ) : null}

      {row.adminNote ? (
        <CardMeta title="Admin note">
          <p className="text-2xs leading-relaxed text-secondary-foreground">{row.adminNote}</p>
        </CardMeta>
      ) : null}

      <div className="mt-2.5 flex items-center justify-end gap-1 border-t border-rule pt-2">
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
