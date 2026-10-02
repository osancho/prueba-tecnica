import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BackLink } from './back_link';

describe('BackLink', () => {
  afterEach(() => sessionStorage.clear());

  it('returns to the full list when the user did not come from it', () => {
    render(<BackLink />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('returns to the search the user came from', () => {
    sessionStorage.setItem('mbst-list-url', '/?search=pixel');

    render(<BackLink />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/?search=pixel',
    );
  });
});
