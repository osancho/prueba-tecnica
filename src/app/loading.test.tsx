import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from './loading';

describe('Loading', () => {
  it('leaves only the header on screen while a page loads, as Figma "Unloaded"', () => {
    const { container } = render(<Loading />);

    expect(container).toBeEmptyDOMElement();
  });
});
