import { expect, test, type Page } from '@playwright/test';
import { chooseOption } from './choose-option';

async function addGalaxy(page: Page) {
  await page.goto('/product/SMG-S24U');
  await chooseOption(page, '512 GB');
  await chooseOption(page, 'Titanium Black');
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page).toHaveURL(/\/cart$/);
}

async function addPixel(page: Page) {
  await page.goto('/product/GPX-8A');
  // The first storage and the first color, whatever the catalog offers today. `all()` does not
  // wait, so the two groups are awaited first: the detail streams in after its loading state.
  const groups = page
    .getByRole('group')
    .filter({ has: page.getByRole('radio') });
  await expect(groups).toHaveCount(2);
  const [storage, color] = await groups.all();
  await storage.locator('label').first().click();
  await color.locator('label').first().click();
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

  await addGalaxy(first);
  await addPixel(second);

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
  await addGalaxy(cart);

  await addPixel(other);
  await expect(cartTitle(cart, 2)).toBeVisible();
  await expect(cart.getByRole('listitem')).toContainText([
    'Galaxy S24 Ultra',
    'Pixel 8a',
  ]);

  await other
    .getByRole('button', { name: /Eliminar Galaxy S24 Ultra/ })
    .click();
  await expect(cartTitle(cart, 1)).toBeVisible();
  await expect(cart.getByRole('listitem')).toHaveText(/Pixel 8a/);
});
