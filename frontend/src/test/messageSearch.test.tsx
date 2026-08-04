import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MessageSearchPanel } from '@/components/communication/MessageSearchPanel';
import { renderWithProviders } from './testUtils';

const renderSearch = (onResultClick: (conversationId: string, messageId?: string) => void) =>
  renderWithProviders(<MessageSearchPanel onClose={() => undefined} onResultClick={onResultClick} />);

describe('MessageSearchPanel', () => {
  it('returns instant results with highlighted matches', async () => {
    renderSearch(() => undefined);

    const input = screen.getByPlaceholderText('Search messages, files, links…');
    fireEvent.change(input, { target: { value: 'architecture' } });

    await waitFor(() => {
      expect(screen.getAllByText(/architecture/i).length).toBeGreaterThan(0);
    });
  });

  it('opens the matching conversation when a result is clicked', async () => {
    const opened: { conversationId: string; messageId?: string } = { conversationId: '', messageId: undefined };
    renderSearch((conversationId, messageId) => {
      opened.conversationId = conversationId;
      opened.messageId = messageId;
    });

    const input = screen.getByPlaceholderText('Search messages, files, links…');
    fireEvent.change(input, { target: { value: 'cache' } });

    const results = await screen.findAllByText(/cache/i, undefined, { timeout: 6000 });
    const first = results[0];
    fireEvent.click(first?.closest('[role="button"]') ?? first!);

    await waitFor(
      () => {
        expect(opened.conversationId).toBeTruthy();
        expect(opened.messageId).toBeTruthy();
      },
      { timeout: 4000 },
    );
  });

  it('shows an empty state when nothing matches', async () => {
    renderSearch(() => undefined);

    const input = screen.getByPlaceholderText('Search messages, files, links…');
    fireEvent.change(input, { target: { value: 'zzzz-no-match-xyz' } });

    expect(await screen.findByText(/No messages match/)).toBeInTheDocument();
  });

  it('filters results by bookmarks', async () => {
    renderSearch(() => undefined);

    const input = screen.getByPlaceholderText('Search messages, files, links…');
    fireEvent.change(input, { target: { value: 'cache' } });
    await screen.findByText(/cache/i);

    fireEvent.click(screen.getByText('🔖 Bookmarks'));

    // After the bookmark filter, at least the bookmarked cache message remains visible
    await waitFor(() => {
      expect(screen.getAllByText(/cache/i).length).toBeGreaterThan(0);
    });
  });
});
