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
    <main className="invitation-page relative h-lvh overflow-hidden bg-ink">
      <LaceBackdrop />
      <EnvelopeInvitation href={rsvpHref} />
    </main>
  );
}
