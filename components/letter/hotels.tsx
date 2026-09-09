import { MapPin, Phone, Star } from 'lucide-react';

import { HandDrawnFrame } from '@/components/letter/hand-drawn-frame';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { letterButton } from '@/components/letter/letter-button';
import { BEAT } from '@/components/letter/motion-tokens';
import { SectionHeading } from '@/components/letter/section-heading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Recommended hotels — white section after Location. Same header pattern as
 * the other sections (font-script h2 + font-sans label), then a short
 * list of nearby places to stay as cards. Placeholder recommendations — edit
 * freely (names, blurbs and map links are dummy data).
 *
 * MOTION: two cards, one beat apart. This body genuinely IS a list, which is the
 * only case where the letter staggers siblings — and with two items the stagger
 * stays a stagger rather than becoming a queue. On `sm`+ they sit side by side,
 * so the second card arriving a beat late also reads left-to-right, the way the
 * pair is meant to be compared.
 */
const HOTELS = [
  {
    name: 'Palmwind Beach Hotel',
    rating: 4.5,
    tag: '5-min walk to the venue',
    blurb:
      'Steps from the ceremony, with sea-view rooms and a quiet garden pool — the easy choice if you’d rather not drive.',
    address: '12 Seaside Road, Barangay Anvy, Batangas',
    phone: '+63 917 123 4567',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Palmwind+Beach+Hotel+Anvy',
  },
  {
    name: 'Macatimbol Garden Inn',
    rating: 4,
    tag: '10-min drive',
    blurb:
      'A cosy, well-kept inn a short ride inland — great value, with breakfast included and free parking.',
    address: '48 Macatimbol Street, Barangay Anvy, Batangas',
    phone: '+63 918 765 4321',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Macatimbol+Garden+Inn',
  },
];

/**
 * Five ink stars, filled up to `value` (halves supported: the half star is a
 * filled star clipped to its left half over an outline star). Decorative on
 * its own — the numeric rating is announced by the sibling text.
 */
function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="relative block size-4">
            <Star className="size-4 text-ink/25" strokeWidth={1.5} />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="size-4 fill-ink text-ink"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function Hotels() {
  return (
    <section className="bg-paper py-section">
      {/* `relative z-20` so this content rides OVER the RSVP's dome instead of
          disappearing behind it. RSVP pulls itself up `-mt-section`, so this
          section's box carries on ~73px past the RSVP's top edge, and the RSVP
          is `z-10` with an opaque ground: everything painted in that band — a
          card's last line, a shadow, anything mid-entrance or mid-exit — was
          covered, which read as an invisible line cutting the animation off
          exactly where the dome begins.

          The z-index goes on the CONTENT, never on the section. This section is
          unpositioned, so its background stays down at the root level where the
          arch is drawn over it; raising the whole section would bring that
          full-width white rectangle up too and square off the arch's shoulders.
          Only the cards come forward. */}
      <div className="relative z-20 mx-auto max-w-[56rem] px-gutter text-center lg:max-w-[64rem]">
        <SectionHeading
          title="Where you can stay"
          kicker="We want to make your visit as comfortable as possible. Here are our recommended places to stay."
          kickerClassName="mx-auto max-w-sm"
        />

        {/* Capped to one readable column on mobile; from sm up the pair fills
            the section's measure, which widens again at lg. */}
        <div className="mx-auto mt-heading grid max-w-2xl gap-5 text-left sm:max-w-none sm:grid-cols-2 lg:gap-6">
          {HOTELS.map((h, i) => (
            // The reveal wrapper is the grid item now, so it takes the cell's
            // stretch and the Card flexes to fill it — the equal-height
            // behaviour the `sm:mt-auto` button row depends on is unchanged.
            <InViewReveal key={h.name} delay={i * BEAT} className="flex">
              {/* The 2px ink border is now DRAWN, not stroked by CSS: the
                  hand-drawn frame overlays the card's own edge and the border
                  utilities are gone (`ring-0` still kills the Card's default
                  hairline ring, which would otherwise draw a second, perfectly
                  straight outline underneath the wobbly one). `relative` is
                  what the frame absolutely positions against; `text-ink` is
                  what colours it, since the frame fills with currentColor. */}
              {/* `isolate` so the frame's `-z-10` paper stays behind THIS
                  card's content instead of escaping to the back of the
                  section. `bg-transparent` because the paper is now drawn by
                  the frame, clipped to the outline — Card's own `bg-card`
                  would repaint the full rectangle underneath it and fill in
                  the corners the drawing cuts away. `overflow-visible
                  rounded-none` for the same reason in reverse: Card ships
                  `overflow-hidden rounded-xl`, which clips a 12px arc off each
                  corner and shaves the frame's corner flicks.

                  The padding is the card's ORIGINAL padding, unchanged from
                  when this drew a CSS border. That only works because
                  Frame_1's stroke sits on the artwork's edge; Frame_2 was tried
                  here and its inset strokes forced extra padding on every card.
                  See hand-drawn-frame.tsx. */}
              <Card className="relative isolate flex flex-1 flex-col overflow-visible rounded-none bg-transparent px-2 py-8 text-ink ring-0 shadow-none sm:px-6">
                <HandDrawnFrame />
                <CardHeader>
                  <CardTitle className="font-sans text-ink">{h.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 font-sans tracking-wide">
                    <Stars value={h.rating} />
                    <span className="sr-only">{h.rating} out of 5 stars — </span>
                    {h.tag}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-body text-muted-foreground">{h.blurb}</p>

                  {/* Address and phone: caption-sized, same muted tone as the
                      blurb, one row each with the icon on the first line of
                      wrapped text. */}
                  <dl className="mt-3 flex flex-col gap-1 text-meta text-muted-foreground">
                    <div className="flex gap-1.5">
                      <dt className="pt-px">
                        <MapPin
                          aria-hidden
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        <span className="sr-only">Address</span>
                      </dt>
                      <dd>{h.address}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="pt-px">
                        <Phone
                          aria-hidden
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        <span className="sr-only">Contact number</span>
                      </dt>
                      <dd>
                        <a
                          href={`tel:${h.phone.replace(/\s+/g, '')}`}
                          className="underline decoration-ink/25 underline-offset-2 transition hover:text-ink hover:decoration-ink"
                        >
                          {h.phone}
                        </a>
                      </dd>
                    </div>
                  </dl>

                  {/* From sm up the cards sit side by side and stretch to equal
                      height, so `mt-auto` pins this row to the bottom of its
                      card: the two buttons stay level however many lines the
                      blurb or address above them run to. `pt-4` keeps a floor
                      of breathing room when the text nearly fills the card. */}
                  <div className="mt-4 sm:mt-auto sm:pt-4">
                    <a
                      href={h.maps}
                      target="_blank"
                      rel="noreferrer"
                      className={letterButton()}
                    >
                      <MapPin aria-hidden strokeWidth={1.5} />
                      Open in Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            </InViewReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
