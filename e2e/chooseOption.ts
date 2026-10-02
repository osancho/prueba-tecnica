import type { Page } from '@playwright/test';

/** Clicks the visible label of a storage or color radio, as a user does. */
export async function chooseOption(page: Page, name: string) {
  await page
    .locator('label')
    .filter({ has: page.getByRole('radio', { name, exact: true }) })
    .click();
}
