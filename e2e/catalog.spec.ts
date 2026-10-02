import { expect, test } from '@playwright/test';

test('lists 20 different smartphones', async ({ page }) => {
  await page.goto('/');

  const phones = page.getByRole('main').getByRole('listitem');
  await expect(phones).toHaveCount(20);
  const links = await phones
    .getByRole('link')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')),
    );
  expect(new Set(links).size).toBe(20);
  await expect(page.getByText('20 results')).toBeVisible();
});

test('narrows the list as the user searches and keeps the search in the address', async ({
  page,
}) => {
  await page.goto('/');

  await page
    .getByRole('searchbox', { name: 'Search for a smartphone' })
    .fill('samsung');

  await expect(page).toHaveURL(/\?search=samsung$/);
  const phones = page.getByRole('main').getByRole('listitem');
  await expect(phones).not.toHaveCount(20);
  const count = await phones.count();
  expect(count).toBeGreaterThan(0);
  await expect(
    page.getByText(`${count} ${count === 1 ? 'result' : 'results'}`),
  ).toBeVisible();
  for (const phone of await phones.all()) {
    await expect(phone).toContainText(/samsung/i);
  }
});
