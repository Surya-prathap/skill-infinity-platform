import { useState } from 'react';
import { Box, Chip, Grid, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdvancedDataTable, type AdminColumn, AdminTableSkeleton } from '@/components/admin';
import { DonutChart } from '@/components/charts';
import { formatCompactNumber, formatRelativeTime, showInfo } from '@/utils';
import { useAdminCommunityQuery, useModerationMutation } from '@/features/admin';
import type { AdminCommunity, AdminCommunityPost, AdminPoll, ModerationQueueItem } from '@/types';

type TabValue = 'queue' | 'posts' | 'communities' | 'polls';

const RISK_COLOR = { LOW: 'default', MEDIUM: 'warning', HIGH: 'error' } as const;

export const CommunityModerationPage: React.FC = () => {
  useDocumentTitle('Community Moderation');
  const [tab, setTab] = useState<TabValue>('queue');
  const { moderationQueue, posts, communities, polls, engagement, isLoading } = useAdminCommunityQuery();
  const moderationMutation = useModerationMutation();

  const pending = moderationQueue.filter((item) => item.status === 'PENDING');
  const riskSegments = [
    { label: 'High', value: moderationQueue.filter((m) => m.risk === 'HIGH').length, color: '#EF4444' },
    { label: 'Medium', value: moderationQueue.filter((m) => m.risk === 'MEDIUM').length, color: '#F59E0B' },
    { label: 'Low', value: moderationQueue.filter((m) => m.risk === 'LOW').length, color: '#14B8A6' },
  ];

  const queueColumns: AdminColumn<ModerationQueueItem>[] = [
    { id: 'targetType', label: 'Type', align: 'center', render: (row) => <Chip size="small" label={row.targetType} variant="outlined" sx={{ fontWeight: 700 }} /> },
    { id: 'content', label: 'Reported content', render: (row) => <Typography variant="body2" noWrap sx={{ maxWidth: 340 }}>{row.content}</Typography> },
    { id: 'author', label: 'Author', sortable: true },
    { id: 'reason', label: 'Reason', render: (row) => <Chip size="small" label={row.reason} color="error" variant="outlined" sx={{ fontWeight: 700 }} /> },
    { id: 'reports', label: 'Reports', align: 'center', sortable: true, sortValue: (row) => row.reports },
    { id: 'risk', label: 'Risk', align: 'center', render: (row) => <StatusBadge label={row.risk} color={RISK_COLOR[row.risk]} /> },
    { id: 'reportedAt', label: 'Reported', sortable: true, render: (row) => <Typography variant="caption" color="text.secondary">{formatRelativeTime(row.reportedAt)}</Typography> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Action content">
              <IconButton size="small" color="error" onClick={() => moderationMutation.mutate({ itemId: row.id, status: 'RESOLVED' })} aria-label={`Action ${row.id}`}>
                <GavelOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dismiss report">
              <IconButton size="small" onClick={() => moderationMutation.mutate({ itemId: row.id, status: 'DISMISSED' })} aria-label={`Dismiss ${row.id}`}>
                <HowToRegOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <StatusBadge label={row.status} color={row.status === 'RESOLVED' ? 'success' : 'default'} />
        ),
    },
  ];

  const postColumns: AdminColumn<AdminCommunityPost>[] = [
    { id: 'title', label: 'Post', sortable: true, render: (row) => <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 340 }}>{row.title}</Typography> },
    { id: 'community', label: 'Community', sortable: true },
    { id: 'author', label: 'Author', sortable: true },
    { id: 'likes', label: 'Likes', align: 'center', sortable: true },
    { id: 'comments', label: 'Comments', align: 'center', sortable: true },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={row.status === 'PINNED' ? 'success' : row.status === 'HIDDEN' || row.status === 'REPORTED' ? 'error' : 'info'} /> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Pin post">
            <IconButton size="small" color={row.status === 'PINNED' ? 'success' : 'default'} onClick={() => showInfo(`Pinned: ${row.title}`)} aria-label={`Pin ${row.title}`}>
              <PinOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hide post">
            <IconButton size="small" onClick={() => showInfo(`Hidden: ${row.title}`)} aria-label={`Hide ${row.title}`}>
              <VisibilityOffOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete post">
            <IconButton size="small" color="error" onClick={() => showInfo(`Deletion queued: ${row.title}`)} aria-label={`Delete ${row.title}`}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const communityColumns: AdminColumn<AdminCommunity>[] = [
    { id: 'name', label: 'Community', sortable: true, render: (row) => <Typography variant="body2" fontWeight={700}>{row.name}</Typography> },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'members', label: 'Members', align: 'center', sortable: true, render: (row) => formatCompactNumber(row.members) },
    { id: 'posts', label: 'Posts', align: 'center', sortable: true },
    { id: 'moderators', label: 'Moderators', align: 'center', sortable: true },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={row.status === 'ACTIVE' ? 'success' : row.status === 'RESTRICTED' ? 'warning' : 'default'} /> },
  ];

  const pollColumns: AdminColumn<AdminPoll>[] = [
    { id: 'question', label: 'Question', sortable: true, render: (row) => <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 380 }}>{row.question}</Typography> },
    { id: 'community', label: 'Community', sortable: true },
    { id: 'votes', label: 'Votes', align: 'center', sortable: true },
    { id: 'options', label: 'Options', align: 'center', sortable: true },
    { id: 'status', label: 'Status', align: 'center', render: (row) => <StatusBadge label={row.status} color={row.status === 'OPEN' ? 'success' : 'default'} /> },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Community Moderation"
        subtitle="Reports, spam detection, pinned content and community health."
        actions={
          <Chip
            icon={<FlagOutlinedIcon />}
            label={`${pending.length} open reports`}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Report Risk Mix
            </Typography>
            <DonutChart segments={riskSegments} size={150} centerValue={String(pending.length)} centerLabel="open" />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Moderation Snapshot
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              {[
                { label: 'Communities', value: communities.length, icon: <ForumOutlinedIcon />, color: '#6D5DF6' },
                { label: 'Posts', value: formatCompactNumber(engagement?.totalPosts ?? posts.length), icon: <PinOutlinedIcon />, color: '#3B82F6' },
                { label: 'Comments', value: formatCompactNumber(engagement?.totalComments ?? 0), icon: <ForumOutlinedIcon />, color: '#14B8A6' },
                { label: 'Reports', value: moderationQueue.length, icon: <FlagOutlinedIcon />, color: '#EF4444' },
              ].map((item) => (
                <Box key={item.label} sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ color: item.color, display: 'flex', justifyContent: 'center', mb: 0.5 }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight={800}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, next: TabValue) => setTab(next)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }} aria-label="Moderation sections">
        <Tab label={`Moderation Queue (${pending.length})`} value="queue" />
        <Tab label={`Posts (${posts.length})`} value="posts" />
        <Tab label={`Communities (${communities.length})`} value="communities" />
        <Tab label={`Polls (${polls.length})`} value="polls" />
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'queue' && (
            <AdvancedDataTable<ModerationQueueItem>
              columns={queueColumns}
              rows={moderationQueue}
              keyExtractor={(row) => row.id}
              searchKeys={(row) => `${row.content} ${row.author} ${row.reason} ${row.targetType}`}
              searchPlaceholder="Search reports…"
              exportFilename="skill-infinity-moderation-queue"
              emptyTitle="Moderation queue is clear 🎉"
              emptyDescription="No content currently needs review."
              maxHeight={560}
            />
          )}
          {tab === 'posts' && (
            <AdvancedDataTable<AdminCommunityPost>
              columns={postColumns}
              rows={posts}
              keyExtractor={(row) => row.id}
              searchKeys={(row) => `${row.title} ${row.community} ${row.author}`}
              searchPlaceholder="Search posts…"
              exportFilename="skill-infinity-community-posts"
              maxHeight={560}
            />
          )}
          {tab === 'communities' && (
            <AdvancedDataTable<AdminCommunity>
              columns={communityColumns}
              rows={communities}
              keyExtractor={(row) => row.id}
              searchKeys={(row) => `${row.name} ${row.category} ${row.status}`}
              searchPlaceholder="Search communities…"
              exportFilename="skill-infinity-communities"
              maxHeight={560}
            />
          )}
          {tab === 'polls' && (
            <AdvancedDataTable<AdminPoll>
              columns={pollColumns}
              rows={polls}
              keyExtractor={(row) => row.id}
              searchKeys={(row) => `${row.question} ${row.community}`}
              searchPlaceholder="Search polls…"
              exportFilename="skill-infinity-polls"
              maxHeight={560}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CommunityModerationPage;
