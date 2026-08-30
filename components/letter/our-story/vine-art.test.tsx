import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { resizeObserve, resizeDisconnect } = vi.hoisted(() => ({
  resizeObserve: vi.fn(),
  resizeDisconnect: vi.fn(),
}));

type MotionSpanProps = React.HTMLAttributes<HTMLSpanElement> & {
  initial?: unknown;
  whileInView?: unknown;
  viewport?: unknown;
  transition?: unknown;
};

vi.mock('motion/react', () => ({
  motion: {
    span: ({
      children,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: MotionSpanProps) => {
      void initial;
      void viewport;
      void transition;
      return (
        <span
          {...props}
          data-while-in-view={whileInView ? 'true' : undefined}
        >
          {children}
        </span>
      );
    },
  },
  useReducedMotion: () => false,
}));

vi.mock('@/components/letter/our-story/story-art', () => ({
  InkCharm: () => <span />,
}));

import { VineFlorals } from '@/components/letter/our-story/vine-art';

describe('VineFlorals', () => {
  let mediaListener: ((event: MediaQueryListEvent) => void) | undefined;

  beforeEach(() => {
    mediaListener = undefined;
    resizeObserve.mockClear();
    resizeDisconnect.mockClear();

    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserver {
        observe = resizeObserve;
        disconnect = resizeDisconnect;
      },
    );

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        media: '(min-width: 640px)',
        onchange: null,
        addEventListener: (
          _type: string,
          listener: (event: MediaQueryListEvent) => void,
        ) => {
          mediaListener = listener;
        },
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('measures and animates only while its responsive branch is active', () => {
    const { container } = render(
      <VineFlorals rows={2} reach={32} media="desktop" />,
    );

    expect(resizeObserve).not.toHaveBeenCalled();
    expect(
      container.querySelector('[data-while-in-view="true"]'),
    ).not.toBeInTheDocument();

    act(() => {
      mediaListener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(resizeObserve).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector('[data-while-in-view="true"]'),
    ).toBeInTheDocument();
  });
});
