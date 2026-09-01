import type { Viewport } from 'next';
import Image from 'next/image';
import heroBackground from '@/public/lace-bg.png';
import envelopeBack from '@/public/index-invitation/back.png';
import envelopeFront from '@/public/index-invitation/front.png';
import laceCollar from '@/public/index-invitation/lace.png';

export const viewport: Viewport = {
  viewportFit: 'cover',
};

/** A quiet invitation entry point that carries an invite code into the RSVP. */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await searchParams;
  const inviteCode = Array.isArray(id) ? id[0] : id;
  const rsvpHref = inviteCode ? `/rsvp?id=${encodeURIComponent(inviteCode)}` : '/rsvp';

  return (
    <main className="invitation-page relative h-lvh overflow-hidden bg-ink">
      <Image
        src={heroBackground}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/30" />

      <div className="relative flex h-dvh flex-col items-center justify-center px-gutter text-center">
        <div className="text-paper">
          <p className="font-sans text-label uppercase tracking-[0.08em]">you have received a letter from</p>
          <p className="font-script text-title">Vince and Kc</p>
        </div>
        <a
          href={rsvpHref}
          aria-label="Open RSVP invitation"
          className="relative block w-[min(96vw,34rem)] aspect-[468/326] outline-none transition-transform duration-1000 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
        >
          {/* All three source layers scale from this fixed Canva frame. Keep the
              lace's width and offset percentage-based; breakpoint overrides
              would break its approved alignment with the front flap. */}
          <Image src={envelopeBack} alt="" fill className="object-contain" />
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src={laceCollar}
              alt=""
              className="absolute -left-[8.5%] -top-[74%] h-auto w-[118%] max-w-none"
            />
          </div>
          <Image
            src={envelopeFront}
            alt=""
            fill
            className="pointer-events-none object-contain"
          />
          <div className="pointer-events-none absolute inset-x-0 top-[15%] z-10 mx-auto aspect-square w-[35%]">
            <Image
              src="/couple-logo-rustic.svg"
              alt=""
              fill
              sizes="(max-width: 45rem) 28vw, 12.5rem"
              className="object-contain"
            />
          </div>
        </a>
        <p className="mt-6 font-sans text-label text-paper">Tap the envelope to open the letter</p>
      </div>
    </main>
  );
}
