import type { FullConfig } from '@playwright/test';

const WARM_UP_TIMEOUT = 120_000;

/**
 * The products API runs on Render's free plan and can take about a minute to wake up.
 * Waking it once here keeps the test timeouts short enough to catch real slowness.
 */
export default async function warmUpApi(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const response = await fetch(`${baseURL}/api/products`, {
    signal: AbortSignal.timeout(WARM_UP_TIMEOUT),
  });
  if (!response.ok) {
    throw new Error(`The products API did not wake up: ${response.status}`);
  }
}
