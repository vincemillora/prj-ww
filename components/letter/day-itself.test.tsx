import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
// Same mock as rsvp.test.tsx, and needed for the same reason: a statically
// imported PNG arrives here as Vite's resolved URL string, so next/image throws
// on `placeholder="blur"` for want of a blurDataURL.
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
    src: string;
  }) => <img alt={alt} className={className} sizes={sizes} src={src} />,
}));

import { DayItself } from '@/components/letter/day-itself';

describe('DayItself', () => {
  it('carries the attire guide, so the page has one "What to wear" heading', () => {
    render(<DayItself />);

    // The old AttireGuide section was retired into this one; a second copy of
    // this heading means it has been remounted in wedding-letter.tsx.
    expect(screen.getAllByText('What to wear')).toHaveLength(1);
    expect(screen.getByText(/Semi-formal/)).toBeInTheDocument();
    expect(
      screen.getByText(/Please leave white and ivory/),
    ).toBeInTheDocument();
  });

  it('lays the sequence and both attire blocks on their own frames', () => {
    const { container } = render(<DayItself />);

    const sheets = container.querySelectorAll(
      '[data-slot="hand-drawn-frame-long"]',
    );
    expect(sheets).toHaveLength(3);

    // Exactly one is inverted (ink fill, paper line) to match the title card.
    const inked = container.querySelectorAll(
      '[data-slot="hand-drawn-frame-long"][data-tone="ink"]',
    );
    expect(inked).toHaveLength(1);
    expect(inked[0].parentElement).toHaveTextContent(/Semi-formal/);
  });

  it('gives every sheet its own stacking context', () => {
    const { container } = render(<DayItself />);

    // Load-bearing: the frame paints at -z-10, and without `isolate` on the
    // sheet that negative index escapes and hides behind the section.
    for (const frame of container.querySelectorAll(
      '[data-slot="hand-drawn-frame-long"]',
    )) {
      expect(frame.parentElement).toHaveClass('isolate');
      expect(frame).toHaveClass('-z-10');
    }
  });

  it('keeps the backdrop pinned to the viewport rather than to the section', () => {
    const { container } = render(<DayItself />);

    expect(
      container.querySelector('[data-slot="day-itself-background-viewport"]'),
    ).toHaveClass('sticky', 'top-0', 'h-lvh');
    // `clip`, not `hidden`: hidden would make the section the scrollport and
    // pin the backdrop to it instead of to the viewport.
    expect(container.firstElementChild).toHaveClass('overflow-x-clip');
  });
});
