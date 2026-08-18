import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '@/App';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls for an element instead of relying on a fixed sleep — the lazy chunk
 * takes far longer to settle when the whole suite runs in one jsdom process,
 * so fixed waits flake under load.
 */
const waitForText = async (
  text: string,
  timeoutMs = 30000,
): Promise<HTMLElement | null> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const el = screen.queryByText(text);
    if (el) return el;
    await sleep(150);
  }
  return screen.queryByText(text);
};

// The hero headline is split by an inline gradient <span>, so match by
// textContent instead of RTL's default node-text matching.
const byTextContent = (expected: string) => (_content: string, node: Element | null) =>
  node?.textContent === expected;

/**
 * Boots the real application stack (Redux + persist, Theme, Query, Router,
 * lazy pages) against jsdom to catch provider/context/boot regressions.
 *
 * Uses explicit waits: RTL's async findBy* queries do not resolve in this
 * vitest + jsdom environment (lazy chunks commit outside act), so we wait for
 * the lazy module to settle and then assert synchronously.
 */
describe('App smoke test', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('boots, renders the landing page and navigates to login', async () => {
    render(<App />);

    // Wait for the lazy LandingPage chunk to resolve.
    await sleep(4000);
    expect(
      screen.getAllByText(byTextContent('Where Knowledge Creates Value')).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Mentors').length).toBeGreaterThan(0);

    // Simulate navigation to the login route.
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(await waitForText('Welcome back')).toBeInTheDocument();
    expect(
      await waitForText('Sign in to continue your learning journey.'),
    ).toBeInTheDocument();
  }, 30000);
});
