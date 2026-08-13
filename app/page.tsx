import { WeddingLetter } from '@/components/letter/wedding-letter';
import { MotionProvider } from '@/components/letter/motion-provider';
import { VinylPlayer } from '@/components/letter/vinyl-player';

/**
 * Landing page — the wedding site contents, rendered directly.
 *
 * The `searchParams` promise (carrying the `?id=<token>` invite link) is
 * forwarded, unawaited, into the closing RSVP section, which awaits it under
 * its own <Suspense>. The page itself reads nothing request-time, so the shell
 * stays statically prerendered (Cache Components / PPR) and only the RSVP body
 * streams in. See docs/rsvp-spec.md.
 *
 * The envelope intro is retired: components/letter/envelope-reveal.tsx is
 * kept for reuse but no longer wraps the content.
 */
export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <MotionProvider>
      <main>
        <WeddingLetter searchParams={searchParams} />
        {/* Floating music player: fixed to the viewport's bottom-right so it
            follows the scroll across every section. Above page content (z-50),
            clear of the safe-area inset on notched phones. */}
        <VinylPlayer
          className="!fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50"
          size="min(18vw, 4.5rem)"
        />
      </main>
    </MotionProvider>
  );
}
