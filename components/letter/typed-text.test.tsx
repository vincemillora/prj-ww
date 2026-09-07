import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let inView = true;

vi.mock('motion/react', () => ({
  useInView: () => inView,
}));

import { TypedLines } from '@/components/letter/typed-text';

/** The welcome band's sign-off — the two-line case the component was built for. */
function SignOff() {
  return (
    <TypedLines
      lines={[{ text: 'with love' }, { text: 'Vince & Kc' }]}
      testId="typed-text"
    />
  );
}

/**
 * The text actually WRITTEN so far.
 *
 * The whole line is always in the DOM — the characters not yet written sit in a
 * `visibility: hidden` span so the line's width, wrapping and height are the
 * finished ones from the first frame. jsdom computes neither visibility nor
 * innerText, so the pending span is subtracted explicitly.
 */
function written(block: HTMLElement) {
  const pending = [...block.querySelectorAll('[data-slot="pending"]')]
    .map((n) => n.textContent ?? '')
    .join('');
  const all = block.textContent ?? '';
  return pending ? all.slice(0, all.length - pending.length) : all;
}

/**
 * One character per act(): each step's timeout is only scheduled once React has
 * committed the previous one, so a single large advanceTimersByTime moves the
 * timeline by exactly one letter.
 */
function tick(chars: number) {
  for (let i = 0; i < chars; i += 1) {
    act(() => {
      vi.advanceTimersByTime(100);
    });
  }
}

/** jsdom has no matchMedia; the component treats its absence as "reduce". */
function stubReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe('TypedLines', () => {
  beforeEach(() => {
    inView = true;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('types the sign-off a character at a time once it is in view', () => {
    stubReducedMotion(false);
    render(<SignOff />);

    const block = screen.getByTestId('typed-text');
    expect(written(block)).not.toContain('with love');

    tick(3);
    expect(written(block)).toContain('wit');
    expect(written(block)).not.toContain('Vince');

    tick(30);
    expect(written(block)).toContain('with love');
    expect(written(block)).toContain('Vince & Kc');
  });

  it('erases the sign-off in reverse when the block leaves the viewport', () => {
    stubReducedMotion(false);
    const { rerender } = render(<SignOff />);
    const block = screen.getByTestId('typed-text');

    tick(30);
    expect(written(block)).toContain('Vince & Kc');

    inView = false;
    rerender(<SignOff />);

    // The names unwind before the sign-off is touched: one hand, one timeline.
    tick('Vince & Kc'.length);
    expect(written(block)).toContain('with love');
    expect(written(block)).not.toContain('Vince & Kc');

    tick(30);
    expect(written(block)).not.toContain('with');
  });

  it('leaves the finished text alone for a guest who prefers reduced motion', () => {
    stubReducedMotion(true);
    render(<SignOff />);

    const block = screen.getByTestId('typed-text');
    expect(written(block)).toContain('with love');
    expect(written(block)).toContain('Vince & Kc');

    inView = false;
    tick(30);
    expect(written(block)).toContain('with love');
  });
});
