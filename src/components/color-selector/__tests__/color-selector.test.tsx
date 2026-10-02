import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorSelector } from '../color-selector';

const options = [
  { name: 'Titanium Violet', hexCode: '#8E6F96', imageUrl: '/violet.webp' },
  { name: 'Titanium Black', hexCode: '#000000', imageUrl: '/black.webp' },
];

// The swatch labels also hold each name for screen readers; the shown name sits outside them.
const shownName = (name: string) =>
  screen.queryAllByText(name).find((element) => !element.closest('label'));

describe('ColorSelector', () => {
  it('names every swatch for screen reader users', async () => {
    const onChange = vi.fn();
    render(<ColorSelector options={options} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('radio', { name: 'Titanium Black' }),
    );

    expect(onChange).toHaveBeenCalledWith('Titanium Black');
  });

  it('lets keyboard users move to the next color with the arrow keys', async () => {
    const onChange = vi.fn();
    render(
      <ColorSelector
        options={options}
        value="Titanium Violet"
        onChange={onChange}
      />,
    );

    await userEvent.tab();
    expect(
      screen.getByRole('radio', { name: 'Titanium Violet' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('Titanium Black');
  });

  it('shows the name of the chosen color only once one is chosen', () => {
    const { rerender } = render(
      <ColorSelector options={options} onChange={vi.fn()} />,
    );
    expect(shownName('Titanium Violet')).toBeUndefined();

    rerender(
      <ColorSelector
        options={options}
        value="Titanium Violet"
        onChange={vi.fn()}
      />,
    );

    expect(shownName('Titanium Violet')).toBeVisible();
  });

  it('previews the name of the color under the pointer', async () => {
    render(<ColorSelector options={options} onChange={vi.fn()} />);

    await userEvent.hover(
      screen.getByRole('radio', { name: 'Titanium Black' }).closest('label')!,
    );
    expect(shownName('Titanium Black')).toBeVisible();

    await userEvent.unhover(
      screen.getByRole('radio', { name: 'Titanium Black' }).closest('label')!,
    );
    expect(shownName('Titanium Black')).toBeUndefined();
  });
});
