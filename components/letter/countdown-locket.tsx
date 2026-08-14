const photos = [
  "https://picsum.photos/seed/ww-locket-left/360/420",
  "https://picsum.photos/seed/ww-locket-right/360/420",
];

export function CountdownLocket(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative mb-8 aspect-[4/3] w-[clamp(13rem,34vw,18rem)]"
      data-testid="countdown-locket"
    >
      <img
        alt=""
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
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        data-testid="countdown-locket-frame"
        src="/locket/locket-frame.png"
      />
    </div>
  );
}
