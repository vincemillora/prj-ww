'use client';

import { useEffect } from 'react';

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
 * The tags are injected from an effect rather than rendered as JSX so that the
 * ids the vendor's snippet expects (`kotae-embed-js` / `kotae-embed-css`) are
 * preserved verbatim and each tag is inserted exactly once, including under
 * React StrictMode's double-invoked effects in development.
 */
const SCRIPT_ID = 'kotae-embed-js';
const STYLE_ID = 'kotae-embed-css';

const SCRIPT_SRC = 'https://app.test.kotae.tokyotechies.co.jp/embed/index.min.js';
const STYLE_HREF = 'https://app.test.kotae.tokyotechies.co.jp/embed/index.min.css';
const CLIENT_ID = '6aab85224e513504081229d2';

export function KotaeEmbed() {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('link');
      style.id = STYLE_ID;
      style.rel = 'stylesheet';
      style.href = STYLE_HREF;
      document.head.appendChild(style);
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.src = SCRIPT_SRC;
      script.defer = true;
      script.dataset.cid = CLIENT_ID;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
