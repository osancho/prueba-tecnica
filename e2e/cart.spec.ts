import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';

test.beforeEach(async ({ page }) => {
  await page.goto('/product/SMG-S24U');
  await chooseOption(page, '512 GB');
  await chooseOption(page, 'Titanium Black');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page).toHaveURL(/\/cart$/);
});

test('shows the added phone with its options, price and the total', async ({
  page,
}) => {
  const line = page.getByRole('listitem');

  await expect(line.getByRole('heading')).toHaveText('Galaxy S24 Ultra');
  await expect(line).toContainText('512 GB | Titanium Black');
  await expect(line).toContainText('1329 EUR');
  await expect(
    page.getByText('Total', { exact: true }).locator('xpath=..'),
  ).toHaveText(/^Total\s*1329 EUR$/);
});

test('keeps the cart after a reload', async ({ page }) => {
  await page.reload();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (1)' }),
  ).toBeVisible();
  await expect(page.getByRole('listitem')).toContainText('Galaxy S24 Ultra');
});

test('empties the cart when the user removes its only phone', async ({
  page,
}) => {
  await page.getByRole('button', { name: /Eliminar Galaxy S24 Ultra/ }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (0)' }),
  ).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Continue shopping' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay' })).toHaveCount(0);
});
