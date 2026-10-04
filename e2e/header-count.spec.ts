import { expect, test } from '@playwright/test';

const savedLine = (lineId: string) => ({
  lineId,
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  imageUrl: '/api/images/SMG-S24U-titanium-black.webp?v=2',
  colorName: 'Titanium Black',
  capacity: '512 GB',
  price: 1329,
});

test('never shows a cart count other than the saved one', async ({ page }) => {
  await page.addInitScript(
    (lines) => {
      localStorage.setItem('mbst-cart', JSON.stringify(lines));
      // Every label the cart link ever carries, from the first byte of HTML on.
      const labels: (string | null)[] = [];
      Object.assign(window, { cartLinkLabels: labels });
      new MutationObserver(() => {
        const label =
          document
            .querySelector('a[href="/cart"]')
            ?.getAttribute('aria-label') ?? null;
        if (label && labels.at(-1) !== label) labels.push(label);
      }).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    },
    [savedLine('a'), savedLine('b')],
  );

  await page.goto('/');

  await expect(
    page.getByRole('link', { name: '2 products in the cart' }),
  ).toBeVisible();
  const labels = await page.evaluate(
    () => (window as unknown as { cartLinkLabels: string[] }).cartLinkLabels,
  );
  expect(labels).toEqual(['2 products in the cart']);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('sends no cart count, since only the browser knows the saved cart', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'MBST home' })).toBeVisible();
    await expect(page.getByRole('link', { name: /in the cart/ })).toHaveCount(
      0,
    );
  });
});
