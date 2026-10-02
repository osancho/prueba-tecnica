import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultsCount } from './results_count';

describe('ResultsCount', () => {
  it.each([
    [20, '20 results'],
    [1, '1 result'],
    [0, '0 results'],
  ])('announces %i matches politely', (count, text) => {
    render(<ResultsCount count={count} hidden={false} />);

    expect(screen.getByText(text)).toHaveAttribute('aria-live', 'polite');
  });
});
