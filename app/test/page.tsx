import Script from "next/script";

// Sandbox page for the Kotae embed widget (test environment).
export default function TestPage() {
  return (
    <>
      {/* React 19 hoists precedence-tagged stylesheets into <head>. */}
      <link
        id="kotae-embed-css"
        rel="stylesheet"
        href="https://app.test.kotae.tokyotechies.co.jp/embed/index.min.css"
        precedence="default"
      />
      <Script
        id="kotae-embed-js"
        src="https://app.test.kotae.tokyotechies.co.jp/embed/index.min.js"
        data-cid="6aa8b274482c965379e0c4ed"
        strategy="afterInteractive"
      />
    </>
  );
}
