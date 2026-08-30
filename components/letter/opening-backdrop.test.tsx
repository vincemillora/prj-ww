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
  it('crossfades a fixed blur layer while preserving the existing hero zoom', () => {
    const { container } = render(<OpeningBackdrop />);

    const lilies = container.querySelectorAll('img[src*="hero-lily"]');
    const hero = screen.getByTestId('hero-content');

    expect(lilies).toHaveLength(2);
    expect(lilies[0]).toHaveClass('object-cover', 'object-center');
    expect(lilies[0].compareDocumentPosition(hero)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(
      container.querySelector('[data-slot="hero-background-sharp"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="hero-background-blur"]'),
    ).toHaveClass('blur-[8px]');
    expect(useScrollMock).toHaveBeenCalledWith({
      target: expect.anything(),
      offset: ['start start', 'end end'],
    });
    expect(useTransformMock).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      [0, 0.6],
      [1, 1.15],
    );
    expect(useTransformMock).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      [0, 0.6],
      [0, 1],
    );
  });
});
