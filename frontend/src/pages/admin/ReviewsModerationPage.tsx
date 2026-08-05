import { Box, Chip, Grid, IconButton, Tooltip } from '@mui/material';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Typography, Typography as UiTypography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdvancedDataTable, type AdminColumn, AdminTableSkeleton } from '@/components/admin';
import { DonutChart } from '@/components/charts';
import { formatCompactNumber, formatRelativeTime, showInfo } from '@/utils';
import { useAdminReviewsQuery, useReviewModerationMutation } from '@/features/admin';
import type { ModerationReview } from '@/types';

const STATUS_COLOR = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' } as const;

export const ReviewsModerationPage: React.FC = () => {
  useDocumentTitle('Review Moderation');
  const { reviews, analytics, isLoading } = useAdminReviewsQuery();
  const moderationMutation = useReviewModerationMutation();

  const pending = reviews.filter((review) => review.status === 'PENDING');
  const reported = reviews.filter((review) => review.reported);

  const distributionSegments = [
    { label: '5★', value: analytics.ratingsDistribution['5'] ?? 0, color: '#10B981' },
    { label: '4★', value: analytics.ratingsDistribution['4'] ?? 0, color: '#6D5DF6' },
    { label: '3★', value: analytics.ratingsDistribution['3'] ?? 0, color: '#3B82F6' },
    { label: '2★', value: analytics.ratingsDistribution['2'] ?? 0, color: '#F59E0B' },
    { label: '1★', value: analytics.ratingsDistribution['1'] ?? 0, color: '#EF4444' },
  ];

  const kpis = [
    { label: 'Total reviews', value: analytics.totalReviews, color: '#6D5DF6' },
    { label: 'Pending', value: analytics.pending, color: '#F59E0B' },
    { label: 'Approved', value: analytics.approved, color: '#10B981' },
    { label: 'Reported', value: analytics.reported, color: '#EF4444' },
    { label: 'Avg rating', value: analytics.averageRating.toFixed(1), color: '#F59E0B' },
    { label: 'Helpful votes', value: formatCompactNumber(analytics.helpfulVotes), color: '#3B82F6' },
  ];

  const columns: AdminColumn<ModerationReview>[] = [
    {
      id: 'content',
      label: 'Review',
      render: (row) => (
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarOutlinedIcon key={star} sx={{ fontSize: 14, color: star <= row.rating ? '#F59E0B' : 'action.disabled' }} />
            ))}
            {row.anonymous && <Chip size="small" label="Anonymous" variant="outlined" sx={{ ml: 1, height: 20, fontWeight: 700 }} />}
          </Stack>
          <Typography variant="body2" noWrap sx={{ maxWidth: 360, mt: 0.5 }}>
            {row.content}
          </Typography>
        </Box>
      ),
    },
    { id: 'mentorName', label: 'Mentor', sortable: true, render: (row) => <Typography variant="body2" fontWeight={700}>{row.mentorName}</Typography> },
    { id: 'learnerName', label: 'Learner', sortable: true, render: (row) => <Typography variant="body2">{row.anonymous ? 'Anonymous' : row.learnerName}</Typography> },
    { id: 'helpfulVotes', label: 'Helpful', align: 'center', sortable: true, render: (row) => <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center"><ThumbUpOutlinedIcon sx={{ fontSize: 14, color: 'success.main' }} /><Typography variant="body2">{row.helpfulVotes}</Typography></Stack> },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      sortable: true,
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
          <StatusBadge label={row.status} color={STATUS_COLOR[row.status]} />
          {row.reported && <FlagOutlinedIcon sx={{ fontSize: 14, color: 'error.main' }} />}
        </Stack>
      ),
    },
    { id: 'createdAt', label: 'Submitted', sortable: true, render: (row) => <Typography variant="caption" color="text.secondary">{formatRelativeTime(row.createdAt)}</Typography> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Approve review">
              <IconButton size="small" color="success" onClick={() => moderationMutation.mutate({ reviewId: row.id, status: 'APPROVED' })} aria-label={`Approve review ${row.id}`}>
                <CheckCircleOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject review">
              <IconButton size="small" color="error" onClick={() => moderationMutation.mutate({ reviewId: row.id, status: 'REJECTED' })} aria-label={`Reject review ${row.id}`}>
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete review">
              <IconButton size="small" onClick={() => showInfo('Delete queued for moderation review')} aria-label={`Delete review ${row.id}`}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <StatusBadge label="Handled" color="default" withDot={false} />
        ),
    },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Review Moderation"
        subtitle="Review queue, reports, helpful votes and mentor ratings."
        actions={
          <Chip
            icon={<FlagOutlinedIcon />}
            label={`${reported.length} reported`}
            color="error"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, lg: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                {kpi.label}
              </UiTypography>
              <UiTypography variant="h6" fontWeight={800} sx={{ color: kpi.color }}>
                {kpi.value}
              </UiTypography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Rating Distribution
            </Typography>
            <DonutChart segments={distributionSegments} size={160} centerValue={analytics.averageRating.toFixed(1)} centerLabel="avg rating" />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Moderation Funnel
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
              {[
                { label: 'Submitted', value: analytics.totalReviews, color: '#6D5DF6' },
                { label: 'Pending', value: analytics.pending, color: '#F59E0B' },
                { label: 'Approved', value: analytics.approved, color: '#10B981' },
                { label: 'Rejected', value: analytics.rejected, color: '#EF4444' },
              ].map((item) => (
                <Box key={item.label} sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: item.color }}>
                    {formatCompactNumber(item.value)}
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

      <AdvancedDataTable<ModerationReview>
        columns={columns}
        rows={reviews}
        keyExtractor={(row) => row.id}
        searchKeys={(row) => `${row.content} ${row.mentorName} ${row.learnerName} ${row.status}`}
        searchPlaceholder="Search reviews…"
        title={`Review queue (${pending.length} pending)`}
        selectable
        exportFilename="skill-infinity-review-moderation"
        emptyTitle="No reviews to moderate"
        emptyDescription="All caught up — new reviews will appear here."
        maxHeight={560}
      />
    </Box>
  );
};

export default ReviewsModerationPage;
