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

    // `-top-px`, not `top-0`: the flat edge is pushed a pixel into the section
    // above so a fractional seam cannot round the two apart. See dome.tsx.
    expect(el.className).toContain('-top-px');
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

    // Positioned off the BOTTOM, not the top: the crown stands in the margin of
    // the section ABOVE, which is what leaves the real backdrop showing around
    // it. The `-1px` is the same seam overlap the other directions take, spent
    // downwards here because a crown's flat edge is its bottom one.
    expect(el.className).toContain('bottom-[calc(100%-1px)]');
    expect(el.className).not.toContain('-top-px');
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
      expect(arch(container).className).not.toContain('[--dome-ry:');
    }
  });

  it('overlaps its neighbour by a pixel, without deepening the curve', () => {
    // The seam overlap has to be spent on the FLAT edge only. If the extra
    // pixel ever reaches the radius the arch grows deeper than the clearances
    // derived from `--dome-ry` in app/globals.css, and the title starts riding
    // into the curve.
    for (const direction of ['down', 'up', 'crown'] as const) {
      const { container } = render(<Dome direction={direction} />);
      const cls = arch(container).className;
      const rounded = cls
        .split(' ')
        .find((c) => c.startsWith('rounded-'));

      // The box takes the pixel...
      expect(cls).toContain('h-[calc(var(--dome-ry)+1px)]');
      // ...and the radius does not: it stays the bare token.
      if (rounded != null) expect(rounded).not.toContain('1px');
    }
  });
});
