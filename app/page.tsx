import type { Viewport } from 'next';
import { LaceBackdrop } from '@/components/letter/lace-backdrop';
import { EnvelopeInvitation } from '@/components/invitation/envelope-invitation';

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
    /* `viewport-bleed-stage` sizes this past the layout viewport so the drapery
       covers the strip iOS Safari keeps outside it — see app/globals.css. It
       owns the height, hence no height utility here. */
    <main className="invitation-page viewport-bleed-stage relative overflow-hidden bg-ink">
      <LaceBackdrop />
      <EnvelopeInvitation href={rsvpHref} />
    </main>
  );
}
