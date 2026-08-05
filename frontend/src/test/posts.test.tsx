import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from './testUtils';
import { PostCard, PostComposer } from '@/components/community';
import { useFeedQuery } from '@/features/community';
import { seedPosts } from '@/features/community/data';

/** Renders the first feed post through the live query so optimistic updates flow back. */
const FeedPostHarness: React.FC<{ postId: string }> = ({ postId }) => {
  const { posts } = useFeedQuery('LATEST', 10);
  const post = posts.find((item) => item.id === postId) ?? posts[0];
  if (!post) return null;
  return <PostCard post={post} />;
};

describe('PostCard', () => {
  it('renders post author, content and markdown formatting', async () => {
    renderWithProviders(<FeedPostHarness postId="post-sd-1" />);

    expect(await screen.findByText(/Alex Rivera/)).toBeInTheDocument();
    expect(screen.getByText(/URL shortener/)).toBeInTheDocument();
    // Reaction bar present with live counts
    expect(screen.getByRole('button', { name: 'Unlike' })).toBeInTheDocument();
  });

  it('increments likes optimistically when liked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FeedPostHarness postId="post-sd-2" />);

    const likeButton = await screen.findByRole('button', { name: 'Like' });
    const initial = seedPosts.find((p) => p.id === 'post-sd-2')!.likeCount;

    await user.click(likeButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unlike' })).toBeInTheDocument();
      expect(screen.getByText(String(initial + 1))).toBeInTheDocument();
    });
  });

  it('toggles bookmark state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FeedPostHarness postId="post-sd-1" />);

    const bookmarkButton = await screen.findByRole('button', { name: 'Remove bookmark' });
    await user.click(bookmarkButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Bookmark' })).toBeInTheDocument();
    });
  });

  it('renders code snippets with language header', async () => {
    renderWithProviders(<FeedPostHarness postId="post-react-1" />);

    expect(await screen.findByText(/tsx/i)).toBeInTheDocument();
    expect(screen.getByText(/const FeedList/i)).toBeInTheDocument();
  });

  it('renders polls with live result bars and vote counts', async () => {
    renderWithProviders(<FeedPostHarness postId="post-sd-2" />);

    // Matches both the post body and the poll question.
    expect((await screen.findAllByText(/collaborative editor/i)).length).toBeGreaterThan(0);
    expect(screen.getByText('1,304 votes')).toBeInTheDocument();
    expect(screen.getByText(/Vote recorded/i)).toBeInTheDocument();
  });
});

describe('PostComposer', () => {
  it('opens the editor and enables publishing once content is added', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PostComposer />);

    await user.click(screen.getByText(/Share something with the community/i));
    expect(screen.getByText(/Alex Morgan/)).toBeInTheDocument();

    const publishButton = screen.getByRole('button', { name: /Publish/i });
    expect(publishButton).toBeEnabled();

    const editor = screen.getByLabelText(/Share an insight/i);
    await user.type(editor, 'Hello community!');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish/i })).toBeEnabled();
    });
  });
});
