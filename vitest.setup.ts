import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import { configureAxe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);
// Global options apply to the axe-core instance every test shares. jsdom loads no CSS and
// has no canvas, so contrast is checked in the browser instead.
configureAxe({
  globalOptions: { rules: [{ id: 'color-contrast', enabled: false }] },
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  // jsdom has no Web Animations API; tests that need it define it on the prototype.
  if (typeof Element !== 'undefined') {
    delete (Element.prototype as Partial<Element>).animate;
  }
});
