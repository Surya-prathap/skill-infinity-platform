import { Box, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useTrendingPostsQuery } from '@/features/community';
import { formatRelativeTime } from '@/utils';
import { ROUTES } from '@/constants';

interface TrendingCardProps {
  limit?: number;
}

/** Ranked trending discussions list. */
export const TrendingCard: React.FC<TrendingCardProps> = ({ limit = 5 }) => {
  const { posts, isLoading } = useTrendingPostsQuery(limit);
  const navigate = useNavigate();

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 19 }} />
        </Box>
        <Typography variant="h6" fontWeight={800}>
          Trending
        </Typography>
        <Chip label="Live" size="small" color="error" sx={{ ml: 'auto', height: 20, fontSize: '0.65rem', fontWeight: 800, '& .MuiChip-label': { px: 1 } }} />
      </Stack>

      <Stack spacing={1}>
        {isLoading && posts.length === 0
          ? [0, 1, 2].map((index) => <Skeleton key={index} variant="rounded" height={56} />)
          : posts.slice(0, limit).map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(ROUTES.COMMUNITY_POST.replace(':postId', post.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') navigate(ROUTES.COMMUNITY_POST.replace(':postId', post.id));
                  }}
                  sx={{
                    display: 'flex',
                    gap: 1.25,
                    p: 1.25,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease, transform 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover', transform: 'translateX(3px)' },
                  }}
                >
                  <RankBadge rank={index + 1} />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      fontSize="0.83rem"
                      fontWeight={700}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {post.title ?? truncatePost(post.content)}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.4, color: 'text.secondary' }}>
                      <Stack direction="row" alignItems="center" gap={0.3} sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        <ThumbUpOutlinedIcon sx={{ fontSize: 12 }} /> {post.likeCount}
                      </Stack>
                      <Stack direction="row" alignItems="center" gap={0.3} sx={{ fontSize: '0.72rem', fontWeight: 600 }}>
                        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 12 }} /> {post.commentCount}
                      </Stack>
                      <Typography sx={{ ml: 'auto', fontSize: '0.7rem' }}>{formatRelativeTime(post.createdAt)}</Typography>
                    </Stack>
                  </Box>
                </Box>
              </motion.div>
            ))}
      </Stack>
    </Card>
  );
};

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = ['#F59E0B', '#94A3B8', '#B45309'];
  const color = colors[rank - 1] ?? 'text.disabled';
  return (
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: '0.8rem',
        color: rank <= 3 ? '#fff' : 'text.secondary',
        background: rank <= 3 ? color : 'action.hover',
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {rank}
    </Box>
  );
};

const truncatePost = (content: string): string => {
  const clean = content.replace(/[*#`>-]/g, '').trim();
  return clean.length > 70 ? `${clean.slice(0, 67)}…` : clean;
};

export default TrendingCard;
