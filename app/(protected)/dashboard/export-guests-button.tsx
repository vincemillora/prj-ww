"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GUEST_CSV_FILENAME,
  serializeGuestCsv,
} from "@/app/(protected)/dashboard/guest-csv";
import type { GuestRow } from "./guests-board";

/** Client-side CSV export of the full guest list (no extra route needed). */
export function ExportGuestsButton({
  rows,
  baseUrl,
}: {
  rows: GuestRow[];
  baseUrl: string;
}) {
  function exportCsv() {
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    const csv = serializeGuestCsv(rows, base);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = GUEST_CSV_FILENAME;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
      <Download data-icon="inline-start" /> Export CSV
    </Button>
  );
}
