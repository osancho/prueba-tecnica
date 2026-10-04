import { expect, test, type Page } from '@playwright/test';
import { FAKE_API_APP_URL, FAKE_API_URL } from './servers';

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

test('lists and counts every different phone a search finds, even beyond 20', async ({
  page,
}) => {
  await page.goto('/');

  // "a" matches more than 20 different phones in the live catalog.
  await page
    .getByRole('searchbox', { name: 'Search for a smartphone' })
    .fill('a');

  await expect(page).toHaveURL(/\?search=a$/);
  const phones = page.getByRole('main').getByRole('listitem');
  await expect(phones).not.toHaveCount(20);
  const count = await phones.count();
  expect(count).toBeGreaterThan(20);
  const links = await phones
    .getByRole('link')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')),
    );
  expect(new Set(links).size).toBe(count);
  await expect(
    page.getByRole('main').getByText(`${count} results`),
  ).toBeVisible();
});

/** Records, on every frame, the width of the loading bar on screen and how opaque the list is. */
function recordFrames() {
  const frames: Frame[] = [];
  Object.assign(window, { recordedFrames: frames });
  const sample = () => {
    const bar = [...document.querySelectorAll('[role="progressbar"]')].find(
      (element) =>
        element.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
        }),
    );
    // React streams the page inside a hidden element before revealing it.
    const list = [...document.querySelectorAll('main > div')].find(
      (element) => !element.closest('[hidden]'),
    );
    frames.push({
      time: performance.now(),
      barWidth: bar?.getBoundingClientRect().width ?? null,
      listOpacity: list ? Number(getComputedStyle(list).opacity) : null,
    });
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

interface Frame {
  time: number;
  barWidth: number | null;
  listOpacity: number | null;
}

function recordedFrames(page: Page): Promise<Frame[]> {
  return page.evaluate(
    () =>
      (window as unknown as { recordedFrames?: Frame[] }).recordedFrames ?? [],
  );
}

/** Opens the list while the products API holds its answer, so the test decides when it arrives. */
async function openListWhileApiHolds(page: Page) {
  const search = `hold-${Date.now()}-${test.info().parallelIndex}`;
  await page.addInitScript(recordFrames);
  await page.goto(`${FAKE_API_APP_URL}/?search=${search}`, {
    waitUntil: 'commit',
  });
  return () => page.request.get(`${FAKE_API_URL}/__release?search=${search}`);
}

test('shows the loading bar while the server prepares the list, and the list as soon as it arrives', async ({
  page,
}) => {
  const releaseList = await openListWhileApiHolds(page);
  const bar = page.getByRole('progressbar', { name: 'Loading' });
  await expect(bar).toBeVisible();
  await expect(page.getByRole('main')).toHaveCount(0);

  await releaseList();

  await expect(page.getByRole('main').getByText('0 results')).toBeVisible();
  await expect(bar).toBeHidden();
  await expect
    .poll(async () => (await recordedFrames(page)).at(-1)?.listOpacity)
    .toBe(1);
  const frames = await recordedFrames(page);
  const arrived = frames.find((frame) => frame.listOpacity !== null)!;
  const shown = frames.find((frame) => frame.listOpacity! >= 0.5)!;
  expect(shown.time - arrived.time).toBeLessThan(300);
});

test('fills the loading bar once, without starting over', async ({ page }) => {
  const releaseList = await openListWhileApiHolds(page);
  const fullWidth = page.viewportSize()!.width;
  await expect
    .poll(async () => (await recordedFrames(page)).at(-1)?.barWidth)
    .toBe(fullWidth);

  await releaseList();
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeHidden();

  const widths = (await recordedFrames(page))
    .map((frame) => frame.barWidth)
    .filter((width) => width !== null);
  const shrinks = widths.filter((width, i) => i > 0 && width < widths[i - 1]);
  expect(widths.length).toBeGreaterThan(0);
  expect(shrinks).toEqual([]);
});
