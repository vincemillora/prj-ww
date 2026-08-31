import QRCode from 'qrcode';
import { SectionHeading } from '@/components/letter/section-heading';

/**
 * Gifts — white section after Rsvp. Same header pattern as the other letter
 * sections (font-script h2 + font-sans label), an intro line, then a
 * cash-gift block with one QR for GCash and one for BDO, each labelled below.
 *
 * The QR SVGs are generated server-side from each method's `payload`. Replace
 * the payloads with the couple's real GCash / BDO transfer strings (or the raw
 * value their banking app's “show QR” screen encodes) to make them scannable.
 */
const CASH_METHODS = [
  { method: 'GCash', payload: 'gcash:transfer?account=REPLACE_WITH_REAL' },
  { method: 'BDO', payload: 'bdo:transfer?account=REPLACE_WITH_REAL' },
];

export async function Gifts() {
  const codes = await Promise.all(
    CASH_METHODS.map(async (m) => ({
      method: m.method,
      svg: await QRCode.toString(m.payload, {
        type: 'svg',
        width: 176,
        margin: 1,
        errorCorrectionLevel: 'M',
        // Retain white for this established paper surface and its QR quiet zone.
        color: { dark: '#2c2a1b', light: '#ffffff' },
      }),
    })),
  );

  return (
    <section className="bg-paper px-gutter py-section">
      <div className="mx-auto max-w-[56rem] text-center">
        <SectionHeading title="A little something" kicker="Gift guide" />

        <p className="mx-auto mt-heading max-w-lg text-lead text-muted-foreground">
          Your presence is the only gift we’re hoping for. But if you’d like to
          give a little more, you can scan a code below with your banking app.
        </p>

        {/* Cash gift — QR codes */}
        <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-10">
          {codes.map((c) => (
            <div key={c.method} className="flex flex-col items-center">
              <div
                className="rounded-md border border-ink bg-paper p-2 [&>svg]:block"
                /* Match the QR's quiet zone to its surrounding surface. */
                dangerouslySetInnerHTML={{ __html: c.svg }}
              />
              <p className="mt-4 font-sans text-subhead text-ink">
                {c.method}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
