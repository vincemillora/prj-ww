import { LetterLoadingScreen } from '@/components/letter/loading-screen';

/**
 * Home loading screen. It shares the invitation's backdrop rather than the
 * white paper it used to paint: the entry page is dark artwork, so a white
 * fallback flashed the wrong colour across the whole viewport before the
 * envelope arrived. Every other route carries its own loading.tsx, so this one
 * only ever stands in for `/`.
 *
 * "Getting" here, "Opening" on `/rsvp`: this screen precedes the envelope, so
 * nothing has been opened yet — the letter is still on its way.
 *
 * No `viewport` export: Next reads that only from `layout` and `page`, and
 * `app/page.tsx` already declares the full-bleed viewport this renders into.
 */
export default function HomeLoading() {
  return <LetterLoadingScreen caption="Getting your letter" />;
}
