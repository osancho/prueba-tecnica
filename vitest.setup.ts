import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  // jsdom has no Web Animations API; tests that need it define it on the prototype.
  if (typeof Element !== 'undefined') {
    delete (Element.prototype as Partial<Element>).animate;
  }
});
