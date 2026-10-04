import { expect, test } from '@playwright/test';
import { PHONE } from './fixtures/catalog';

for (const path of ['/', PHONE.path, '/cart', '/api/products']) {
  test(`${path} cannot be framed or sniffed and keeps addresses private`, async ({
    request,
  }) => {
    const response = await request.get(path);

    expect(response.headers()).toMatchObject({
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'content-security-policy': "frame-ancestors 'none'",
    });
  });
}
