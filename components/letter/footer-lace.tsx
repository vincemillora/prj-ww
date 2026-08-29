import Image from 'next/image';

import footerLace from '@/public/footer-lace.png';

export function FooterLace() {
  return (
    <footer
      className="relative isolate overflow-hidden bg-paper py-section"
      aria-label="Decorative wedding drapery"
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0"
      >
        <Image
          alt=""
          className="object-cover"
          fill
          priority={false}
          sizes="100vw"
          src={footerLace}
        />
      </div>
      <Image
        alt=""
        className="relative z-10 mx-auto block h-auto w-[500px] max-w-full transition-transform duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-90 motion-reduce:transition-none motion-reduce:hover:scale-100"
        height={500}
        sizes="500px"
        src="/couple-logo-white.svg"
        width={500}
      />
      <address className="relative z-10 px-gutter text-center text-paper not-italic">
        <p className="font-sans text-body">
          For any questions, please contact us at:
        </p>
        <p className="mt-6 font-sans text-body">------</p>
        <p className="mt-6 font-script text-title">Empty &amp; Hyuwu</p>
        <p className="mt-2 font-sans text-body">with love</p>
      </address>
    </footer>
  );
}
