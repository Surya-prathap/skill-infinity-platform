import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, ListItemIcon, Tab, Tabs } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { CommunityHero, PostCard, PostComposer, TagChip } from '@/components/community';
import { FeedSkeleton, HeroSkeleton } from '@/components/community';
import { EmptyState, ErrorState } from '@/components/feedback';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { useCommunityPostsQuery, useCommunityQuery, useJoinCommunityMutation, usePinnedPostsQuery } from '@/features/community';
import { formatCompactNumber, formatDate } from '@/utils';
import { ROUTES } from '@/constants';
import type { CommunityMember } from '@/types';

type CommunityTab = 'posts' | 'pinned' | 'members' | 'about';

export const CommunityDetailsPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { community, isLoading } = useCommunityQuery(communityId);
  const postsQuery = useCommunityPostsQuery(communityId ?? '');
  const { posts: pinnedPosts } = usePinnedPostsQuery(communityId);
  const joinMutation = useJoinCommunityMutation();
  const [tab, setTab] = useState<CommunityTab>('posts');

  useDocumentTitle(community?.name ?? 'Community');

  /* Infinite scroll */
  useEffect(() => {
    const sentinel = document.getElementById('community-feed-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
          void postsQuery.fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [postsQuery]);

  if (isLoading && !community) {
    return (
      <Stack spacing={3}>
        <HeroSkeleton />
        <FeedSkeleton count={2} />
      </Stack>
    );
  }

  if (!community) {
    return (
      <ErrorState
        title="Community not found"
        message="This community may have been removed or the link is incorrect."
        actionLabel="Browse communities"
        onAction={() => navigate(ROUTES.COMMUNITIES)}
      />
    );
  }

  const moderators = community.moderators ?? [];
  const members = community.members ?? [];
  const rules = community.rules ?? [];
  const stats = community.statistics;

  const toggleJoin = () => joinMutation.mutate(community.id);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.COMMUNITIES)} sx={{ mb: 2 }}>
        All communities
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <CommunityHero community={community} joined={community.joined} onToggleJoin={toggleJoin} joining={joinMutation.isPending} />
      </motion.div>

      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* ============ Main ============ */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ p: 1, mb: 3 }}>
            <Tabs
              value={tab}
              onChange={(_, value: CommunityTab) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ '& .MuiTab-root': { minHeight: 52 } }}
            >
              <Tab icon={<ArticleOutlinedIcon />} iconPosition="start" label="Posts" value="posts" />
              <Tab icon={<PushPinOutlinedIcon />} iconPosition="start" label={`Pinned (${pinnedPosts.length})`} value="pinned" />
              <Tab icon={<GroupsOutlinedIcon />} iconPosition="start" label="Members" value="members" />
              <Tab icon={<RuleOutlinedIcon />} iconPosition="start" label="About & Rules" value="about" />
            </Tabs>
          </Card>

          {tab === 'posts' && (
            <Stack spacing={2.5}>
              <PostComposer communityId={community.id} onPosted={() => void postsQuery.refetch()} />
              {postsQuery.isLoading && postsQuery.posts.length === 0 ? (
                <FeedSkeleton count={2} />
              ) : postsQuery.posts.length === 0 ? (
                <EmptyState
                  icon={<ArticleOutlinedIcon />}
                  title="No posts yet"
                  description="Kick off the conversation — share your first post in this community."
                />
              ) : (
                postsQuery.posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
              <Box id="community-feed-sentinel" sx={{ height: 1 }} />
              {postsQuery.isFetchingNextPage && (
                <Stack direction="row" justifyContent="center">
                  <Chip label="Loading more…" variant="outlined" sx={{ fontWeight: 700 }} />
                </Stack>
              )}
            </Stack>
          )}

          {tab === 'pinned' && (
            <Stack spacing={2.5}>
              {pinnedPosts.length === 0 ? (
                <EmptyState icon={<PushPinOutlinedIcon />} title="Nothing pinned yet" description="Moderators pin important discussions here." />
              ) : (
                pinnedPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </Stack>
          )}

          {tab === 'members' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Members · {formatCompactNumber(community.memberCount)}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
                {moderators.map((moderator) => (
                  <MemberRow key={moderator.id} member={moderator} isModerator />
                ))}
                {members.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </Box>
            </Card>
          )}

          {tab === 'about' && (
            <Stack spacing={3}>
              {community.longDescription && (
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                    About this community
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                    {community.longDescription}
                  </Typography>
                </Card>
              )}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  Community rules
                </Typography>
                <Stack spacing={1.5}>
                  {rules.map((rule, index) => (
                    <Stack key={rule.id} direction="row" gap={1.5}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.8rem',
                          color: '#fff',
                          background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {rule.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.description}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Stack>
          )}
        </Grid>

        {/* ============ Sidebar ============ */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Stats */}
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Community statistics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {[
                  { label: 'Members', value: formatCompactNumber(community.memberCount) },
                  { label: 'Posts', value: formatCompactNumber(community.postCount) },
                  { label: 'Posts this week', value: formatCompactNumber(stats?.postsThisWeek ?? 0) },
                  { label: 'Growth', value: `${stats?.membersGrowth ?? 0}%` },
                  { label: 'Questions answered', value: formatCompactNumber(stats?.questionsAnswered ?? 0) },
                  { label: 'Active this week', value: formatCompactNumber(stats?.activeThisWeek ?? 0) },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={900}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Moderators */}
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <ShieldOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={800}>
                  Moderators
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {moderators.map((moderator) => (
                  <Stack key={moderator.id} direction="row" alignItems="center" gap={1.25}>
                    <Avatar name={moderator.name} size={36} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                          {moderator.name}
                        </Typography>
                        <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {moderator.title}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Card>

            {/* Tags */}
            <Card sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {community.tags.map((tag) => (
                  <TagChip key={tag} label={tag} onClick={() => navigate(`${ROUTES.COMMUNITY_SEARCH}?q=${encodeURIComponent(tag)}`)} />
                ))}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

const MemberRow: React.FC<{ member: CommunityMember; isModerator?: boolean }> = ({ member, isModerator = false }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: 2.5, border: 1, borderColor: 'divider', transition: 'border-color 0.2s ease', '&:hover': { borderColor: 'primary.main' } }}>
    <Avatar name={member.name} size={38} />
    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="subtitle2" fontWeight={800} noWrap>
          {member.name}
        </Typography>
        {isModerator && (
          <ListItemIcon sx={{ minWidth: 0 }}>
            <ShieldOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
          </ListItemIcon>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" noWrap>
        {member.title ?? `${member.role} · joined ${formatDate(member.joinedAt)}`}
      </Typography>
    </Box>
  </Box>
);

export default CommunityDetailsPage;
