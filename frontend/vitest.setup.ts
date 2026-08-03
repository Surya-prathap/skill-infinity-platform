import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import axios, { type AxiosAdapter } from 'axios';

// Heavy MUI + framer-motion pages render slowly under parallel test load.
// Give async queries enough headroom so rendering, not timing, decides results.
configure({ asyncUtilTimeout: 5000 });

/**
 * Make real network calls fail instantly in tests. Pages that depend on the
 * API are built with offline seed-data fallbacks, so an immediate network
 * error renders the fallback deterministically instead of timing out under
 * parallel test load.
 */
const offlineAdapter: AxiosAdapter = () =>
  Promise.reject({
    isAxiosError: true,
    code: 'ERR_NETWORK',
    message: 'Network Error',
    response: undefined,
    config: { timeout: 0 },
    toJSON: () => ({}),
  });

// apiClient is created via axios.create() and inherits the default adapter.
axios.defaults.adapter = offlineAdapter;

// Mock matchMedia which is not implemented in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Framer Motion uses IntersectionObserver for whileInView — stub it in jsdom.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly scrollMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(_callback: IntersectionObserverCallback) {}

  observe = (): void => {};
  unobserve = (): void => {};
  disconnect = (): void => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
}

// eslint-disable-next-line no-undef
(globalThis as Record<string, unknown>).IntersectionObserver = MockIntersectionObserver;

// window.scrollTo is not implemented in jsdom.
window.scrollTo = () => {};

// HTMLElement.scrollIntoView is not implemented in jsdom.
HTMLElement.prototype.scrollIntoView = () => {};
