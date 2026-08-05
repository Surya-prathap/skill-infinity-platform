import { useMemo, useState } from 'react';
import { Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { CommentItem } from './CommentItem';
import { RichTextEditor } from './RichTextEditor';
import { useCommentsQuery, useCreateCommentMutation } from '@/features/community';
import { CURRENT_USER_NAME } from '@/features/community/data';
import { EmptyState, ListSkeleton } from '@/components/feedback';
import type { CommunityComment } from '@/types';

interface CommentThreadProps {
  postId: string;
}

type CommentSort = 'TOP' | 'NEWEST';

/** Builds a reply tree from a flat comment list. */
const buildTree = (comments: CommunityComment[]): CommunityComment[] => {
  const byParent = new Map<string | null, CommunityComment[]>();
  for (const comment of comments) {
    const parent = comment.parentId ?? null;
    const bucket = byParent.get(parent) ?? [];
    bucket.push(comment);
    byParent.set(parent, bucket);
  }
  const attach = (comment: CommunityComment): CommunityComment => ({
    ...comment,
    replies: (byParent.get(comment.id) ?? []).map(attach),
  });
  return (byParent.get(null) ?? []).map(attach);
};

const countTotal = (tree: CommunityComment[]): number =>
  tree.reduce((sum, comment) => sum + 1 + countTotal(comment.replies ?? []), 0);

/** Premium comment section with threaded replies and a top-level composer. */
export const CommentThread: React.FC<CommentThreadProps> = ({ postId }) => {
  const { comments, isOffline, isLoading } = useCommentsQuery(postId);
  const createComment = useCreateCommentMutation(postId);
  const [content, setContent] = useState('');
  const [sort, setSort] = useState<CommentSort>('TOP');

  const tree = useMemo(() => {
    const sorted = [...comments];
    if (sort === 'TOP') {
      sorted.sort((a, b) => (b.likeCount + (b.reactions ?? []).reduce((sum, r) => sum + r.count, 0)) - (a.likeCount + (a.reactions ?? []).reduce((sum, r) => sum + r.count, 0)));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return buildTree(sorted);
  }, [comments, sort]);

  const totalComments = countTotal(tree);
  const [replyKey, setReplyKey] = useState(0);

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    createComment.mutate(
      { postId, parentId: null, content: trimmed, mentions: [] },
      {
        onSuccess: () => {
          setContent('');
          setReplyKey((key) => key + 1);
        },
      },
    );
  };

  return (
    <Card sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
          }}
        >
          <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 19 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={800}>
            Comments
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </Typography>
        </Box>
        <Stack direction="row" gap={0.5}>
          {(['TOP', 'NEWEST'] as CommentSort[]).map((option) => (
            <Button
              key={option}
              size="small"
              variant={sort === option ? 'contained' : 'outlined'}
              onClick={() => setSort(option)}
              sx={{ minWidth: 0, px: 1.5, fontWeight: 800 }}
            >
              {option === 'TOP' ? 'Top' : 'Newest'}
            </Button>
          ))}
        </Stack>
      </Stack>

      {/* Top-level composer */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" gap={1.5} alignItems="flex-start">
          <Avatar name={CURRENT_USER_NAME} size={38} />
          <Box sx={{ flexGrow: 1 }}>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Add a comment…"
              minRows={2}
              onSubmit={submit}
            />
            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Button variant="contained" size="small" onClick={submit} disabled={!content.trim() || createComment.isPending}>
                {createComment.isPending ? 'Posting…' : 'Comment'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {isLoading && comments.length === 0 ? (
        <ListSkeleton count={3} />
      ) : tree.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleOutlineOutlinedIcon />}
          title="No comments yet"
          description="Be the first to start the conversation on this post."
        />
      ) : (
        <Stack spacing={2}>
          {tree.map((comment) => (
            <motion.div
              key={`${comment.id}-${replyKey}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CommentItem comment={comment} postId={postId} />
            </motion.div>
          ))}
        </Stack>
      )}

      {isOffline && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Offline mode — comments are demo data.
        </Typography>
      )}
    </Card>
  );
};

export default CommentThread;
