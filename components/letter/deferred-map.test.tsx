import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

describe('DeferredMap', () => {
  let intersectionCallback: IntersectionObserverCallback;
  let idleCallback: (deadline: IdleDeadlineLike) => void;

  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class IntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }

        observe() {}
        disconnect() {}
      },
    );

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      writable: true,
      value: vi.fn((callback: (deadline: IdleDeadlineLike) => void) => {
        idleCallback = callback;
        return 1;
      }),
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('mounts the iframe during idle time after the map approaches', async () => {
    const { DeferredMap } = await import('@/components/letter/deferred-map');

    render(
      <DeferredMap
        title="Map — Anvy"
        src="https://maps.example/embed"
        active
      />,
    );
    expect(screen.queryByTitle('Map — Anvy')).not.toBeInTheDocument();

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(screen.queryByTitle('Map — Anvy')).not.toBeInTheDocument();

    act(() => {
      idleCallback({ didTimeout: false, timeRemaining: () => 10 });
    });
    expect(screen.getByTitle('Map — Anvy')).toHaveAttribute(
      'src',
      'https://maps.example/embed',
    );
  });

  it('uses a bounded timer when requestIdleCallback is unavailable', async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const { DeferredMap } = await import('@/components/letter/deferred-map');

    render(
      <DeferredMap
        title="Map — Anvy"
        src="https://maps.example/embed"
        active
      />,
    );
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(screen.getByTitle('Map — Anvy')).toBeInTheDocument();
  });
});
