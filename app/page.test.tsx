import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ComponentProps<'img'>) => {
    // The route test only needs the accessible link, not Image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  },
}));

import Home, { viewport } from '@/app/page';

describe('Home', () => {
  it('extends the invitation hero through iOS device insets', () => {
    expect(viewport).toMatchObject({
      themeColor: '#2c2a1b',
      viewportFit: 'cover',
    });
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
