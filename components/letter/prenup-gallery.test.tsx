import { forwardRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let resize: ResizeObserverCallback;

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      function MotionDiv({ children, style, ...props }, ref) {
        return (
          <div ref={ref} style={style} {...props}>
            {children}
          </div>
        );
      },
    ),
  },
  useReducedMotion: () => false,
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => 0,
}));

vi.mock('@/components/letter/motion-image', () => ({
  MotionImage: () => <span aria-hidden="true" />,
}));

vi.mock('@/components/letter/photo-lightbox', () => ({
  MORPH: {},
  PhotoLightbox: () => null,
  photoLayoutId: (id: string) => id,
}));

import { PrenupScrollGallery } from '@/components/letter/prenup-gallery';

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('PrenupScrollGallery', () => {
  it('turns the gallery overflow into vertical scroll distance', () => {
    render(
      <PrenupScrollGallery
        shots={[{ alt: 'portrait', w: 900, h: 1100, image: '/portrait.jpg' }]}
      />,
    );

    const container = screen.getByTestId('prenup-scroll-container');
    const viewport = screen.getByRole('region', { name: 'Prenup photos' });
    const track = viewport.firstElementChild as HTMLElement;
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 300 },
    });
    Object.defineProperties(track, {
      scrollWidth: { configurable: true, value: 900 },
    });

    act(() => resize([], {} as ResizeObserver));

    expect(container).toHaveStyle({ height: 'calc(100svh + 600px)' });
  });
});
