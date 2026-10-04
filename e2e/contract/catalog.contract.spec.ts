import { expect, test, type Locator } from '@playwright/test';

// Against the real API, so nothing here names a phone, a price or a count beyond the brief's
// 20: the catalog is whatever the API serves today.

function hrefsOf(links: Locator): Promise<string[]> {
  return links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
  );
}

test('every phone of the catalog opens its detail page with its photo', async ({
  page,
}) => {
  test.slow();
  await page.goto('/');
  const cards = page.getByRole('main').getByRole('listitem').getByRole('link');
  await expect(cards).toHaveCount(20);

  // The list shows 20 phones; the rest of the catalog is only linked from "Similar items".
  const paths = await hrefsOf(cards);
  const seen = new Set(paths);
  for (const path of paths) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect
      .soft(page.getByRole('button', { name: 'Añadir' }), `${path} opens`)
      .toBeVisible();
    await expect
      .soft(page.getByRole('main').getByRole('img').first(), `${path} photo`)
      .not.toHaveJSProperty('naturalWidth', 0);

    const similar = page
      .getByRole('region', { name: 'Similar items' })
      .getByRole('link');
    for (const href of await hrefsOf(similar)) {
      if (seen.has(href)) continue;
      seen.add(href);
      paths.push(href);
    }
  }
});

test('a search by the brand of a listed phone finds phones of that brand', async ({
  page,
}) => {
  await page.goto('/');
  const phones = page.getByRole('main').getByRole('listitem');
  const brand = await phones.first().locator('p').first().innerText();

  await page
    .getByRole('searchbox', { name: 'Search for a smartphone' })
    .fill(brand);

  await expect(page).toHaveURL(/\?search=/);
  await expect(
    page.getByRole('main').getByText(/^[1-9]\d* results?$/),
  ).toBeVisible();
  for (const phone of await phones.all()) {
    await expect(phone).toContainText(new RegExp(brand, 'i'));
  }
});

test('a phone the catalog does not have shows the not-found page', async ({
  page,
}) => {
  await page.goto('/product/NOPE-123');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible();
});
