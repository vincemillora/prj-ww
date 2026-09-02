import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
// The envelope is a client component that pushes the route itself (see
// components/invitation/envelope-invitation.tsx). jsdom has no mounted app
// router, so
// stub the hook; the opening choreography has its own test beside it.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
}));
vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ComponentProps<'img'>) => {
    // The route test only needs the accessible link, not Image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  },
}));
vi.mock('@/components/letter/wedding-letter', () => ({
  WeddingLetter: () => null,
}));
vi.mock('@/components/letter/motion-provider', () => ({
  MotionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/letter/vinyl-player', () => ({
  VinylPlayer: () => null,
}));

import Home, { viewport } from '@/app/page';
import { viewport as rsvpViewport } from '@/app/rsvp/page';

describe('Home', () => {
  it('extends the invitation hero without forcing opaque Safari chrome', () => {
    expect(viewport).toEqual({
      viewportFit: 'cover',
    });
  });

  it('keeps the RSVP letter edge-to-edge without forcing opaque Safari chrome', () => {
    expect(rsvpViewport).toEqual({
      viewportFit: 'cover',
    });
  });

  it('keeps the dark document canvas as the full-bleed artwork fallback', async () => {
    const { container } = render(await Home({ searchParams: Promise.resolve({}) }));

    expect(container.querySelector('main')).toHaveClass('invitation-page', 'bg-ink');
  });

  it('bleeds the stage past the layout viewport so iOS Safari has nothing to band',
    async () => {
      const { container } = render(await Home({ searchParams: Promise.resolve({}) }));

      // `viewport-bleed-stage` owns the height (app/globals.css). A height
      // utility here would fight it and bring the band back — see
      // docs/rsvp-spec.md §1.
      const main = container.querySelector('main');
      expect(main).toHaveClass('viewport-bleed-stage');
      expect(main?.className).not.toMatch(/\bh-(lvh|dvh|svh|screen|full)\b/);
    });

  it('introduces the senders above the envelope', async () => {
    render(await Home({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText('you have received a letter from')).toBeInTheDocument();
    expect(screen.getByText('Vince and Kc')).toBeInTheDocument();
  });

  it('places the RSVP envelope logo above the front flap', async () => {
    const { container } = render(await Home({ searchParams: Promise.resolve({}) }));

    expect(container.querySelector('img[src="/couple-logo-rustic.svg"]')).toBeInTheDocument();
  });

  it('explains how to open the letter below the envelope', async () => {
    render(await Home({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText('Tap the envelope to open the letter')).toBeInTheDocument();
  });

  it('forwards an invite code to the RSVP route', async () => {
    render(await Home({ searchParams: Promise.resolve({ id: 'guest-code' }) }));

    expect(screen.getByRole('link', { name: 'Open RSVP invitation' })).toHaveAttribute(
      'href',
      '/rsvp?id=guest-code',
    );
  });

  it('links an unparameterized visit to the RSVP route', async () => {
    render(await Home({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole('link', { name: 'Open RSVP invitation' })).toHaveAttribute(
      'href',
      '/rsvp',
    );
  });
});
