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

  it('reveals a list item once with the configured distance', () => {
    render(
      <InViewReveal as="li" distance={24} duration={0.7} ease="easeOut">
        Event
      </InViewReveal>,
    );

    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute(
      'data-initial',
      JSON.stringify({ opacity: 0, y: 24 }),
    );
    expect(item).toHaveAttribute(
      'data-animate',
      JSON.stringify({ opacity: 1, y: 0 }),
    );
    expect(item).toHaveAttribute(
      'data-viewport',
      JSON.stringify({ once: true, amount: 0.4 }),
    );
  });

  it('starts visible when reduced motion is requested', () => {
    useReducedMotionMock.mockReturnValue(true);

    render(<InViewReveal>Welcome</InViewReveal>);

    expect(screen.getByText('Welcome')).toHaveAttribute('data-initial', 'false');
  });
});
