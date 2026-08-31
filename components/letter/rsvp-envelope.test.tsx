import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useScrollMock, useTransformMock } = vi.hoisted(() => ({
  useScrollMock: vi.fn(() => ({ scrollYProgress: {} })),
  useTransformMock: vi.fn(() => 0),
}));

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
}));

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MotionDiv(
      { children, style, ...props },
      ref,
    ) {
      const domStyle = { ...(style ?? {}) } as CSSProperties & { y?: unknown };
      delete domStyle.y;

      return (
        <div ref={ref} style={domStyle} {...props}>
          {children}
        </div>
      );
    }),
  },
  useReducedMotion: () => false,
  useScroll: useScrollMock,
  useTransform: useTransformMock,
}));

import { RsvpEnvelope } from '@/components/letter/rsvp-envelope';

function renderEnvelope() {
  return render(
    <RsvpEnvelope>
      <div data-testid="rsvp-card" />
    </RsvpEnvelope>,
  );
}

describe('RsvpEnvelope', () => {
  it('starts extraction later and keeps the final card position lower', () => {
    renderEnvelope();

    expect(useScrollMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        offset: ['start 82%', 'start 37%'],
      }),
    );
    expect(useTransformMock).toHaveBeenLastCalledWith(
      expect.anything(),
      [0, 1],
      [108, 36],
    );
  });

  it('keeps the visible envelope 100px wider than the RSVP card', () => {
    const { container, getByTestId } = renderEnvelope();
    const card = getByTestId('rsvp-card');

    expect(container.firstElementChild).toHaveClass('w-[calc(100%+120.2px)]');
    expect(card.parentElement).toHaveClass('w-[calc(83.195%-100px)]');
  });

  it('keeps the card behind the front while letting envelope layers overflow', () => {
    const { container, getByTestId } = renderEnvelope();
    const card = getByTestId('rsvp-card');
    const inside = container.querySelector('img[src="/envelope/inside.png"]');
    const front = container.querySelector('img[src="/envelope/front.png"]');

    expect(card.parentElement).toHaveClass('z-20');
    expect(card.parentElement).toHaveClass('w-[calc(83.195%-100px)]');
    expect(inside?.parentElement).toHaveClass('z-10');
    expect(front?.parentElement).toHaveClass('z-30');
    expect(front?.parentElement?.parentElement).not.toHaveClass('overflow-hidden');
    expect(front?.parentElement?.parentElement?.parentElement).toHaveClass(
      '-mt-[50%]',
      'pointer-events-none',
    );
  });

  it('tilts the paper layers five degrees without rotating the RSVP card', () => {
    const { container, getByTestId } = renderEnvelope();
    const paper = container.querySelector('[data-slot="rsvp-envelope-paper"]');
    const back = container.querySelector('img[src="/envelope/back.png"]');
    const inside = container.querySelector('img[src="/envelope/inside.png"]');
    const front = container.querySelector('img[src="/envelope/front.png"]');
    const logo = container.querySelector('[data-slot="rsvp-envelope-logo"]');
    const lace = container.querySelector('img[src="/envelope/lace.png"]');
    const card = getByTestId('rsvp-card').parentElement;

    expect(paper).not.toHaveClass('rotate-[5deg]');
    expect(back?.parentElement).toHaveClass('rotate-[5deg]');
    expect(inside?.parentElement).toHaveClass('rotate-[5deg]');
    expect(front?.parentElement).toHaveClass('rotate-[5deg]', 'z-30');
    expect(logo?.parentElement).toBe(front?.parentElement);
    expect(lace).toHaveClass('rotate-[185deg]');
    expect(card).not.toHaveClass('rotate-[5deg]');
  });

  it('stacks the supplied back, inner panel, front logo, and lace in source order', () => {
    const { container } = renderEnvelope();
    const images = Array.from(container.querySelectorAll('img'));
    const [back, inside, front, logo, lace] = images;

    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/envelope/back.png',
      '/envelope/inside.png',
      '/envelope/front.png',
      '/couple-logo-rustic.svg',
      '/envelope/lace.png',
    ]);
    expect(back.parentElement).toHaveClass('z-10');
    expect(inside.parentElement).toHaveClass('z-10');
    expect(front.parentElement).toHaveClass('z-30');
    expect(logo.parentElement?.parentElement).toHaveClass('rotate-[5deg]');
    expect(lace).toHaveClass('z-0');
  });

  it('keeps the inverted lace raised and offset right behind the envelope', () => {
    const { container } = renderEnvelope();
    const lace = container.querySelector('img[src="/envelope/lace.png"]');

    expect(lace).toHaveClass('rotate-[185deg]');
    expect(lace).toHaveClass('origin-center');
    expect(lace).toHaveClass('-translate-y-[16.83%]');
    expect(lace).toHaveClass('translate-x-[10px]');
    expect(lace).toHaveClass('z-0');
  });

  it('raises the inner panel slightly within the envelope', () => {
    const { container } = renderEnvelope();
    const inside = container.querySelector('img[src="/envelope/inside.png"]');

    expect(inside?.parentElement).toHaveClass('-translate-y-[10px]');
  });
});
