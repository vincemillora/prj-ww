import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WEDDING_DAY_LABEL } from '@/lib/wedding';

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      initial: _initial,
      whileInView: _whileInView,
      viewport: _viewport,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      whileInView?: unknown;
      viewport?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => true,
}));

vi.mock('@/components/letter/countdown-locket', () => ({
  CountdownLocket: () => null,
}));

import { WelcomeBand } from '@/components/letter/welcome-band';

describe('WelcomeBand', () => {
  it('places the hero date display and countdown before the sign-off', () => {
    render(<WelcomeBand />);

    const date = screen.getByText(WEDDING_DAY_LABEL);
    const signOff = screen.getByText('with love');

    expect(date.compareDocumentPosition(signOff)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.queryByTestId('countdown-calendar')).not.toBeInTheDocument();
  });
});
