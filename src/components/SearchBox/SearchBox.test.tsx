import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('passes what the user types to the search', async () => {
    const onChange = vi.fn();
    render(
      <SearchBox
        value=""
        showClear={false}
        onChange={onChange}
        onClear={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search for a smartphone' }),
      'a',
    );

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('offers no clear action while there is nothing to clear', () => {
    render(
      <SearchBox
        value="sam"
        showClear={false}
        onChange={vi.fn()}
        onClear={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument();
  });

  it('clears the search and leaves the user ready to type again', async () => {
    const onClear = vi.fn();
    render(
      <SearchBox
        value="samsung"
        showClear
        onChange={vi.fn()}
        onClear={onClear}
        onSubmit={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('submits the search when the user presses Enter', async () => {
    const onSubmit = vi.fn();
    render(
      <SearchBox
        value="pixel"
        showClear
        onChange={vi.fn()}
        onClear={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.type(screen.getByRole('searchbox'), '{Enter}');

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
