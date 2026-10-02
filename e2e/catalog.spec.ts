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
  await expect(page.getByRole('main').getByText('20 results')).toBeVisible();
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
    page
      .getByRole('main')
      .getByText(`${count} ${count === 1 ? 'result' : 'results'}`),
  ).toBeVisible();
  for (const phone of await phones.all()) {
    await expect(phone).toContainText(/samsung/i);
  }
});

test('shows the loading bar first and then the list, as in the prototype', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'commit' });

  const bar = page.getByRole('progressbar', { name: 'Loading' });
  await expect(bar).toBeVisible();
  await expect(bar).toBeHidden();
  await expect(page.getByRole('main').getByText('20 results')).toBeVisible();
});

test('fills the loading bar once, without starting over', async ({ page }) => {
  await page.addInitScript(() => {
    const widths: number[] = [];
    Object.assign(window, { loadingBarWidths: widths });
    const sample = () => {
      // React streams a hidden copy of the page before swapping it in; only the visible bar counts.
      const bar = [...document.querySelectorAll('.loading-bar')].find(
        (element) => !element.closest('[hidden]'),
      );
      if (bar) widths.push(bar.getBoundingClientRect().width);
      if (performance.now() < 3000) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden();

  const widths = await page.evaluate(
    () =>
      (window as unknown as { loadingBarWidths: number[] }).loadingBarWidths,
  );
  const shrinks = widths.filter((width, i) => i > 0 && width < widths[i - 1]);
  expect(widths.length).toBeGreaterThan(0);
  expect(shrinks).toEqual([]);
});
