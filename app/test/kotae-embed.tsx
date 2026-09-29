"use client";

import Script from "next/script";

// The Kotae embed only boots from `window.onload`. next/script injects it after
// the page's load event has already fired, so kick the handler manually.
export function KotaeEmbed() {
  return (
    <Script
      id="kotae-embed-js"
      src="https://app.test.kotae.tokyotechies.co.jp/embed/index.min.js"
      data-cid="6aa8b274482c965379e0c4ed"
      strategy="afterInteractive"
      onLoad={() => {
        if (document.readyState === "complete" && typeof window.onload === "function") {
          window.onload(new Event("load"));
        }
      }}
    />
  );
}
