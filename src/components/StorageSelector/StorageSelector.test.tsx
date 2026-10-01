import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StorageSelector } from './StorageSelector';

const options = [
  { capacity: '256 GB', price: 1229 },
  { capacity: '512 GB', price: 1329 },
];

describe('StorageSelector', () => {
  it('offers each storage option in a labelled group', () => {
    render(<StorageSelector options={options} onChange={vi.fn()} />);

    const group = screen.getByRole('group', {
      name: 'Storage ¿how much space do you need?',
    });
    expect(group).toContainElement(
      screen.getByRole('radio', { name: '256 GB' }),
    );
    expect(screen.getByRole('radio', { name: '512 GB' })).not.toBeChecked();
  });

  it('lets keyboard users move to the next option with the arrow keys', async () => {
    const onChange = vi.fn();
    render(
      <StorageSelector options={options} value="256 GB" onChange={onChange} />,
    );

    await userEvent.click(screen.getByRole('radio', { name: '256 GB' }));
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('512 GB');
  });
});
