import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';
import { PHONE } from './fixtures/catalog';

test.beforeEach(async ({ page }) => {
  await page.goto(PHONE.path);
  await chooseOption(page, PHONE.storage);
  await chooseOption(page, PHONE.color);
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page).toHaveURL(/\/cart$/);
});

test('shows the added phone with its options, price and the total', async ({
  page,
}) => {
  const line = page.getByRole('listitem');

  await expect(line.getByRole('heading')).toHaveText(PHONE.name);
  await expect(line).toContainText(`${PHONE.storage} | ${PHONE.color}`);
  await expect(line).toContainText(`${PHONE.price} EUR`);
  await expect(
    page.getByText('Total', { exact: true }).locator('xpath=..'),
  ).toHaveText(new RegExp(`^Total\\s*${PHONE.price} EUR$`));
});

test('keeps the cart after a reload', async ({ page }) => {
  await page.reload();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (1)' }),
  ).toBeVisible();
  await expect(page.getByRole('listitem')).toContainText(PHONE.name);
});

test('empties the cart when the user removes its only phone', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: new RegExp(`Eliminar ${PHONE.name}`) })
    .click();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (0)' }),
  ).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Continue shopping' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pay' })).toHaveCount(0);
});
