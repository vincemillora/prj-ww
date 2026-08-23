import { OpeningBackdrop } from '@/components/letter/opening-backdrop';
// EnvelopeGallery is parked — kept in components/letter/envelope-gallery.tsx for
// reuse later, intentionally not mounted here.
// import { EnvelopeGallery } from '@/components/letter/envelope-gallery';
import { Prenup } from '@/components/letter/prenup';
import { DayItself } from '@/components/letter/day-itself';
import { AttireGuide } from '@/components/letter/attire-guide';
import { Location } from '@/components/letter/location';
import { Hotels } from '@/components/letter/hotels';
import { Rsvp } from '@/components/letter/rsvp';
import { Gifts } from '@/components/letter/gifts';
import { Faq } from '@/components/letter/faq';
import { OurStory } from '@/components/letter/our-story';
import { WelcomeBand } from '@/components/letter/welcome-band';
import { FloralBorderPeonies } from '@/components/letter/floral-border-peonies';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * The long-form wedding site content. Each section lives in
 * components/letter/; this file only composes them. Hero, OurStory and
 * DayItself are full-bleed and overlap each other (see the -mt/z-index notes
 * in those files). It is ordinary document flow and scrolls natively, so
 * sections can be added/reordered freely. `searchParams` is forwarded (not
 * awaited). The former envelope intro (components/letter/envelope-reveal.tsx) no
 * longer wraps this content but is kept for reuse.
 *
 * `letter-theme` (app/globals.css) scopes the home page to its two-colour
 * four-role palette — `--ink` and `--paper` bases, `--botanical` and `--lichen`
 * accents for controls — by re-pointing the shadcn tokens for this
 * subtree only. The dashboard keeps the wisteria & fig palette.
 */
export function WeddingLetter({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="letter-theme bg-paper text-ink">
      {/* The hero, welcome, and story remain sibling sections so
          their spacing follows the letter rhythm. */}
      <OpeningBackdrop />
      <WelcomeBand />
      <OurStory />
      {/* <EnvelopeGallery /> parked here — reinsert to bring the keepsake
          envelope back between Our Story and Prenup. */}
      <Prenup />
      <DayItself />
      <AttireGuide />
      <Location />
      <Hotels />
      <Rsvp searchParams={searchParams} />
      <FloralBorderPeonies />
      <Gifts />
      <Faq />
    </div>
  );
}
