import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { galaxy } from '@/core/product/domain/__mocks__/product-fixture';
import { ProductSpecs } from '../product-specs';

describe('ProductSpecs', () => {
  it('pairs every specification with its value', () => {
    render(<ProductSpecs product={galaxy} />);

    const specs = screen.getByRole('region', { name: 'Specifications' });
    const battery = within(specs).getByText('Battery').closest('div');
    expect(battery).toHaveTextContent('5000 mAh');
    expect(within(specs).getAllByRole('term')).toHaveLength(11);
  });
});
