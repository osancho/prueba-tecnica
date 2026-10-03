import { expect, test, type Locator } from '@playwright/test';

function hrefsOf(links: Locator): Promise<string[]> {
  return links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
  );
}

// Runs against the real API, so it also checks that every product it serves can be rendered.
test('every phone of the catalog opens its detail page', async ({ page }) => {
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
