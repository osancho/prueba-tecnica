import { describe, expect, it, vi } from 'vitest';
import { galaxy } from '../../domain/__mocks__/product-fixture';
import { httpProductRepository } from '../http-product-repository';

const fetchMock = vi.fn();

function answer(status: number, body: unknown) {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockImplementation(async () => Response.json(body, { status }));
}

describe('httpProductRepository.findById', () => {
  it('asks our own Route Handler, escaping the id', async () => {
    answer(200, galaxy);

    await expect(httpProductRepository.findById('SMG-S24U')).resolves.toEqual(
      galaxy,
    );
    await httpProductRepository.findById('../admin');

    expect(fetchMock).toHaveBeenLastCalledWith('/api/products/..%2Fadmin');
  });

  it('reads a null answer as a phone that no longer exists', async () => {
    answer(200, null);

    await expect(httpProductRepository.findById('NOPE')).resolves.toBeNull();
  });

  it('fails on any other error instead of reporting the phone as gone', async () => {
    answer(502, { error: 'BAD-GATEWAY', message: 'Down' });

    await expect(httpProductRepository.findById('SMG-S24U')).rejects.toThrow();
  });

  it('fails when the answer is not a product', async () => {
    answer(200, { id: 'SMG-S24U' });

    await expect(httpProductRepository.findById('SMG-S24U')).rejects.toThrow();
  });
});
