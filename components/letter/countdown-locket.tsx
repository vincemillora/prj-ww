import Image from "next/image";

const photos = [
  "https://picsum.photos/seed/ww-locket-left/360/420",
  "https://picsum.photos/seed/ww-locket-right/360/420",
];

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
        {photos.map((href, index) => (
          <image
            data-testid="countdown-locket-photo"
            height="300"
            href={href}
            key={href}
            preserveAspectRatio="xMidYMid slice"
            width="300"
            x={index === 0 ? 65 : 435}
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
