import { defineConfig } from '@playwright/test';
import deterministic from './playwright.config';
import { buildAndStartApp, CONTRACT_APP_URL } from './e2e/servers';

// The contract with the real API: what the fake catalog cannot prove. It needs `API_BASE_URL`
// and `API_KEY`, and a slow or changed API fails here, never in the deterministic suite.
export default defineConfig({
  ...deterministic,
  testDir: 'e2e/contract',
  testIgnore: [],
  globalSetup: './e2e/contract/warm-up-api.ts',
  use: { ...deterministic.use, baseURL: CONTRACT_APP_URL },
  webServer: {
    command: buildAndStartApp(CONTRACT_APP_URL),
    url: CONTRACT_APP_URL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
