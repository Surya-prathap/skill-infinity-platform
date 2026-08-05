import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageHeader } from '@/components/common';
import { PostComposer, PostCard, TrendingCard, LeaderboardRow } from '@/components/community';
import { FeedSkeleton } from '@/components/community';
import { EmptyState } from '@/components/feedback';
import { useDocumentTitle } from '@/hooks';
import {
  useCommunitiesQuery,
  useCommunityLiveFeed,
  useFeedQuery,
  useLeaderboardQuery,
  useLearningStatsQuery,
} from '@/features/community';
import { seedHubStats, seedTrendingKeywords } from '@/features/community/data';
import { useAppSelector } from '@/store/hooks';
import { selectCommunityLiveEvents } from '@/store/selectors';
import { formatCompactNumber } from '@/utils';
import { ROUTES } from '@/constants';
import type { FeedFilter } from '@/types';

const FILTERS: Array<{ key: FeedFilter; label: string }> = [
  { key: 'LATEST', label: 'Latest' },
  { key: 'TRENDING', label: 'Trending' },
  { key: 'FOLLOWING', label: 'Following' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export const CommunityHubPage: React.FC = () => {
  useDocumentTitle('Community');
  useCommunityLiveFeed();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FeedFilter>('LATEST');
  const feed = useFeedQuery(filter);
  const { communities } = useCommunitiesQuery();
  const { entries: leaderboard } = useLeaderboardQuery('LEARNERS', 'WEEKLY');
  const { stats } = useLearningStatsQuery();
  const liveEvents = useAppSelector(selectCommunityLiveEvents);

  const joinedCommunities = useMemo(() => communities.filter((community) => community.joined).slice(0, 4), [communities]);

  /* Intersection-observer based infinite scroll. */
  useEffect(() => {
    const sentinel = document.getElementById('feed-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && feed.hasNextPage && !feed.isFetchingNextPage) {
          void feed.fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feed]);

  return (
    <Box>
      <PageHeader
        title="Community Hub"
        subtitle="Learn together, share wins and grow with peers and mentors."
        actions={
          <Button
            variant="contained"
            startIcon={<ExploreOutlinedIcon />}
            onClick={() => navigate(ROUTES.COMMUNITY_SEARCH)}
          >
            Search community
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* ============ Main feed ============ */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <PostComposer communities={joinedCommunities} />
          </motion.div>

          {/* Feed filter tabs */}
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 2.5, mb: 1.5 }}>
            {FILTERS.map((option) => (
              <Button
                key={option.key}
                size="small"
                variant={filter === option.key ? 'contained' : 'outlined'}
                onClick={() => setFilter(option.key)}
                sx={{ fontWeight: 800, minWidth: 0, px: 1.75 }}
              >
                {option.label}
              </Button>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.disabled">
              {formatCompactNumber(seedHubStats.postsThisWeek)} posts this week
            </Typography>
          </Stack>

          {feed.isLoading && feed.posts.length === 0 ? (
            <FeedSkeleton />
          ) : feed.posts.length === 0 ? (
            <EmptyState
              icon={<TrendingUpOutlinedIcon />}
              title="No posts yet"
              description="Be the first to spark a discussion in this feed."
            />
          ) : (
            <Stack spacing={2.5}>
              <AnimatePresence mode="popLayout">
                {feed.posts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Infinite scroll sentinel */}
              <Box id="feed-sentinel" sx={{ height: 1 }} />
              {feed.isFetchingNextPage && (
                <Stack direction="row" justifyContent="center">
                  <Chip label="Loading more posts…" variant="outlined" sx={{ fontWeight: 700 }} />
                </Stack>
              )}
            </Stack>
          )}
        </Grid>

        {/* ============ Right rail ============ */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Quick actions */}
            <GlassCard hoverable sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Quick actions
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <QuickAction icon={<GroupAddOutlinedIcon />} label="Browse communities" color="#6D5DF6" onClick={() => navigate(ROUTES.COMMUNITIES)} />
                <QuickAction icon={<LeaderboardOutlinedIcon />} label="Leaderboard" color="#F59E0B" onClick={() => navigate(ROUTES.COMMUNITY_LEADERBOARD)} />
                <QuickAction icon={<EmojiEventsOutlinedIcon />} label="Achievements" color="#EC4899" onClick={() => navigate(ROUTES.COMMUNITY_ACHIEVEMENTS)} />
                <QuickAction icon={<WorkspacePremiumOutlinedIcon />} label="My activity" color="#14B8A6" onClick={() => navigate(ROUTES.COMMUNITY_ACTIVITY)} />
              </Box>
            </GlassCard>

            {/* Live activity ticker */}
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <LocalFireDepartmentIcon sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight={800}>
                  Live activity
                </Typography>
                <Chip label="LIVE" size="small" color="error" sx={{ ml: 'auto', height: 20, fontSize: '0.62rem', fontWeight: 800 }} />
              </Stack>
              <Stack spacing={1}>
                {liveEvents.slice(0, 4).map((event) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <Typography fontSize="0.8rem" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>● </Box>
                      {event.message}
                    </Typography>
                  </motion.div>
                ))}
                {liveEvents.length === 0 && (
                  <Typography variant="caption" color="text.disabled">
                    Community activity will appear here in real time.
                  </Typography>
                )}
              </Stack>
            </Card>

            {/* Trending */}
            <TrendingCard limit={5} />

            {/* Learning streak mini */}
            <Card sx={{ p: 2.5, background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))', borderColor: 'rgba(245,158,11,0.3)' }}>
              <Stack direction="row" alignItems="center" gap={2}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Box sx={{ fontSize: 44 }}>🔥</Box>
                </motion.div>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" fontWeight={900}>
                    {stats.streakDays}
                    <Typography component="span" fontSize="1rem" fontWeight={700} color="text.secondary">
                      {' '}day streak
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.totalPoints.toLocaleString('en-US')} lifetime points · {stats.totalHours}h learned
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={() => navigate(ROUTES.COMMUNITY_ACTIVITY)}>
                  View
                </Button>
              </Stack>
            </Card>

            {/* Leaderboard mini */}
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <LeaderboardOutlinedIcon sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight={800}>
                  Weekly top learners
                </Typography>
                <Button size="small" sx={{ ml: 'auto', fontWeight: 800 }} onClick={() => navigate(ROUTES.COMMUNITY_LEADERBOARD)}>
                  See all
                </Button>
              </Stack>
              {leaderboard.slice(0, 5).map((entry, index) => (
                <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
              ))}
            </Card>

            {/* Trending keywords */}
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Trending keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {seedTrendingKeywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={`#${keyword.replace(/\s+/g, '-')}`}
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`${ROUTES.COMMUNITY_SEARCH}?q=${encodeURIComponent(keyword)}`)}
                    sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
                  />
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <Box
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === 'Enter') onClick();
    }}
    sx={{
      p: 1.5,
      borderRadius: 2.5,
      border: 1,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0.75,
      cursor: 'pointer',
      transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      '&:hover': { transform: 'translateY(-3px)', borderColor: color, boxShadow: `0 8px 20px ${color}26` },
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
      }}
    >
      {icon}
    </Box>
    <Typography fontSize="0.72rem" fontWeight={700} textAlign="center">
      {label}
    </Typography>
  </Box>
);

export default CommunityHubPage;
