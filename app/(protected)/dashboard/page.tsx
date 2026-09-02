import { requireUser, canEdit } from "@/lib/dal";
import { getGuestsWithLabels, getAllLabels } from "@/lib/data";
import { AccountMenu } from "@/components/dashboard/account-menu";
import { AccountGarland, NameSprig } from "@/components/dashboard/florals";
import { GuestsBoard, type GuestRow } from "./guests-board";
import { ExportGuestsButton } from "./export-guests-button";
import { GuestDialog } from "./guests/guest-dialog";
import { Countdown } from "@/components/countdown";
import { COUPLE } from "@/lib/wedding";

const OCCASION = "April 2027 · Guest responses";

export default async function DashboardPage() {
  const user = await requireUser();

  const [rows, allLabels] = await Promise.all([getGuestsWithLabels(), getAllLabels()]);

  const guestRows: GuestRow[] = rows.map((r) => ({
    id: r.id,
    token: r.token,
    name: r.name,
    maxGuests: r.maxGuests,
    adults: r.adults,
    kids: r.kids,
    status: r.status,
    email: r.email,
    phone: r.phone,
    adminNote: r.adminNote,
    snsAccounts: r.snsAccounts,
    guestNote: r.guestNote,
    dietary: r.dietary,
    dietaryOther: r.dietaryOther,
    respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
    labels: r.guestLabels.map((gl) => ({ id: gl.labelId, name: gl.label.name })),
    // The rest of the party, each with their own restrictions. Already ordered
    // adults-then-kids by the query in lib/data.ts.
    companions: r.companions.map((c) => ({
      kind: c.kind,
      position: c.position,
      name: c.name,
      dietary: c.dietary,
      dietaryOther: c.dietaryOther,
    })),
  }));

  const baseUrl = process.env.APP_URL ?? "";

  return (
    <div className="flex flex-col gap-5 pb-16 sm:gap-6 sm:pb-0">
      {/* Header */}
      {/* The couple's name leads and the page title follows, which inverts the
          imported design: Parisienne carries roughly half the visual weight of
          its nominal size, so a 38px script under a 42px sans read as a caption
          for the dashboard rather than as the letterhead it is. The script is
          now the larger of the two and still the quieter. A cartoon bride and
          groom used to stand beside it, drawn in the old wisteria palette;
          the letter's own sprig does that job in the letter's own hand. */}
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="font-script text-4xl leading-none text-(--script) sm:text-5xl">
              {COUPLE}
            </div>
            <NameSprig />
          </div>
          <h1 className="mt-1 text-3xl leading-[1.02] font-medium text-foreground sm:text-4xl">
            Manage RSVP
          </h1>
          <div className="label-caps mt-3 text-muted-foreground">{OCCASION}</div>
          <Countdown />
        </div>
        <div className="flex flex-col items-end gap-3.5">
          <div className="relative">
            <AccountGarland />
            <AccountMenu
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
                picture: user.picture,
              }}
              labels={allLabels}
            />
          </div>
          {/* Phones get a fixed bottom "Add guest" bar instead of header buttons. */}
          <div className="hidden flex-wrap items-center justify-end gap-2.5 sm:flex">
            <ExportGuestsButton rows={guestRows} baseUrl={baseUrl} />
            {canEdit(user.role) ? (
              <GuestDialog mode="create" labels={allLabels} />
            ) : null}
          </div>
        </div>
      </header>

      {/* Kanban board (imported design) — per-column vines + counts live inside. */}
      <GuestsBoard
        rows={guestRows}
        labels={allLabels}
        baseUrl={baseUrl}
        canEdit={canEdit(user.role)}
      />

      {/* Mobile: fixed bottom action bar (per hi-fi mobile design) */}
      {canEdit(user.role) ? (
        // `pb-[max(...)]` rather than a flat `pb-6`: this is the one element
        // anchored to a screen edge, so once the route declares
        // `viewport-fit=cover` it has to clear the home indicator itself, the
        // way the letter's VinylPlayer does.
        <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-background via-background/90 to-transparent px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:hidden">
          <GuestDialog mode="create" labels={allLabels} />
        </div>
      ) : null}
    </div>
  );
}
