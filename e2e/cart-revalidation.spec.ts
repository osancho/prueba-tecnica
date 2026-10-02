import { expect, test } from '@playwright/test';

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
