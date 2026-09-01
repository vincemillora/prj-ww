import { Suspense } from "react";
import Image from "next/image";
import { getGuestByToken } from "@/lib/data";
import { RSVP_DEADLINE_LABEL } from "@/lib/wedding";
import { RsvpForm } from "@/components/letter/rsvp-form";
import { RsvpReply } from "@/components/letter/rsvp-reply";
import { SectionHeading } from "@/components/letter/section-heading";
import { Dome } from "@/components/letter/dome";
import { RsvpEnvelope } from "@/components/letter/rsvp-envelope";
import { BanquetTableScene } from "@/components/letter/banquet-table-scene";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * RSVP — the closing section (after Location). Solid ink (`--ink`, matching Our
 * Story) sits behind a single white Card holding the reply form.
 *
 * A white dome opens the section: the paper of the Hotels section above carries
 * on into the ink as an arch, mirroring the white dome that opens the countdown
 * band and the ink dome that opens Our Story. Same curve as those two, inverted
 * — the shoulders sit on the section's top edge and the crown dips into the
 * ink. Deep 12rem (`h-48`, `180px`) on mobile; the shallow ~4rem hero curve on
 * `sm`+ (`sm:h-16`, `sm:rounded` 3rem). `pt-dome` clears the deepest point (it
 * shrinks with the dome on `sm`+), so the heading never rides into it.
 *
 * `-mt-section` makes the arch OVERLAP Hotels' bottom padding instead of
 * hanging below it, which is why the section carries `z-10`. Without it Hotels
 * paid for the seam twice — its own `pb-section` AND the arch's full 12rem —
 * leaving 264px of white under its last line. The arch is the tail now, and
 * Hotels adds nothing on top of it.
 *
 * The bite is ONE SECTION, not the 12rem the other domes take. This dome is not
 * like theirs: theirs are carved out of the section's own padding with a border
 * radius, so they cost no extra height, while this one is an overlay that adds
 * its full depth below the paper above. Biting 12rem here would pull the ink up
 * over the bottom corners of the Hotels cards — at a card's edge the arch is
 * already ~95px deep, so the shoulders, not the crown, are what decide how far
 * this can safely rise.
 *
 * `overflow-x-clip` is load-bearing, and is specifically NOT `overflow-hidden`.
 * The envelope canvas is 120.2px wider than this container by design, so on a
 * phone it runs ~40px past each edge and the lace layer another ~31px past the
 * right. That widens the layout viewport, which `body`'s own `overflow-x-hidden`
 * cannot undo: it leaves a blank strip down the right, and re-anchors every
 * `position: fixed` control to the wider viewport (the audio button sat ~51px
 * off-screen). `clip` cures both WITHOUT establishing a scroll container, so the
 * envelope's sticky layers still pin against the viewport — `hidden` would make
 * this section their scrollport and break the glide.
 *
 * Token-driven per docs/rsvp-spec.md: the personal invite link is `?id=<token>`.
 * The card shows one of three states — the form (pending reply), a thank-you
 * (already answered), or a note to open the personal link (no / unknown token).
 * Reading `searchParams` is a request-time API, so `RsvpBody` is dynamic and
 * lives under <Suspense> (the striped shell + card frame prerender; only the
 * body streams).
 */
