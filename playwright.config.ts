import { defineConfig, devices } from '@playwright/test';
import { APP_URL, buildAndStartApp, FAKE_API_URL, portOf } from './e2e/servers';

// The deterministic suite: the production build against the fake API, so nothing here depends
// on the network. The specs that need the real API live in `playwright.contract.config.ts`.
export default defineConfig({
  testDir: 'e2e',
  testIgnore: 'contract/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Started one after another. Always the current production build: the console warnings
  // these tests guard against only exist after `next build`, never in `next dev`.
  webServer: [
    {
      command: `node e2e/fake-api.mjs ${portOf(FAKE_API_URL)}`,
      url: `${FAKE_API_URL}/__hits`,
      reuseExistingServer: false,
    },
    {
      command: buildAndStartApp(APP_URL),
      url: APP_URL,
      reuseExistingServer: false,
      timeout: 180_000,
      env: { API_BASE_URL: FAKE_API_URL, API_KEY: 'fake-api-key' },
    },
  ],
});
