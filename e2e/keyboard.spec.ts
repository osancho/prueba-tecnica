import { expect, test, type Locator, type Page } from '@playwright/test';
import { PHONE } from './fixtures/catalog';

/** Presses Tab until the target has focus, failing if it is not reachable. */
async function tabTo(page: Page, target: Locator) {
  for (let presses = 0; presses < 20; presses++) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
}

test('finds, configures, adds and removes a phone with the keyboard alone', async ({
  page,
}) => {
  await page.goto('/');

  const search = page.getByRole('searchbox', {
    name: 'Search for a smartphone',
  });
  await tabTo(page, search);
  await page.keyboard.type(PHONE.name);
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('search') === PHONE.name,
  );

  const card = page.getByRole('link', { name: new RegExp(PHONE.name) }).first();
  await tabTo(page, card);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${PHONE.path}$`));

  const firstStorage = page.getByRole('radio', { name: PHONE.firstStorage });
  await tabTo(page, firstStorage);
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  const chosenStorage = page.getByRole('radio', { name: PHONE.storage });
  await expect(chosenStorage).toBeChecked();
  await expect(chosenStorage).toBeFocused();

  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  const chosenColor = page.locator('input[type="radio"]:focus');
  await expect(chosenColor).toBeChecked();
  const colorName = await chosenColor.getAttribute('value');

  const add = page.getByRole('button', { name: 'Añadir' });
  await tabTo(page, add);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('listitem')).toContainText(
    `${PHONE.storage} | ${colorName}`,
  );

  await tabTo(page, page.getByRole('button', { name: /Eliminar/ }));
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Cart (0)' }),
  ).toBeFocused();
});
