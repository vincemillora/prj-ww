import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useScrollMock, useTransformMock } = vi.hoisted(() => ({
  useScrollMock: vi.fn(() => ({ scrollYProgress: {} })),
  useTransformMock: vi.fn(() => 0),
}));

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div data-motion-layer {...props}>{children}</div>
    ),
  },
  useMotionTemplate: () => '',
  useScroll: useScrollMock,
  useTransform: useTransformMock,
}));

vi.mock('@/components/letter/hero', () => ({
  Hero: () => <div data-testid="hero-content" />,
}));

import { OpeningBackdrop } from '@/components/letter/opening-backdrop';

describe('OpeningBackdrop', () => {
  it('finishes the zoom at 60% of the hero scroll without fading the photo', () => {
    const { container } = render(<OpeningBackdrop />);

    const lily = container.querySelector('img[src*="hero-lily"]');
    const hero = screen.getByTestId('hero-content');

    expect(lily).toHaveClass('object-cover', 'object-center');
    expect(lily?.compareDocumentPosition(hero)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(useScrollMock).toHaveBeenCalledWith({
      target: expect.anything(),
      offset: ['start start', 'end end'],
    });
    expect(useTransformMock).toHaveBeenCalledWith(
      expect.anything(),
      [0, 0.6],
      [1, 1.15],
    );
    expect(container.querySelector('[data-motion-layer]')).not.toHaveStyle({ opacity: '0' });
  });
});
