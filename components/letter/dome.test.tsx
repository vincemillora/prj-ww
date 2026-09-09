import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Dome } from '@/components/letter/dome';

/** The arch is `aria-hidden` and carries no text, so it is found by box. */
const arch = (container: HTMLElement) =>
  container.firstElementChild as HTMLElement;

describe('Dome', () => {
  it('sits a down arch at the top edge, drawn in the fill', () => {
    const { container } = render(<Dome direction="down" className="bg-paper" />);
    const el = arch(container);

    expect(el.className).toContain('top-0');
    expect(el.className).toContain('bg-paper');
    // Bottom corners rounded away: the fill bulges DOWN into the section.
    expect(el.className).toContain(
      'rounded-[0_0_50%_50%_/_0_0_var(--dome-ry)_var(--dome-ry)]',
    );
    expect(el).toHaveAttribute('aria-hidden');
  });

  it('masks an up arch out of the fill rather than painting one', () => {
    const { container } = render(<Dome direction="up" className="bg-paper" />);
    const el = arch(container);

    // The hole is what shows the section's own ground through the band, so a
    // rounded box here would be the bug the component's note warns about: an
    // arch of the wrong colour standing on the section.
    expect(el.style.maskImage).toContain('radial-gradient');
    expect(el.className).not.toContain('rounded-');
  });

  it('parks a crown outside the top edge, at the crown depth', () => {
    const { container } = render(
      <Dome direction="crown" className="bg-paper" />,
    );
    const el = arch(container);

    // `bottom-full`, not `top-0`: the crown stands in the margin of the section
    // ABOVE, which is what leaves the real backdrop showing around it.
    expect(el.className).toContain('bottom-full');
    expect(el.className).not.toContain('top-0');
    // Top corners rounded away, the mirror of the `down` arch.
    expect(el.className).toContain(
      'rounded-[50%_50%_0_0_/_var(--dome-ry)_var(--dome-ry)_0_0]',
    );
    // A crown is a shape, not a band: masking it would cut the arch away.
    expect(el.style.maskImage).toBe('');
  });

  it('never declares its own depth, so the token stays the one source', () => {
    // Re-declaring `--dome-ry` here is what used to let the arch and the
    // clearances derived from it in app/globals.css drift apart. Every
    // direction reads the same depth, so none of them may re-point it either.
    for (const direction of ['down', 'up', 'crown'] as const) {
      const { container } = render(<Dome direction={direction} />);
      expect(arch(container).className).toContain('h-[var(--dome-ry)]');
      expect(arch(container).className).not.toContain('[--dome-ry:');
    }
  });
});
