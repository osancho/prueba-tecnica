import { defineConfig, devices } from '@playwright/test';
import { APP_URL, FAKE_API_APP_URL, FAKE_API_URL, portOf } from './e2e/servers';

export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/warm_up_api.ts',
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
      command: `node e2e/fake_api.mjs ${portOf(FAKE_API_URL)}`,
      url: `${FAKE_API_URL}/__hits`,
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npm start -- -p ${portOf(APP_URL)}`,
      url: APP_URL,
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: `npm start -- -p ${portOf(FAKE_API_APP_URL)}`,
      url: FAKE_API_APP_URL,
      reuseExistingServer: false,
      env: { API_BASE_URL: FAKE_API_URL, API_KEY: 'fake-api-key' },
    },
  ],
});
