import { LetterLoadingScreen } from '@/components/letter/loading-screen';

/**
 * The bridge between the invitation and the letter. See LetterLoadingScreen.
 *
 * No `viewport` export: Next reads that only from `layout` and `page`, and
 * `app/rsvp/page.tsx` already declares the full-bleed viewport this renders
 * into.
 */
export default function RsvpLoading() {
  return <LetterLoadingScreen caption="Opening your letter" />;
}
