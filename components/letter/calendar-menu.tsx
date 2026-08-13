"use client";

import { CalendarPlus, ChevronDown } from "lucide-react";

import {
  letterButton,
  type LetterButtonVariants,
} from "@/components/letter/letter-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { WEDDING_EVENT } from "@/lib/wedding";

function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function escapeIcs(value: string) {
  return value.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");
}

const ICS_FILENAME = `${WEDDING_EVENT.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")}.ics`;

const GOOGLE_URL = `https://calendar.google.com/calendar/render?${new URLSearchParams(
  {
    action: "TEMPLATE",
    text: WEDDING_EVENT.title,
    dates: `${stamp(WEDDING_EVENT.start)}/${stamp(WEDDING_EVENT.end)}`,
    location: WEDDING_EVENT.location,
    details: WEDDING_EVENT.details,
  },
)}`;

const OUTLOOK_URL = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(
  {
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: WEDDING_EVENT.title,
    body: WEDDING_EVENT.details,
    location: WEDDING_EVENT.location,
    startdt: new Date(WEDDING_EVENT.start).toISOString(),
    enddt: new Date(WEDDING_EVENT.end).toISOString(),
    allday: "false",
  },
)}`;

function buildIcs() {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-letter//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stamp(WEDDING_EVENT.start)}-wedding@${window.location.hostname}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(WEDDING_EVENT.start)}`,
    `DTEND:${stamp(WEDDING_EVENT.end)}`,
    `SUMMARY:${escapeIcs(WEDDING_EVENT.title)}`,
    `LOCATION:${escapeIcs(WEDDING_EVENT.location)}`,
    `DESCRIPTION:${escapeIcs(WEDDING_EVENT.details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs() {
  const url = URL.createObjectURL(
    new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = ICS_FILENAME;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function CalendarMenu({
  className,
  variant,
  open,
  onOpenChange,
}: {
  className?: string;
  variant: LetterButtonVariants["variant"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className={cn(letterButton({ variant }), className)}
      >
        <CalendarPlus aria-hidden strokeWidth={1.5} />
        Add to calendar
        <ChevronDown aria-hidden strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="letter-menu min-w-56 text-left"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => window.open(GOOGLE_URL, "_blank", "noopener")}
          >
            Google Calendar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => window.open(OUTLOOK_URL, "_blank", "noopener")}
          >
            Outlook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadIcs}>
            Apple Calendar / other (.ics)
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
