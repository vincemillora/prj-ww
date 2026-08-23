import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
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
  it('lets the envelope extend beyond the RSVP section', () => {
    const { container } = render(<Rsvp searchParams={Promise.resolve({})} />);

    expect(container.firstElementChild).not.toHaveClass('overflow-hidden');
  });

  it('layers the supplied floral image behind the RSVP content', () => {
    const { container } = render(<Rsvp searchParams={Promise.resolve({})} />);
    const background = container.querySelector('img[src="/rsvp-background.png"]');

    expect(background).toHaveAttribute('alt', '');
    expect(background?.parentElement).toHaveAttribute('data-slot', 'rsvp-background');
    expect(background?.parentElement).toHaveClass('absolute', 'inset-0', 'z-0');
  });
});
