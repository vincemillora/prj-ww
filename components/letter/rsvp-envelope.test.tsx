import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- the mock exposes Image output for assertions. */
vi.mock('next/image', () => ({
  default: ({ alt, className, src }: { alt: string; className?: string; src: string }) => (
    <img alt={alt} className={className} src={src} />
  ),
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
  it('keeps the RSVP card static while the decorative envelope is sticky', () => {
    const { container, getByTestId } = renderEnvelope();
    const card = getByTestId('rsvp-card');
    const stickyEnvelope = container.querySelector('[data-slot="rsvp-envelope-sticky"]');

    expect(container.firstElementChild).toHaveClass(
      'grid-rows-[auto_var(--runway)]',
      'mt-[calc(var(--spacing-heading)+6rem)]',
    );
    expect(card.parentElement).toHaveClass('relative', 'z-20');
    expect(card.parentElement).not.toHaveAttribute('style');
    // The pin offset decides when the glide starts: the layers hold the moment
    // the envelope's top edge reaches it, so a bigger offset starts the card
    // moving earlier. What caps it is the far end — the card's tucked edge has
    // to stay above the fold — hence the arithmetic rather than a flat `top-6`.
    expect(stickyEnvelope).toHaveClass(
      'sticky',
      'top-[var(--pin-top)]',
      'bottom-0',
      'pointer-events-none',
    );
    expect(stickyEnvelope).toHaveClass('self-start');
    expect(stickyEnvelope).toHaveClass('row-end-3');
    expect(
      container.querySelector('[data-slot="rsvp-envelope-front-sticky"]'),
    ).toHaveClass('self-start');
    expect(container.querySelector('[data-slot="rsvp-envelope-paper"]')).not.toHaveClass(
      'translate-y-[calc(100svh-50%)]',
    );
    expect(container.querySelector('[data-slot="rsvp-envelope-front-paper"]')).not.toHaveClass(
      'translate-y-[calc(100svh-50%)]',
    );
  });

  it('starts the card above the flap so its first lines are never clipped', () => {
    // The flap only clears the card's full width above 51.2% of this canvas's
    // width, so a card starting below that line has its opening lines cut at
    // both sides before the guest has scrolled at all.
    const { getByTestId } = renderEnvelope();

    expect(getByTestId('rsvp-card').parentElement).toHaveClass('mt-[30%]');
  });

  it('keeps the visible envelope 100px wider than the RSVP card', () => {
    const { container, getByTestId } = renderEnvelope();
    const card = getByTestId('rsvp-card');

    expect(container.firstElementChild).toHaveClass('w-[calc(100%+120.2px)]');
    expect(card.parentElement).toHaveClass('w-[calc(83.195%-100px)]');
  });

  it('keeps the card between the independently sticky back and front layers', () => {
    const { container, getByTestId } = renderEnvelope();
    const card = getByTestId('rsvp-card');
    const inside = container.querySelector('img[src="/envelope/inside.png"]');
    const front = container.querySelector('img[src="/envelope/front.png"]');

    expect(card.parentElement).toHaveClass('z-20');
    expect(card.parentElement).toHaveClass('w-[calc(83.195%-100px)]');
    expect(inside?.parentElement).toHaveClass('z-10');
    expect(front?.parentElement).toHaveClass('z-30');
    expect(front?.parentElement?.parentElement).not.toHaveClass('overflow-hidden');
    expect(container.querySelector('[data-slot="rsvp-envelope-sticky"]')).toHaveClass(
      'sticky',
      'bottom-0',
      'z-10',
      'pointer-events-none',
    );
    expect(container.querySelector('[data-slot="rsvp-envelope-front-sticky"]')).toHaveClass(
      'sticky',
      'bottom-0',
      'z-30',
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
    const [back, inside, lace, front, logo] = images;

    expect(images.map((image) => image.getAttribute('src'))).toEqual([
      '/envelope/back.png',
      '/envelope/inside.png',
      '/envelope/lace.png',
      '/envelope/front.png',
      '/couple-logo-rustic.svg',
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
