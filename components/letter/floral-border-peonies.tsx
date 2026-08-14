/** Full-bleed peony border painted in the letter's ink. */
export function FloralBorderPeonies() {
  const mask = "url('/icons/hand_drawn/illustrations/floral-border-peonies.svg')";

  return (
    <span
      aria-hidden
      className="block aspect-[1032.1908/270.9679] w-full bg-ink"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'calc(100% + 20px) auto',
        WebkitMaskSize: 'calc(100% + 20px) auto',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
