/**
 * The banquet table at the end of the reply card — the long table laid for the
 * reception, drawn in the letter's ink.
 *
 * Masked rather than served as an image, the same way the peony border is: the
 * source drawing is blue line art, and a mask recolours the whole thing to one
 * flat colour, so it picks up `--ink` and needs no edited copy of the asset.
 *
 * No OrnamentDrift here, unlike the peony border. That component's rule is
 * ornaments only — cards and the reply form hold still, so a guest scrolling
 * back to re-read their answer never watches it dissolve. This drawing is
 * inside the card, so it holds still with it.
 */
export function BanquetTableScene() {
  const mask =
    "url('/icons/hand_drawn/illustrations/banquet-table-scene.svg')";

  return (
    <span
      aria-hidden
      data-slot="banquet-table-scene"
      className="mt-2 block aspect-[1035.7829/621.429] w-full bg-ink"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: '100% auto',
        WebkitMaskSize: '100% auto',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
