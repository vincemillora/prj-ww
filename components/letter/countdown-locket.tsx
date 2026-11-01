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
        {/* Childhood photos. Each 300x300 window starts at (x, 210). The photo
            is drawn larger than its window so the dx/dy nudge (from the window
            centre) and the tilt (around the window centre) never expose an
            edge inside the heart mask. */}
        {[
          { x: 65, dx: 5, dy: 55, rotate: -15, size: 400, src: "/locket/groom.jpg" },
          { x: 435, dx: -12, dy: 45, rotate: 15, size: 400, src: "/locket/bride.jpg" },
        ].map(({ x, dx, dy, rotate, size, src }) => (
          <image
            data-testid="countdown-locket-photo"
            height={size}
            href={src}
            key={x}
            preserveAspectRatio="xMidYMid slice"
            transform={rotate ? `rotate(${rotate} ${x + 150} 360)` : undefined}
            width={size}
            x={x + 150 + dx - size / 2}
            y={360 + dy - size / 2}
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
