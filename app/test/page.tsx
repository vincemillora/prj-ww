import { KotaeEmbed } from "./kotae-embed";

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
      <KotaeEmbed />
    </>
  );
}
