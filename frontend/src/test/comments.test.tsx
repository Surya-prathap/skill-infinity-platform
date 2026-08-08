import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import { CommentThread } from '@/components/community';
import { testCommentsByPost } from './fixtures';

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  const { testCommentsByPost } = await import('./fixtures');
  return {
    ...actual,
    communityService: {
      ...actual.communityService,
      getPostComments: vi.fn().mockImplementation((postId: string) =>
        Promise.resolve({ data: { data: { content: testCommentsByPost[postId] ?? [] } } }),
      ),
      createComment: vi.fn().mockImplementation((payload: { postId: string; parentId: string | null; content: string }) =>
        Promise.resolve({
          data: {
            data: {
              id: `cm-new-${Date.now()}`,
              postId: payload.postId,
              parentId: payload.parentId,
              authorId: 'user-me',
              authorName: 'Alex Morgan',
              content: payload.content,
              likeCount: 0,
              liked: false,
              replyCount: 0,
              createdAt: new Date().toISOString(),
            },
          },
        }),
      ),
    },
  };
});

describe('CommentThread', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders top-level comments with author names', async () => {
    renderWithProviders(<CommentThread postId="post-sd-1" />);

    const seed = testCommentsByPost['post-sd-1'] ?? [];
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
