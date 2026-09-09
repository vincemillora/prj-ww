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
      screen.getByText(/We would love to see you in the colours above/),
    ).toBeInTheDocument();
  });

  it('gives each attire block the presentation its content asks for', () => {
    const { container } = render(<DayItself />);

    // Three drawn sheets, not five: the day's own card, then one for each of
    // the two guide cards. The palette plate and the closing rule are NOT on
    // drawn sheets — see the two assertions below.
    const sheets = container.querySelectorAll(
      '[data-slot="hand-drawn-frame-long"]',
    );
    expect(sheets).toHaveLength(3);

    // Both guide cards are inverted (ink fill, paper line); the day card stays
    // paper. A guide card that loses its tone loses its white type with it.
    const inked = container.querySelectorAll(
      '[data-slot="hand-drawn-frame-long"][data-tone="ink"]',
    );
    expect(inked).toHaveLength(2);
    expect(inked[0].parentElement).toHaveTextContent(/For the men/);
    expect(inked[1].parentElement).toHaveTextContent(/For the women/);

    // The palette plate is a POLAROID: a paper mount around the print, with a
    // caption on the lip. A drawn sheet here would make the picture look like
    // one more written card.
    const plate = screen.getByAltText(/^Illustrated guests/);
    const mount = plate.closest('figure');
    expect(mount).not.toBeNull();
    expect(mount).toHaveTextContent('our colours');
    expect(
      mount?.closest('[data-slot="hand-drawn-frame-long"]'),
    ).toBeNull();

    // The closing rule is set in the LACE frame, the same ornament as the
    // section title, so the run opens and closes on it.
    const laces = container.querySelectorAll('img[src*="floral-lace-frame"]');
    expect(laces).toHaveLength(2);
    expect(laces[0].parentElement).toHaveTextContent('What to wear');
    expect(laces[1].parentElement).toHaveTextContent(/Semi-formal/);
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
