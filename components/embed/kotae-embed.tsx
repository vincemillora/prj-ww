/**
 * TEMPORARY — production smoke test of the Kotae chat embed.
 *
 * This is a throwaway trial: it points at the Kotae *test* environment and is
 * expected to be reverted once we have confirmed the widget renders in prod.
 * Revert by deleting this file and its single usage in `app/page.tsx`.
 *
 * Mounted ONLY on the home page. Do not lift this into `app/layout.tsx` — the
 * admin routes under `app/(protected)` show every guest's details, and a
 * third-party script has full access to the DOM it is loaded into.
 *
 * This is a server component on purpose, so both tags land in the prerendered
 * HTML. The vendor bundle builds its widget from `window.onload = ...`, so it
 * MUST be parsed before the window load event: injecting it from a client
 * effect (the obvious approach) registers that handler after load has already
 * fired, and the widget then never appears — silently, with no console error.
 *
 * It also reads its own tag back via `document.getElementById('kotae-embed-js')`
 * and parses the `src` and `data-cid` off it, so the id and both attributes
 * have to stay exactly as the vendor snippet writes them.
 */
const EMBED_ORIGIN = 'https://app.test.kotae.tokyotechies.co.jp';
const CLIENT_ID = '6aab85224e513504081229d2';

export function KotaeEmbed() {
  return (
    <>
      {/* No `precedence`: that would opt the tag into React's stylesheet
          hoisting, which under PPR re-inserts it from the client at hydration
          instead of shipping it in the prerendered shell. Rendered in place, it
          is in the HTML the parser sees, like the vendor snippet. */}
      <link
        id="kotae-embed-css"
        rel="stylesheet"
        href={`${EMBED_ORIGIN}/embed/index.min.css`}
      />
      <script
        id="kotae-embed-js"
        type="text/javascript"
        src={`${EMBED_ORIGIN}/embed/index.min.js`}
        data-cid={CLIENT_ID}
        defer
      />
    </>
  );
}
