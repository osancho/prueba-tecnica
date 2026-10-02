import { expect, test } from '@playwright/test';
import { chooseOption } from './chooseOption';

test('adds the phone to the cart once storage and color are chosen', async ({
  page,
}) => {
  await page.goto('/product/SMG-S24U');
  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Galaxy S24 Ultra',
  });
  const price = heading.locator('xpath=..');
  const add = page.getByRole('button', { name: 'Añadir' });

  await expect(price).toContainText('From 1229 EUR');
  await expect(add).toBeDisabled();

  await chooseOption(page, '512 GB');
  await expect(price).toContainText(/^Galaxy S24 Ultra\s*1329 EUR$/);
  await expect(add).toBeDisabled();

  await chooseOption(page, 'Titanium Black');
  await expect(
    page.getByRole('img', {
      name: 'Samsung Galaxy S24 Ultra in Titanium Black',
    }),
  ).toBeVisible();
  await expect(add).toBeEnabled();

  await add.click();

  await expect(page).toHaveURL(/\/cart$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (1)' }),
  ).toBeVisible();
  // Figma hides the bag on the desktop cart page, so the count is read back on the detail.
  await page.goBack();
  await expect(
    page.getByRole('link', { name: '1 product in the cart' }),
  ).toBeVisible();
});
