import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import axios, { AxiosError, type AxiosAdapter } from 'axios';

// Sessions now live in sessionStorage (per-tab isolation) while legacy
// features still write to localStorage. Clear both so tests never inherit
// persisted state from a previous test file.
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// Heavy MUI + framer-motion pages render slowly under parallel test load.
// Give async queries enough headroom so rendering, not timing, decides results.
configure({ asyncUtilTimeout: 5000 });

/**
 * Make real network calls fail instantly in tests. Pages that depend on the
 * API are built with offline seed-data fallbacks, so an immediate network
 * error renders the fallback deterministically instead of timing out under
 * parallel test load.
 */
const offlineAdapter: AxiosAdapter = (config) =>
  Promise.reject(
    new AxiosError('Network Error', AxiosError.ERR_NETWORK, config),
  );

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
