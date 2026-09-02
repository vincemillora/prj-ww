import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({
    alt,
    className,
    sizes,
    src,
  }: {
    alt: string;
    className?: string;
    sizes?: string;
    // A statically imported PNG arrives as Vite's resolved URL string here, so
    // the src assertions below match on the filename rather than a literal.
    src: string;
  }) => <img alt={alt} className={className} sizes={sizes} src={src} />,
}));

vi.mock('react', async () => {
  const react = await vi.importActual<typeof import('react')>('react');

  return {
    ...react,
    Suspense: ({ fallback }: { fallback: ReactNode }) => <>{fallback}</>,
  };
});

vi.mock('@/components/letter/dome', () => ({ Dome: () => null }));
vi.mock('@/lib/data', () => ({ getGuestByToken: vi.fn() }));
vi.mock('@/components/letter/rsvp-envelope', () => ({
  RsvpEnvelope: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/letter/section-heading', () => ({ SectionHeading: () => null }));

import { Rsvp } from '@/components/letter/rsvp';

describe('Rsvp', () => {
  it('keeps the RSVP section unclipped so the envelope can stick to the viewport', () => {
    const { container } = render(<Rsvp searchParams={Promise.resolve({})} />);

    expect(container.firstElementChild).not.toHaveClass('overflow-hidden');
  });

  it('layers the floral image behind the RSVP content, one viewport at a time', () => {
    const { container } = render(<Rsvp searchParams={Promise.resolve({})} />);
    const background = container.querySelector('img[src*="rsvp-bg"]');
    const viewport = background?.parentElement;
    const layer = viewport?.parentElement;

    expect(background).toHaveAttribute('alt', '');
    expect(layer).toHaveAttribute('data-slot', 'rsvp-background');
    expect(layer).toHaveClass('absolute', 'inset-0', 'z-0');

    // The painted box is ONE SCREEN tall, not the whole section: `object-cover`
    // over the full section made its height the governing dimension and blew
    // the 1448x1086 artwork up 1.66x, cropping it to a 16%-wide strip. Sticky
    // rather than fixed, so the backdrop stops at the section's edges.
    expect(viewport).toHaveClass('sticky', 'top-0', 'h-lvh');
    expect(viewport).not.toHaveClass('fixed');
  });

  it('asks for the painted width of the backdrop, not the viewport width', () => {
    const { container } = render(<Rsvp searchParams={Promise.resolve({})} />);
    const background = container.querySelector('img[src*="rsvp-bg"]');

    // Below the image's own 4:3 the cover height governs, so the painted width
    // is `vh * 1448/1086`. A plain `100vw` here under-asks by ~3x on a phone
    // and the optimizer serves a variant far too small for the box.
    expect(background).toHaveAttribute(
      'sizes',
      '(max-aspect-ratio: 4/3) 134vh, 100vw',
    );
  });
});
