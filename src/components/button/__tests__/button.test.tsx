import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';

describe('Button', () => {
  it('never submits a form unless asked to', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => submit(event.nativeEvent as SubmitEvent)}>
        <Button>Añadir</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(submit).not.toHaveBeenCalled();
  });

  it('submits its form when it is the submit button', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={(event) => submit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit">Pay</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Pay' }));

    expect(submit).toHaveBeenCalledOnce();
  });

  it('keeps the button look next to the classes and state it is given', () => {
    render(
      <Button className="cart__pay" disabled>
        Pay
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toHaveClass('button', 'cart__pay');
    expect(button).toBeDisabled();
  });
});
