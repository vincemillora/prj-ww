import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/* eslint-disable @next/next/no-img-element -- expose Next Image output in JSDOM. */
vi.mock('next/image', () => ({
  default: ({
    alt,
    className,
    src,
    placeholder,
    priority,
  }: {
    alt: string;
    className?: string;
    src: string;
    placeholder?: string;
    priority?: boolean;
  }) => (
    <img
      alt={alt}
      className={className}
      src={src}
      data-placeholder={placeholder}
      data-priority={String(!!priority)}
    />
  ),
}));

import { FooterLace } from '@/components/letter/footer-lace';

describe('FooterLace', () => {
  it('renders the lace background without a dome overlay', () => {
    render(<FooterLace />);

    const footer = screen.getByRole('contentinfo');
    // The sign-off and the monogram each sit in their own reveal wrapper now, so
    // this counts the ABSOLUTE layers rather than every direct child. That is
    // still the dome check: a Dome renders as an absolute direct child too, so
    // one absolute layer means the lace and nothing stacked over it.
    const backgrounds = footer.querySelectorAll(':scope > div.absolute');
    const [background] = backgrounds;

    expect(backgrounds).toHaveLength(1);
    expect(background).toHaveClass('absolute', 'inset-0');
  });

  it('blurs the drapery in while leaving it lazy', () => {
    render(<FooterLace />);

    const drapery = screen
      .getByRole('contentinfo')
      .querySelector('img[src*="lace-bg"]');

    // The LQIP is load-bearing, not decoration: the sign-off is white type and
    // this image is the only thing behind it, so without a placeholder the
    // opening frame falls back to the flat `bg-lace` tone. Blur puts real
    // artwork there immediately.
    expect(drapery).toHaveAttribute('data-placeholder', 'blur');
    // Deliberately NOT eager — see the note at the call site.
    expect(drapery).toHaveAttribute('data-priority', 'false');
  });

  it('places the contact sign-off after the couple logo', () => {
    render(<FooterLace />);

    const footer = screen.getByRole('contentinfo');
    const logo = footer.querySelector('img[src="/couple-logo-white.svg"]');
    const contact = screen.getByText('For any questions, please contact us at:');

    expect(logo?.compareDocumentPosition(contact)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText('------')).toBeInTheDocument();
    expect(screen.getByText('Vince & Kc')).toBeInTheDocument();
    expect(screen.getByText('with love')).toBeInTheDocument();
  });

  it('uses the shared section spacing around the full footer', () => {
    render(<FooterLace />);

    const footer = screen.getByRole('contentinfo');
    const signOff = screen.getByText('For any questions, please contact us at:')
      .parentElement;

    expect(footer).toHaveClass('py-section');
    expect(signOff).not.toHaveClass('pb-section');
  });

  it('slowly zooms the couple logo out on hover while respecting reduced motion', () => {
    render(<FooterLace />);

    const logo = screen
      .getByRole('contentinfo')
      .querySelector('img[src="/couple-logo-white.svg"]');

    expect(logo).toHaveClass(
      'transition-transform',
      'duration-[2500ms]',
      'hover:scale-90',
      'motion-reduce:transition-none',
      'motion-reduce:hover:scale-100',
    );
  });
});
