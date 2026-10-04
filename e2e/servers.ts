/** The production app wired to the fake API: what every spec opens, except the contract ones. */
export const APP_URL = 'http://localhost:3151';
/** A stand-in for the products API with a fixed catalog, which counts the requests it receives. */
export const FAKE_API_URL = 'http://localhost:3199';
/** The production app wired to the real API, for the contract specs. */
export const CONTRACT_APP_URL = 'http://localhost:3150';

export const portOf = (url: string) => new URL(url).port;

// Next keeps fetched data on disk across builds: without the `rm`, a run would read the answers
// of the previous one instead of the API as it is now.
export const buildAndStartApp = (url: string) =>
  `pnpm build && rm -rf .next/cache/fetch-cache && pnpm start -p ${portOf(url)}`;
