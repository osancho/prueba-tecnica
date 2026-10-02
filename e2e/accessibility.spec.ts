import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';
import { chooseOption } from './chooseOption';

declare global {
  interface Window {
    axe: typeof axe;
  }
}

// jsdom cannot compute colour contrast, so the unit tests skip it; here every rule runs.
const RULES = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

const viewports = {
  mobile: { width: 393, height: 852 },
  tablet: { width: 834, height: 1194 },
  desktop: { width: 1920, height: 1080 },
};

const screens: Record<string, (page: Page) => Promise<void>> = {
  list: async (page) => {
    await page.goto('/');
    await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(20);
  },
  'search results': async (page) => {
    await page.goto('/?search=galaxy');
    await expect(
      page.getByRole('main').getByText(/\d+ results?/),
    ).toBeVisible();
  },
  'search without results': async (page) => {
    await page.goto('/?search=zzzzzz');
    await expect(page.getByRole('main').getByText('0 results')).toBeVisible();
  },
  'product with nothing chosen': async (page) => {
    await page.goto('/product/SMG-S24U');
    await expect(page.getByRole('button', { name: 'Añadir' })).toBeDisabled();
  },
  'product with storage and color chosen': async (page) => {
    await page.goto('/product/SMG-S24U');
    await chooseOption(page, '512 GB');
    await chooseOption(page, 'Titanium Black');
    await expect(page.getByRole('button', { name: 'Añadir' })).toBeEnabled();
  },
  'empty cart': async (page) => {
    await page.goto('/cart');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cart (0)' }),
    ).toBeVisible();
  },
  'cart with a phone': async (page) => {
    await page.goto('/product/SMG-S24U');
    await chooseOption(page, '512 GB');
    await chooseOption(page, 'Titanium Black');
    await page.getByRole('button', { name: 'Añadir' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Cart (1)' }),
    ).toBeVisible();
  },
  'unknown product': async (page) => {
    await page.goto('/product/NOPE-123');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  },
};

// Reduced motion renders every screen at rest, so contrast is never read mid-fade.
test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const [device, viewport] of Object.entries(viewports)) {
  test.describe(device, () => {
    test.use({ viewport });

    for (const [name, open] of Object.entries(screens)) {
      test(`${name} meets WCAG 2.2 AA and axe best practices`, async ({
        page,
      }) => {
        await open(page);
        await page.addScriptTag({ content: axe.source });

        const violations = await page.evaluate(
          async (tags) =>
            (await window.axe.run(document, { runOnly: tags })).violations.map(
              ({ id, nodes }) =>
                `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`,
            ),
          RULES,
        );

        expect(violations).toEqual([]);
      });
    }
  });
}
