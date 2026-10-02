import { expect, test } from '@playwright/test';
import { FAKE_API_APP_URL, FAKE_API_URL } from './servers';

test('asks the products API once per page, even while it is down', async ({
  page,
  request,
}) => {
  // A new id each run: Next keeps fetched data on disk across builds.
  const id = `DOWN-${Date.now()}`;

  await page.goto(`${FAKE_API_APP_URL}/product/${id}`);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Something went wrong' }),
  ).toBeVisible();

  const hits = await (await request.get(`${FAKE_API_URL}/__hits`)).json();
  expect(hits[`/products/${id}`]).toBe(1);
});
