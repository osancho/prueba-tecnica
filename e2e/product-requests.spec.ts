import { expect, test } from '@playwright/test';
import { FAKE_API_URL } from './servers';

test('asks the products API once per page, even while it is down', async ({
  page,
  request,
}) => {
  // A new id each run, so the count starts at zero. The fake API is down for DOWN-* phones.
  const id = `DOWN-${Date.now()}`;

  await page.goto(`/product/${id}`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Something went wrong' }),
  ).toBeVisible();

  const hits = await (await request.get(`${FAKE_API_URL}/__hits`)).json();
  expect(hits[`/products/${id}`]).toBe(1);
});
