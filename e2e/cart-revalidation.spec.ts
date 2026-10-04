import { expect, test } from '@playwright/test';
import { FAKE_API_APP_URL } from './servers';

const savedLine = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-violet.webp?v=2',
  colorName: 'Titanium Violet',
  capacity: '256 GB',
};

test('brings a saved cart up to date with the catalog when it opens', async ({
  page,
}) => {
  await page.addInitScript(
    (lines) => {
      localStorage.setItem('mbst-cart', JSON.stringify(lines));
    },
    [
      { ...savedLine, lineId: 'stale-price', price: 1 },
      { ...savedLine, lineId: 'gone', id: 'NOPE-123', price: 999 },
    ],
  );

  // A phone that left the catalog is an expected answer, so it must not print a console error.
  const consoleProblems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(message.text());
    }
  });

  await page.goto('/cart');

  await expect(page.getByRole('status')).toHaveText(
    'A phone in your cart is no longer available and was removed. A phone in your cart has a new price.',
  );
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('1229 EUR');
  await expect(
    page.getByText('Total', { exact: true }).locator('xpath=..'),
  ).toHaveText(/^Total\s*1229 EUR$/);
  expect(consoleProblems).toEqual([]);
});

test('checks the saved cart against the catalog as it is now, not a cached copy', async ({
  page,
}) => {
  // A new id each run: Next keeps fetched data on disk across builds.
  const id = `PRICE-${Date.now()}`;
  const cartTotal = page
    .getByText('Total', { exact: true })
    .locator('xpath=..');
  await page.goto(`${FAKE_API_APP_URL}/cart`);
  await page.evaluate((id) => {
    localStorage.setItem(
      'mbst-cart',
      JSON.stringify([
        {
          lineId: 'line-1',
          id,
          brand: 'Test',
          name: 'Changing price',
          imageUrl: `/api/images/${id}.webp?v=3`,
          colorName: 'Black',
          capacity: '128 GB',
          price: 0,
        },
      ]),
    );
  }, id);

  // The fake catalog charges as many euros as times it was asked for this phone.
  await page.reload();
  await expect(cartTotal).toHaveText(/^Total\s*1 EUR$/);
  await page.reload();
  await expect(cartTotal).toHaveText(/^Total\s*2 EUR$/);
  await expect(page.getByRole('status')).toHaveText(
    'A phone in your cart has a new price.',
  );
});
