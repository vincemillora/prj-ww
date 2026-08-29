import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/letter/opening-backdrop', () => ({
  OpeningBackdrop: () => <section data-testid="opening" />,
}));
vi.mock('@/components/letter/welcome-band', () => ({
  WelcomeBand: () => <section data-testid="welcome" />,
}));
vi.mock('@/components/letter/our-story', () => ({
  OurStory: () => <section data-testid="story" />,
}));
vi.mock('@/components/letter/prenup', () => ({ Prenup: () => null }));
vi.mock('@/components/letter/day-itself', () => ({ DayItself: () => null }));
vi.mock('@/components/letter/attire-guide', () => ({ AttireGuide: () => null }));
vi.mock('@/components/letter/location', () => ({ Location: () => null }));
vi.mock('@/components/letter/hotels', () => ({ Hotels: () => null }));
vi.mock('@/components/letter/rsvp', () => ({ Rsvp: () => null }));
vi.mock('@/components/letter/floral-border-peonies', () => ({
  FloralBorderPeonies: () => null,
}));
vi.mock('@/components/letter/gifts', () => ({ Gifts: () => null }));
vi.mock('@/components/letter/faq', () => ({
  Faq: () => <section data-testid="faq" />,
}));
vi.mock('@/components/letter/footer-lace', () => ({
  FooterLace: () => <footer data-testid="footer-lace" />,
}));

import { WeddingLetter } from '@/components/letter/wedding-letter';

describe('WeddingLetter', () => {
  it('places Our Story directly after the welcome band', () => {
    render(<WeddingLetter searchParams={Promise.resolve({})} />);

    const welcome = screen.getByTestId('welcome');
    const story = screen.getByTestId('story');

    expect(welcome.compareDocumentPosition(story)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('places the decorative footer after the FAQ', () => {
    render(<WeddingLetter searchParams={Promise.resolve({})} />);

    const faq = screen.getByTestId('faq');
    const footer = screen.getByTestId('footer-lace');

    expect(faq.compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