export function Rsvp({ searchParams }: { searchParams: SearchParams }) {
  return (
    <section className="relative z-10 -mt-section overflow-x-clip bg-ink px-gutter pt-dome pb-section">
      <div
        aria-hidden
        data-slot="rsvp-background"
        className="absolute inset-0 z-0"
      >
        <Image
          src="/rsvp-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* The white dome. Full-bleed and flush with the top edge, so it reads as
          the paper above flowing down rather than as a shape floating on the
          ink. Shared `Dome` (components/letter/dome.tsx) — same curve as the one
          opening Our Story. */}
      <Dome direction="down" className="bg-paper" />
      {/* `max-w-2xl` (42rem), the same measure the FAQ cards use — the two are
          the only carded sections in the letter, so a 32rem reply card under a
          42rem FAQ card read as two different systems. */}
      <div className="relative z-10 mx-auto max-w-2xl">
        <SectionHeading tone="white" title="Will you join us?" kicker="RSVP" />

        {/* Double rule: a 2px white outline held 2px off the card, so the ink
            shows through the gap and the card reads as mounted on the section
            rather than dropped on it. `outline-offset` leaves the gap
            transparent, so it picks up the ink behind on its own. */}
        <RsvpEnvelope>
          <Card className="rounded-xl px-2 py-8 shadow-[0_28px_60px_-30px_color-mix(in_srgb,var(--ink)_55%,transparent)] outline-2 outline-offset-2 outline-paper sm:px-6">
            <Suspense fallback={<RsvpBodyFallback />}>
              <RsvpBody searchParams={searchParams} />
            </Suspense>
            {/* Closes every state of the card, so it is here rather than inside
                RsvpBody: the reply form, the thank-you and the "open your
                personal link" note all end on the same table. */}
            <BanquetTableScene />
          </Card>
        </RsvpEnvelope>

        {/* When we hope to hear back. Only shown to a guest who arrived on
            their personal link — without a token the card is asking them to go
            find that link, and a deadline for a form they cannot fill in yet is
            just pressure. Token-dependent, so it streams like the card body. */}
        <Suspense fallback={null}>
          <RsvpDeadline searchParams={searchParams} />
        </Suspense>

      </div>
    </section>
  );
}

/**
 * The reply-by note. Renders nothing unless the `?id=<token>` in the URL
 * resolves to a guest, which is the same test `RsvpBody` uses to decide between
 * the form and the "reply by your personal link" note.
 */
async function RsvpDeadline({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).id;
  const token = Array.isArray(raw) ? raw[0] : raw;
  // `getGuestByToken` is a `'use cache'` query, so this shares RsvpBody's read
  // rather than hitting the database twice.
  const guest = token ? await getGuestByToken(token) : undefined;
  if (!guest) return null;

  // A guest who has already answered has nothing left to send, so asking for
  // their response reads as though we lost it. They get the same date as the
  // one we are working towards, plus the one thing we still need from them.
  const answered = guest.status !== "pending";

  return (
    <p className="mt-6 text-center font-sans text-body text-paper">
      To help us prepare everything with love and care, making sure the day is
      as unforgettable for you as it will be for us, we are hoping to{" "}
      {answered ? "finalize the plans" : "receive your response"} by{" "}
      {RSVP_DEADLINE_LABEL}.
      {answered
        ? " Please let us know if there are any changes beforehand."
        : ""}
    </p>
  );
}

/** Skeleton shown while the token-dependent body streams in. */
function RsvpBodyFallback() {
  return (
    <CardContent
      className="py-10 text-center text-muted-foreground"
      aria-hidden
    >
      <p className="font-sans text-subhead">Loading your invitation…</p>
    </CardContent>
  );
}

/** Resolves the `?id=<token>` guest and renders the matching state. Dynamic. */
async function RsvpBody({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).id;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const guest = token ? await getGuestByToken(token) : undefined;

  // No token, or a token we don't recognise — the reply is by personal link.
  if (!guest) {
    return (
      <CardContent className="py-6 text-center">
        <p className="font-sans text-subhead text-foreground">
          Reply by your personal link
        </p>
        <p className="mx-auto mt-3 max-w-[24rem] font-sans text-meta">
          This RSVP is by invitation. Please open the personal link we sent you
          to let us know if you can make it.
        </p>
      </CardContent>
    );
  }

  // Already answered — don't offer to overwrite (mirrors submitRsvp's guard).
  // Their own reply is read back to them instead of a bare thank-you, so the
  // link stays useful: it is where they check what they told us.
  if (guest.status !== "pending") {
    return (
      <CardContent className="py-6">
        <RsvpReply
          guestName={guest.name}
          reply={{
            status: guest.status,
            adults: guest.adults,
            kids: guest.kids,
            dietary: guest.dietary,
            dietaryOther: guest.dietaryOther,
            guestNote: guest.guestNote,
            respondedAt: guest.respondedAt,
            companions: guest.companions,
          }}
        />
      </CardContent>
    );
  }

  // Pending — show the reply form.
  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="font-sans">
          {guest.name ? `Dear ${guest.name},` : "Kindly reply"}
        </CardTitle>
        <CardDescription className="font-sans">
          We&rsquo;d be honoured to have you celebrate with us.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RsvpForm token={guest.token} maxGuests={guest.maxGuests} />
      </CardContent>
    </>
  );
}
