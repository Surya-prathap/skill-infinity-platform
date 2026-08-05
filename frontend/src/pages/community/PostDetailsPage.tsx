import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { PostCard, CommentThread } from '@/components/community';
import { PostCardSkeleton } from '@/components/community';
import { ErrorState } from '@/components/feedback';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { usePostQuery, useTrendingPostsQuery } from '@/features/community';
import { ROUTES } from '@/constants';
import type { CommunityPost } from '@/types';

export const PostDetailsPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { post, isLoading, isOffline } = usePostQuery(postId);
  const { posts: related } = useTrendingPostsQuery(4);

  useDocumentTitle(post?.title ?? post?.content.slice(0, 48) ?? 'Post');

  if (isLoading && !post) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <PostCardSkeleton />
      </Box>
    );
  }

  if (!post) {
    return (
      <ErrorState
        title="Post not found"
        message="This post may have been deleted or the link is incorrect."
        actionLabel="Back to community"
        onAction={() => navigate(ROUTES.COMMUNITY)}
      />
    );
  }

  const handleOpen = (item: CommunityPost) => navigate(ROUTES.COMMUNITY_POST.replace(':postId', item.id));
  const relatedPosts = related.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <PostCard post={post} onDeleted={() => navigate(ROUTES.COMMUNITY)} />
      </motion.div>

      <Box sx={{ mt: 3 }}>
        <CommentThread postId={post.id} />
      </Box>

      {isOffline && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Offline mode — showing demo data.
        </Typography>
      )}

      {relatedPosts.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
            <AutoAwesomeOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={800}>
              Related discussions
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            {relatedPosts.map((item) => (
              <Box
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpen(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleOpen(item);
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateX(4px)' },
                }}
              >
                <ForumOutlinedIcon sx={{ color: 'text.secondary' }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography fontSize="0.85rem" fontWeight={700} noWrap>
                    {item.title ?? item.content.slice(0, 60)}
                  </Typography>
                  <Stack direction="row" gap={1} sx={{ mt: 0.25 }}>
                    {item.tags?.slice(0, 2).map((tag) => (
                      <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }} />
                    ))}
                  </Stack>
                </Box>
                <Typography fontSize="0.75rem" fontWeight={700} color="text.secondary">
                  {item.likeCount} likes
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default PostDetailsPage;
