import Image from "next/image";

const LOCKET_SIZES =
  "(max-width: 608px) 19rem, (max-width: 896px) 50vw, 28rem";

export function CountdownLocket(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mb-8 aspect-[4/3] w-[clamp(19rem,50vw,28rem)]"
      data-testid="countdown-locket"
    >
      <Image
        alt=""
        fill
        loading="lazy"
        sizes={LOCKET_SIZES}
        className="absolute inset-0 h-full w-full object-contain"
        data-testid="countdown-locket-ribbon"
        src="/locket/ribbon.webp"
      />
      <svg
        className="absolute inset-0 h-full w-full"
        data-testid="countdown-locket-photos"
        style={{
          maskImage: "url(/locket/locket-window-mask.webp)",
          maskSize: "100% 100%",
          WebkitMaskImage: "url(/locket/locket-window-mask.webp)",
          WebkitMaskSize: "100% 100%",
        }}
        viewBox="0 0 800 600"
      >
        {/* Childhood photos. Each is drawn 40 units larger than its 300x300
            window so the dx/dy nudges that centre the face never expose an
            edge inside the heart mask. */}
        {[
          { x: 65, dx: 20, dy: 20, src: "/locket/groom.jpg" },
          { x: 435, dx: -20, dy: 20, src: "/locket/bride.jpg" },
        ].map(({ x, dx, dy, src }) => (
          <image
            data-testid="countdown-locket-photo"
            height="340"
            href={src}
            key={x}
            preserveAspectRatio="xMidYMid slice"
            width="340"
            x={x - 20 + dx}
            y={210 + dy}
          />
        ))}
      </svg>
      <Image
        alt=""
        fill
        loading="lazy"
        sizes={LOCKET_SIZES}
        className="absolute inset-0 h-full w-full object-contain"
        data-testid="countdown-locket-frame"
        src="/locket/locket-frame.webp"
      />
    </div>
  );
}
