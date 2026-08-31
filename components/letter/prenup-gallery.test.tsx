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
  it('groups every photo exposure into one labelled film strip', () => {
    render(
      <PrenupScrollGallery
        shots={[
          { alt: 'portrait', w: 900, h: 1100, image: '/portrait.jpg' },
          { alt: 'landscape', w: 1400, h: 900, image: '/landscape.jpg' },
        ]}
      />,
    );

    const filmStrip = screen.getByRole('list', { name: 'Prenup film strip' });

    expect(filmStrip).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'View photo: portrait' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View photo: landscape' })).toBeInTheDocument();
  });

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

  it('caps exposures to the sticky viewport and keeps focus outside the photo', () => {
    render(
      <PrenupScrollGallery
        shots={[
          { alt: 'photo', w: 900, h: 1100, image: '/photo.jpg' },
          { alt: 'placeholder', w: 1400, h: 900 },
        ]}
      />,
    );

    const photo = screen.getByRole('button', { name: 'View photo: photo' });
    const placeholder = screen.getByText('photo · placeholder').parentElement?.parentElement;

    expect(photo).toHaveClass('h-[min(20rem,calc(100svh-8rem))]');
    expect(photo).toHaveClass('sm:h-[min(30rem,calc(100svh-9rem))]');
    expect(photo).toHaveClass('focus-visible:outline-offset-4');
    expect(placeholder).toHaveClass('h-[min(20rem,calc(100svh-8rem))]');
    expect(placeholder).toHaveClass('sm:h-[min(30rem,calc(100svh-9rem))]');
  });
});
