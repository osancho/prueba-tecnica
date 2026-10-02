import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OptionGroup } from '../option-group';

describe('OptionGroup', () => {
  it('announces its options as one group named after its label', () => {
    render(
      <OptionGroup label="Color. Pick your favourite.">
        <label>
          <input type="radio" name="color" /> Titanium Violet
        </label>
        <label>
          <input type="radio" name="color" /> Titanium Black
        </label>
      </OptionGroup>,
    );

    const group = screen.getByRole('group', {
      name: 'Color. Pick your favourite.',
    });
    expect(within(group).getAllByRole('radio')).toHaveLength(2);
  });
});
