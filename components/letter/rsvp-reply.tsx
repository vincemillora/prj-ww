import { Baby, UserRound } from 'lucide-react';

import { cn } from '@/lib/utils';
import { dietaryList } from '@/lib/dietary';
import {
  companionDietary,
  companionLabel,
  sortCompanions,
  type CompanionSummary,
} from '@/lib/companions';
import { fieldLabel } from '@/components/letter/letter-type';

/** A reply as it is read back — whether it came from the database or was just sent. */
export type ReplySummary = {
  status: 'going' | 'not_going';
  adults: number | null;
  kids: number | null;
  dietary: string[];
  dietaryOther: string | null;
  guestNote: string | null;
  respondedAt?: Date | string | null;
  companions: CompanionSummary[];
};

/** "2 adults · 1 kid" — empty parts dropped. */
function partyLine(adults: number | null, kids: number | null): string {
  const parts: string[] = [];
  if (adults) parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (kids) parts.push(`${kids} kid${kids === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** One labelled line of the read-back. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className={cn(fieldLabel, 'text-center')}>{label}</p>
      <p className="text-center text-body">{children}</p>
    </div>
  );
}

/**
 * A reply, read back to the guest who gave it.
 *
 * Used in two places so the two can never drift: the letter shows it to a guest
 * who has already answered (from the database), and the form swaps to it the
 * moment a reply is accepted (from what was just typed). Replies cannot be
 * edited — docs/rsvp-spec.md §12 — so this is deliberately a record, not a form:
 * it states what was received and how to reach the couple if it was wrong.
 */
export function RsvpReply({
  reply,
  guestName,
}: {
  reply: ReplySummary;
  guestName?: string | null;
}) {
  const going = reply.status === 'going';
  const party = partyLine(reply.adults, reply.kids);
  const ownDietary = dietaryList(reply.dietary, reply.dietaryOther).join(', ');
  const companions = sortCompanions(reply.companions);

  return (
    <div role="status" className="py-2">
      <div className="text-center">
        {/* One heading for both answers: the reply itself already says which
            one it was, and a different headline per status made the decline
            read as the consolation version of the acceptance. */}
        <p className="font-script text-title">Thank you for telling us</p>
        <p className="mx-auto mt-3 max-w-[26rem] font-sans text-meta">
          {going
            ? `Your reply is in${guestName ? `, ${guestName}` : ''} — we cannot wait to celebrate with you.`
            : `We will miss you${guestName ? `, ${guestName}` : ''}, and we are glad you let us know.`}
          {reply.respondedAt ? ` Received ${formatDate(reply.respondedAt)}.` : ''}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-5 border-t border-ink/20 pt-6">
        <Row label="Your reply">
          {going ? 'Joyfully accepted' : 'Regretfully declined'}
        </Row>

        {going && party ? <Row label="Your party">{party}</Row> : null}

        {going && companions.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className={cn(fieldLabel, 'text-center')}>Coming with you</p>
            <ul className="flex flex-col gap-2">
              {companions.map((c) => {
                const Icon = c.kind === 'kid' ? Baby : UserRound;
                const diet = companionDietary(c);
                return (
                  <li
                    key={`${c.kind}-${c.position}`}
                    className="rounded-xl border border-ink/20 px-4 py-3 text-center"
                  >
                    <p className="flex items-center justify-center gap-2 text-body">
                      <Icon
                        aria-hidden
                        strokeWidth={1.5}
                        className="size-4 shrink-0"
                      />
                      {c.name}
                      <span className="sr-only">
                        {' — '}
                        {companionLabel(c.kind, c.position)}
                      </span>
                    </p>
                    {diet ? (
                      <p className="mt-1 font-sans text-meta">
                        {diet}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {going && ownDietary ? (
          <Row label="Your allergies">{ownDietary}</Row>
        ) : null}

        {reply.guestNote ? (
          <Row label="Your note">
            <span className="italic">&ldquo;{reply.guestNote}&rdquo;</span>
          </Row>
        ) : null}
      </div>

      <p className="mt-7 border-t border-ink/20 pt-6 text-center font-sans text-meta">
        If any of this needs changing, message us and we will put it right.
      </p>
    </div>
  );
}
