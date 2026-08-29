import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Faq } from '@/components/letter/faq';

describe('Faq', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('keeps each opened answer visible while another question is opened', async () => {
    const user = userEvent.setup();

    render(<Faq />);

    const plusOneQuestion = screen.getByRole('button', {
      name: 'Can I bring a plus-one?',
    });
    const kidsQuestion = screen.getByRole('button', {
      name: 'Are kids welcome?',
    });
    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByText(/Seats are reserved for the names/i),
    ).not.toBeInTheDocument();

    await user.click(plusOneQuestion);

    const plusOneAnswer = screen.getByText(/Seats are reserved for the names/i);

    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(plusOneAnswer).toBeInTheDocument();

    await user.click(kidsQuestion);

    expect(plusOneQuestion).toHaveAttribute('aria-expanded', 'true');
    expect(plusOneAnswer).toBeInTheDocument();
    expect(kidsQuestion).toHaveAttribute('aria-expanded', 'true');
  });

  it('only mounts an answer region after its question is opened', async () => {
    const user = userEvent.setup();

    render(<Faq />);

    expect(document.getElementById('faq-answer-plus-one')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Can I bring a plus-one?' }),
    );

    expect(document.getElementById('faq-answer-plus-one')).toHaveAttribute(
      'role',
      'region',
    );
  });
});
