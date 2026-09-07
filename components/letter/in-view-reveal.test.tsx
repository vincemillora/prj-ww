import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useReducedMotionMock } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn(() => false),
}));

type MotionProps = React.HTMLAttributes<HTMLElement> & {
  initial?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  transition?: unknown;
};

function motionAttributes({
  initial,
  whileInView,
  viewport,
  transition,
}: MotionProps) {
  return {
    'data-initial': JSON.stringify(initial),
    'data-animate': JSON.stringify(whileInView),
    'data-viewport': JSON.stringify(viewport),
    'data-transition': JSON.stringify(transition),
  };
}

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: MotionProps) => (
      <div
        {...props}
        {...motionAttributes({ initial, whileInView, viewport, transition })}
      >
        {children}
      </div>
    ),
    li: ({
      children,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: MotionProps) => (
      <li
        {...props}
        {...motionAttributes({ initial, whileInView, viewport, transition })}
      >
        {children}
      </li>
    ),
  },
  useReducedMotion: useReducedMotionMock,
}));

import { InViewReveal } from '@/components/letter/in-view-reveal';

describe('InViewReveal', () => {
  beforeEach(() => {
    useReducedMotionMock.mockReturnValue(false);
  });

  it('reveals a list item with the configured distance, and replays on exit', () => {
    render(
      <InViewReveal as="li" distance={24} duration={0.7} ease="easeOut">
        Event
      </InViewReveal>,
    );

    const item = screen.getByRole('listitem');
    // The exit rides on `initial` — leaving the viewport animates back to it,
    // and it has to be the fast curve rather than the entrance's duration.
    expect(item).toHaveAttribute(
      'data-initial',
      JSON.stringify({
        opacity: 0,
        y: 24,
        transition: { duration: 0.26, ease: 'easeOut' },
      }),
    );
    expect(item).toHaveAttribute(
      'data-animate',
      // Both axes are in the target: a sideways block returns x to 0, a
      // rising one returns y, and one shared target keeps them interchangeable.
      JSON.stringify({ opacity: 1, x: 0, y: 0 }),
    );
    expect(item).toHaveAttribute(
      'data-viewport',
      JSON.stringify({ once: false, amount: 0.4 }),
    );
  });

  it('rises rather than sliding under md when slideAt is "md"', () => {
    // jsdom reports no match for the md query, which is the mobile case: Day
    // itself's rail sits at the left edge there, so no row has a side.
    render(
      <InViewReveal as="li" distance={24} slideAt="md" slideFrom="left">
        Event
      </InViewReveal>,
    );

    const initial = JSON.parse(
      screen.getByRole('listitem').getAttribute('data-initial') ?? '{}',
    );
    expect(initial).toMatchObject({ opacity: 0, y: 24 });
    expect(initial).not.toHaveProperty('x');
  });

  it('slides at every width by default, for a spine that keeps its sides', () => {
    // Our Story's vine: no md query match here, and the memory still slides.
    render(
      <InViewReveal as="li" distanceX={40} slideFrom="right" tall>
        Memory
      </InViewReveal>,
    );

    const item = screen.getByRole('listitem');
    expect(JSON.parse(item.getAttribute('data-initial') ?? '{}')).toMatchObject({
      opacity: 0,
      x: 40,
    });
    expect(item).toHaveAttribute(
      'data-viewport',
      JSON.stringify({ once: false, amount: 0.2 }),
    );
  });

  it('slides from the requested side once the viewport is md or wider', () => {
    window.matchMedia = ((query: string) => ({
      matches: query === '(min-width: 48rem)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;

    render(
      <InViewReveal as="li" distanceX={40} slideAt="md" slideFrom="left">
        Event
      </InViewReveal>,
    );

    const initial = JSON.parse(
      screen.getByRole('listitem').getAttribute('data-initial') ?? '{}',
    );
    // Left-hand rows start to the LEFT of where they land, and never carry a
    // vertical offset as well — two axes on one block is movement twice.
    expect(initial).toMatchObject({ opacity: 0, x: -40 });
    expect(initial).not.toHaveProperty('y');
  });

  it('starts visible when reduced motion is requested', () => {
    useReducedMotionMock.mockReturnValue(true);

    render(<InViewReveal>Welcome</InViewReveal>);

    expect(screen.getByText('Welcome')).toHaveAttribute('data-initial', 'false');
  });
});
