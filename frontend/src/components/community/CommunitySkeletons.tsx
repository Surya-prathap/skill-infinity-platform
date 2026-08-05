import { Box, Skeleton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';

/** Skeleton for a single post card. */
export const PostCardSkeleton: React.FC = () => (
  <Box sx={{ p: 2.5, borderRadius: 4, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
    <Stack direction="row" alignItems="center" gap={1.5}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="38%" height={18} />
        <Skeleton variant="text" width="24%" height={12} />
      </Box>
    </Stack>
    <Skeleton variant="text" sx={{ mt: 2 }} />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="70%" />
    <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
    <Stack direction="row" gap={1.5} sx={{ mt: 2 }}>
      <Skeleton variant="rounded" width={90} height={28} />
      <Skeleton variant="rounded" width={90} height={28} />
      <Skeleton variant="rounded" width={90} height={28} />
    </Stack>
  </Box>
);

/** Skeleton feed of post cards. */
export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Stack spacing={2.5}>
    {Array.from({ length: count }).map((_, index) => (
      <PostCardSkeleton key={index} />
    ))}
  </Stack>
);

/** Skeleton for community browse cards. */
export const CommunityCardSkeleton: React.FC = () => (
  <Box sx={{ borderRadius: 4, border: 1, borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
    <Skeleton variant="rectangular" height={74} />
    <Box sx={{ p: 2.5 }}>
      <Skeleton variant="circular" width={52} height={52} sx={{ mt: -3, mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="90%" height={12} />
      <Skeleton variant="text" width="70%" height={12} />
      <Skeleton variant="rounded" height={34} sx={{ mt: 2 }} />
    </Box>
  </Box>
);

/** Skeleton for the comment thread. */
export const CommentSkeleton: React.FC = () => (
  <Stack spacing={2}>
    {[0, 1, 2].map((index) => (
      <Stack key={index} direction="row" gap={1.5} alignItems="flex-start">
        <Skeleton variant="circular" width={34} height={34} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="rounded" height={64} />
        </Box>
      </Stack>
    ))}
  </Stack>
);

/** Skeleton hero banner. */
export const HeroSkeleton: React.FC = () => (
  <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
);
