import { expect, test, type Page } from '@playwright/test';
import { chooseOption } from './choose-option';
import { OTHER_PHONE, PHONE } from './fixtures/catalog';

async function addToCart(page: Page, phone: typeof PHONE | typeof OTHER_PHONE) {
  await page.goto(phone.path);
  await chooseOption(page, phone.storage);
  await chooseOption(page, phone.color);
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page).toHaveURL(/\/cart$/);
}

const cartTitle = (page: Page, count: number) =>
  page.getByRole('heading', { level: 1, name: `Cart (${count})` });

test('keeps the phones added in two tabs, in both tabs and after a reload', async ({
  context,
}) => {
  const first = await context.newPage();
  const second = await context.newPage();
  // Both tabs open before either adds anything, as a user comparing phones would have them.
  await first.goto('/');
  await second.goto('/');

  await addToCart(first, PHONE);
  await addToCart(second, OTHER_PHONE);

  await expect(cartTitle(second, 2)).toBeVisible();
  await expect(cartTitle(first, 2)).toBeVisible();
  await first.reload();
  await expect(cartTitle(first, 2)).toBeVisible();
  await expect(first.getByRole('listitem')).toHaveCount(2);
});

test('shows in an open cart what another tab adds and removes', async ({
  context,
}) => {
  const cart = await context.newPage();
  const other = await context.newPage();
  await addToCart(cart, PHONE);

  await addToCart(other, OTHER_PHONE);
  await expect(cartTitle(cart, 2)).toBeVisible();
  await expect(cart.getByRole('listitem')).toContainText([
    PHONE.name,
    OTHER_PHONE.name,
  ]);

  await other
    .getByRole('button', { name: new RegExp(`Eliminar ${PHONE.name}`) })
    .click();
  await expect(cartTitle(cart, 1)).toBeVisible();
  await expect(cart.getByRole('listitem')).toContainText(OTHER_PHONE.name);
});
