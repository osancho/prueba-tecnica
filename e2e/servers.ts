/** The production app against the real API. */
export const APP_URL = 'http://localhost:3150';
/** A stand-in for the products API that counts the requests it receives. */
export const FAKE_API_URL = 'http://localhost:3199';
/** The same production build, wired to the fake API. */
export const FAKE_API_APP_URL = 'http://localhost:3151';

export const portOf = (url: string) => new URL(url).port;
