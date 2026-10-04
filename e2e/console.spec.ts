import { expect, test, type Page } from '@playwright/test';
import { PHONE, UNKNOWN_PATH } from './fixtures/catalog';

// Chrome reports some warnings, such as unused preloads, a few seconds after `load`.
const LATE_WARNINGS_DELAY = 5_500;

/** Every warning and error the user would see in DevTools, browser-generated ones included. */
function recordConsoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message}`));
  return problems;
}

function unusedStylePreloads(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const applied = new Set(
      [...document.styleSheets].map((sheet) => sheet.href),
    );
    return [
      ...document.querySelectorAll<HTMLLinkElement>(
        'link[rel=preload][as=style]',
      ),
    ]
      .map((link) => link.href)
      .filter((href) => !applied.has(href));
  });
}

for (const path of ['/', PHONE.path, '/cart', UNKNOWN_PATH]) {
  test(`${path} leaves the browser console clean`, async ({ page }) => {
    const problems = recordConsoleProblems(page);

    await page.goto(path, { waitUntil: 'load' });
    await page.waitForTimeout(LATE_WARNINGS_DELAY);

    expect(problems).toEqual([]);
    expect(await unusedStylePreloads(page)).toEqual([]);
  });
}
