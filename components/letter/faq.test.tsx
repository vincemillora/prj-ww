import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Faq } from '@/components/letter/faq';

describe('Faq', () => {
  it('keeps each opened answer visible while another question is opened', async () => {
    const user = userEvent.setup();

    render(<Faq />);

    const plusOneQuestion = screen.getByRole('button', {
      name: 'Can I bring a plus-one?',
    });
    const kidsQuestion = screen.getByRole('button', {
      name: 'Are kids welcome?',
    });
    const plusOneAnswer = screen.getByText(/Seats are reserved for the names/i);

    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(plusOneAnswer).not.toBeVisible();

    await user.click(plusOneQuestion);

    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(plusOneAnswer).toBeVisible();

    await user.click(kidsQuestion);

    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(plusOneAnswer).toBeVisible();
    expect(kidsQuestion).toHaveAttribute('aria-expanded', 'true');
  });
});
