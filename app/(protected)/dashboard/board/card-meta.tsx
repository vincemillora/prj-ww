import type { ReactNode } from "react";

/**
 * Minimal card meta block: a small-caps label above its content, divided by a
 * hairline rule (no filled background) so the card stays elegant and quiet.
 * Shared by Contact and Notes.
 *
 * `label-caps` (app/globals.css) is the admin's one repeated typographic role;
 * this used to hand-write its own 9px / 0.14em / semibold, as did ten other
 * call sites that had all drifted apart.
 */
export function CardMeta({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-2.5 border-t border-rule pt-2">
      <div className="label-caps mb-1.5 text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
