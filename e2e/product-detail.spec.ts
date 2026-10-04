import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';
import { PHONE } from './fixtures/catalog';

test('adds the phone to the cart once storage and color are chosen', async ({
  page,
}) => {
  await page.goto(PHONE.path);
  const heading = page.getByRole('heading', {
    level: 1,
    name: PHONE.name,
  });
  const price = heading.locator('xpath=..');
  const add = page.getByRole('button', { name: 'Añadir' });

  await expect(price).toContainText(`From ${PHONE.lowestPrice} EUR`);
  await expect(add).toBeDisabled();

  await chooseOption(page, PHONE.storage);
  await expect(price).toHaveText(
    new RegExp(`^${PHONE.name}\\s*${PHONE.price} EUR$`),
  );
  await expect(add).toBeDisabled();

  await chooseOption(page, PHONE.color);
  await expect(
    page.getByRole('img', {
      name: `${PHONE.brand} ${PHONE.name} in ${PHONE.color}`,
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
