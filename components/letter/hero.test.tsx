import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      animate,
      initial,
      transition,
      variants,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      animate?: unknown;
      initial?: unknown;
      transition?: unknown;
      variants?: unknown;
    }) => {
      void animate;
      void initial;
      void transition;
      void variants;
      return <div {...props} />;
    },
  },
}));

import { Hero } from '@/components/letter/hero';

describe('Hero', () => {
  it('keeps the lace centred in a sticky viewport during the extra hero scroll', () => {
    const { container } = render(<Hero />);

    expect(container.firstElementChild).toHaveClass('h-[150svh]');
    expect(container.querySelector('header')).toHaveClass('sticky', 'top-0', 'h-dvh');
  });
});
