import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useScrollMock, useTransformMock } = vi.hoisted(() => ({
  useScrollMock: vi.fn(() => ({ scrollYProgress: {} })),
  useTransformMock: vi.fn(() => 0),
}));

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({
    alt,
    className,
    src,
    'data-slot': dataSlot,
  }: {
    alt: string;
    className?: string;
    src: string;
    'data-slot'?: string;
  }) => <img alt={alt} className={className} data-slot={dataSlot} src={src} />,
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      style,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-motion-layer style={style} {...props}>{children}</div>
    ),
  },
  useScroll: useScrollMock,
  useTransform: useTransformMock,
}));

vi.mock('@/components/letter/hero', () => ({
  Hero: () => <div data-testid="hero-content" />,
}));

import { OpeningBackdrop } from '@/components/letter/opening-backdrop';

describe('OpeningBackdrop', () => {
  it('renders one sharp image and only applies the existing hero zoom', () => {
    const { container } = render(<OpeningBackdrop />);

    const backgrounds = container.querySelectorAll('img[src*="footer-lace"]');
    const hero = screen.getByTestId('hero-content');
    const backgroundLayer = container.querySelector('[aria-hidden="true"]');
    const backgroundViewport = container.querySelector(
      '[aria-hidden="true"] > div',
    );

    expect(backgrounds).toHaveLength(1);
    expect(backgroundLayer).toHaveClass('absolute', 'inset-0');
    expect(backgroundLayer).not.toHaveClass('fixed');
    expect(backgroundViewport).toHaveClass('sticky', 'top-0', 'h-lvh');
    expect(backgrounds[0]).toHaveClass('object-cover', 'object-center');
    expect(backgrounds[0].compareDocumentPosition(hero)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      container.querySelector('[data-slot="hero-background-sharp"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="hero-background-blur"]'),
    ).not.toBeInTheDocument();
    expect(useScrollMock).toHaveBeenCalledWith({
      target: expect.anything(),
      offset: ['start start', 'end end'],
    });
    expect(useTransformMock).toHaveBeenCalledOnce();
    expect(useTransformMock).toHaveBeenCalledWith(
      expect.anything(),
      [0, 0.6],
      [1, 1.15],
    );
  });

  it('lays a neutral scrim over the backdrop, above the zooming image', () => {
    const { container } = render(<OpeningBackdrop />);

    const scrim = container.querySelector('[data-slot="hero-scrim"]');
    const backdrop = container.querySelector(
      '[data-slot="hero-background-sharp"]',
    );

    expect(scrim).toBeInTheDocument();
    // Neutral black, never ink-tinted: a scrim darkens the photograph, it does
    // not colour it. See PRODUCT.md's Brand Commitments.
    expect(scrim).toHaveClass('absolute', 'inset-0', 'bg-black/30');

    // It has to sit INSIDE the sticky, overflow-hidden viewport so it tracks the
    // visible backdrop rather than the full 150svh scene, and AFTER the image so
    // it paints over it without needing a z-index of its own.
    const sticky = container.querySelector('.sticky');
    expect(scrim?.parentElement).toBe(sticky);
    expect(backdrop?.compareDocumentPosition(scrim!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
