import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Countdown } from '@/components/countdown';

describe('Countdown', () => {
  it('renders the large countdown without dot separators', () => {
    render(<Countdown size="lg" label={null} />);

    expect(screen.queryAllByText('·')).toHaveLength(0);
  });
});
