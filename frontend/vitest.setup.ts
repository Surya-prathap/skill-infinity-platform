import '@testing-library/jest-dom/vitest';

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
