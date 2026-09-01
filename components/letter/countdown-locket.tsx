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
        src="/locket/ribbon.png"
      />
      <svg
        className="absolute inset-0 h-full w-full"
        data-testid="countdown-locket-photos"
        style={{
          maskImage: "url(/locket/locket-window-mask.png)",
          maskSize: "100% 100%",
          WebkitMaskImage: "url(/locket/locket-window-mask.png)",
          WebkitMaskSize: "100% 100%",
        }}
        viewBox="0 0 800 600"
      >
        <pattern
          id="countdown-locket-photo-placeholder"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path d="M0 0V12" stroke="var(--ink)" strokeOpacity="0.24" />
        </pattern>
        {[65, 435].map((x) => (
          <rect
            data-testid="countdown-locket-photo-placeholder"
            fill="url(#countdown-locket-photo-placeholder)"
            height="300"
            key={x}
            width="300"
            x={x}
            y="230"
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
        src="/locket/locket-frame.png"
      />
    </div>
  );
}
