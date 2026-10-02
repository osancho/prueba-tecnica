import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingBar } from '../loading_bar';

describe('LoadingBar', () => {
  it('tells assistive technology that content is loading', () => {
    render(<LoadingBar />);

    expect(
      screen.getByRole('progressbar', { name: 'Loading' }),
    ).toBeInTheDocument();
  });
});
