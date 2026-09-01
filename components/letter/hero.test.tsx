import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
}));

type MotionProps = {
  animate?: unknown;
  initial?: unknown;
  transition?: unknown;
  variants?: unknown;
};

/** Strips the motion-only props so the element renders as plain markup. */
function stripMotionProps<T>({ animate, initial, transition, variants, ...props }: T & MotionProps) {
  void animate;
  void initial;
  void transition;
  void variants;
  return props;
}

vi.mock('motion/react', () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement> & MotionProps) => (
      <div {...stripMotionProps(props)} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement> & MotionProps) => (
      <p {...stripMotionProps(props)} />
    ),
  },
}));

import { Hero } from '@/components/letter/hero';

describe('Hero', () => {
  it('keeps the lace centred in a sticky viewport during the extra hero scroll', () => {
    const { container } = render(<Hero />);

    expect(container.firstElementChild).toHaveClass('h-[150svh]');
    expect(container.querySelector('header')).toHaveClass('sticky', 'top-0', 'h-dvh');
  });

  it('places the footer monogram inside the lace and enlarges the lace on desktop only', () => {
    const { container } = render(<Hero />);

    expect(screen.getByText("We're getting married!")).toBeInTheDocument();
    expect(container.querySelector('img[src="/couple-logo-white.svg"]')).toHaveClass(
      'w-[60%]',
      'left-1/2',
      '-translate-x-1/2',
    );
    expect(container.querySelector('[class*="aspect-square"]')).toHaveClass(
      'lg:w-[min(92vw,42rem,60svh)]',
    );
  });
});
