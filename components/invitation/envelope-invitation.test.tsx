import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, prefetch: vi.fn() }),
}));
vi.mock('next/image', () => ({
  default: ({ alt = '', ...props }: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  },
}));

import { EnvelopeInvitation } from '@/components/invitation/envelope-invitation';

/** Stands in for jsdom's missing matchMedia, defaulting to full motion. */
function mockReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function openEnvelope() {
  return screen.getByRole('link', { name: 'Open RSVP invitation' });
}

function stage() {
  return document.querySelector('.invitation-stage') as HTMLElement;
}

/** Runs the pending timers inside act so React flushes the state they set. */
function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  push.mockClear();
  mockReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('EnvelopeInvitation', () => {
  it('keeps the invite code on the real href so the link stays shareable', () => {
    render(<EnvelopeInvitation href="/rsvp?id=guest-code" />);

    expect(openEnvelope()).toHaveAttribute('href', '/rsvp?id=guest-code');
  });

  it('names the senders from the shared couple constant', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    expect(screen.getByText('Vince and Kc')).toBeInTheDocument();
  });

  it('acknowledges the tap before the route resolves', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    expect(stage()).not.toHaveAttribute('data-opening');
    fireEvent.click(openEnvelope());

    // The whole point of the change: the opening plays immediately, so the tap
    // is never left unanswered while the next route is fetched.
    expect(stage()).toHaveAttribute('data-opening', 'true');
    expect(push).not.toHaveBeenCalled();
  });

  it('pushes the route once the envelope has opened', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    fireEvent.click(openEnvelope());
    advance(460);

    expect(push).toHaveBeenCalledExactlyOnceWith('/rsvp');
  });

  it('puts the invitation back if the navigation never lands', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    fireEvent.click(openEnvelope());
    // The envelope animates to opacity 0, so a push that never resolves would
    // otherwise strand the guest on an empty backdrop.
    advance(6000);

    expect(stage()).not.toHaveAttribute('data-opening');
  });

  it('ignores repeat taps while the envelope is already opening', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    fireEvent.click(openEnvelope());
    fireEvent.click(openEnvelope());
    advance(460);

    expect(push).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending push when the invitation unmounts', () => {
    const { unmount } = render(<EnvelopeInvitation href="/rsvp" />);

    fireEvent.click(openEnvelope());
    unmount();
    advance(460);

    expect(push).not.toHaveBeenCalled();
  });

  it('navigates straight away when the guest asked for reduced motion', () => {
    mockReducedMotion(true);
    render(<EnvelopeInvitation href="/rsvp" />);

    const link = openEnvelope();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(link, event);

    // Not intercepted at all: the anchor navigates, with no held beat and no
    // animation left mid-flight.
    expect(event.defaultPrevented).toBe(false);
    expect(stage()).not.toHaveAttribute('data-opening');
    expect(push).not.toHaveBeenCalled();
  });

  it('leaves modified clicks to the browser so open-in-new-tab still works', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    const link = openEnvelope();
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
    });
    fireEvent(link, event);

    expect(event.defaultPrevented).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it('carries both hint states in the markup so CSS can swap them', () => {
    render(<EnvelopeInvitation href="/rsvp" />);

    expect(screen.getByText('Tap the envelope to open the letter')).toBeInTheDocument();
    expect(screen.getByText('Opening the letter…')).toBeInTheDocument();
  });
});
