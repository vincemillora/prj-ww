import Script from "next/script";

// Microsoft Clarity project id. This is a public, write-only tag id (it ships in
// the page source of every site using Clarity), so it lives in the repo rather
// than in an env var.
const CLARITY_PROJECT_ID = "yegm3ff50x";

/**
 * Loads Microsoft Clarity (session replay + heatmaps).
 *
 * Production only: local dev and preview deployments would otherwise fill the
 * recording list with our own sessions and skew the heatmaps for the guest
 * pages we actually want to read.
 *
 * `afterInteractive` (next/script's default) keeps the tag off the critical
 * path — the envelope reveal and the fonts paint first.
 */
export function Clarity() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}
