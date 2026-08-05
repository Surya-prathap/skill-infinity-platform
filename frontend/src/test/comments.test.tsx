import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from './testUtils';
import { CommentThread } from '@/components/community';
import { seedComments } from '@/features/community/data';

describe('CommentThread', () => {
  it('renders top-level comments with author names', async () => {
    renderWithProviders(<CommentThread postId="post-sd-1" />);

    const seed = seedComments['post-sd-1'] ?? [];
    expect(await screen.findByText(seed[0]!.authorName)).toBeInTheDocument();
    // Heading + count caption both mention comments.
    expect(screen.getAllByText(/Comments/i).length).toBeGreaterThan(0);
  });

  it('builds nested reply trees under their parents', async () => {
    renderWithProviders(<CommentThread postId="post-sd-1" />);

    // A nested mentor reply is rendered inside the thread
    expect(await screen.findByText(/Agreed on UUIDv7/i)).toBeInTheDocument();
  });

  it('posts a new comment through the top-level composer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentThread postId="post-sd-1" />);

    const editor = await screen.findByLabelText('Add a comment…');
    await user.type(editor, 'This is a brand new comment!');
    await user.click(screen.getByRole('button', { name: 'Comment' }));

    await waitFor(() => {
      expect(screen.getByText('This is a brand new comment!')).toBeInTheDocument();
    });
  });

  it('expands the reply composer on a comment and submits a reply', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommentThread postId="post-career-2" />);

    // First "Reply" toggle opens the composer for the top-level comment (Alex Morgan).
    const replyButtons = await screen.findAllByRole('button', { name: 'Reply' });
    await user.click(replyButtons[0]!);

    const replyEditor = await screen.findByLabelText(/Reply to Alex Morgan/i);
    await user.type(replyEditor, 'Great advice, thank you!');
    await user.click(screen.getByRole('button', { name: 'Submit reply' }));

    await waitFor(() => {
      expect(screen.getByText('Great advice, thank you!')).toBeInTheDocument();
    });
  });

  it('shows an empty state when a post has no comments', async () => {
    renderWithProviders(<CommentThread postId="post-java-1" />);

    expect(await screen.findByText(/No comments yet/i)).toBeInTheDocument();
  });
});
