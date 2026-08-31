import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Countdown } from '@/components/countdown';

describe('Countdown', () => {
  it('renders the large countdown with the shared date-strip dot separators', () => {
    render(<Countdown size="lg" label={null} />);

    expect(document.querySelectorAll('[aria-hidden] .rounded-full.bg-current')).toHaveLength(3);
  });
});
