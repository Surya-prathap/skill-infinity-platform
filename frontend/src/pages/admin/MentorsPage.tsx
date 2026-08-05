import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Tab, Tabs, Tooltip } from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Avatar, Card, Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdvancedDataTable, type AdminColumn, ApprovalDialog, AnimatedProgress, AdminTableSkeleton } from '@/components/admin';
import { DonutChart, BarChart } from '@/components/charts';
import { formatCurrency, formatRelativeTime } from '@/utils';
import { useAdminMentorsQuery, useMentorApprovalsQuery, useApproveMentorMutation, useRejectMentorMutation } from '@/features/admin';
import type { AdminMentor, MentorApproval } from '@/types';

type TabValue = 'approvals' | 'mentors' | 'top';

export const MentorsPage: React.FC = () => {
  useDocumentTitle('Mentor Management');
  const [tab, setTab] = useState<TabValue>('approvals');
  const [dialog, setDialog] = useState<{ mentor: MentorApproval | null; action: 'APPROVE' | 'REJECT' | null }>({ mentor: null, action: null });

  const { mentors, isLoading } = useAdminMentorsQuery();
  const { approvals } = useMentorApprovalsQuery();
  const approveMutation = useApproveMentorMutation();
  const rejectMutation = useRejectMentorMutation();

  const pending = approvals.filter((approval) => approval.status === 'PENDING');
  const topMentors = useMemo(() => [...mentors].sort((a, b) => b.rating - a.rating).slice(0, 5), [mentors]);

  const ratingSegments = [
    { label: '5★', value: 68, color: '#10B981' },
    { label: '4★', value: 24, color: '#6D5DF6' },
    { label: '3★', value: 5, color: '#F59E0B' },
    { label: '≤2★', value: 3, color: '#EF4444' },
  ];

  const revenuePoints = [
    { label: 'Jan', value: 38 }, { label: 'Feb', value: 42 }, { label: 'Mar', value: 47 },
    { label: 'Apr', value: 44 }, { label: 'May', value: 55 }, { label: 'Jun', value: 58 },
    { label: 'Jul', value: 64 },
  ];

  const columns: AdminColumn<AdminMentor>[] = [
    {
      id: 'name',
      label: 'Mentor',
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar firstName={row.name.split(' ')[0]} lastName={row.name.split(' ')[1]} email={row.email} size={38} />
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="body2" fontWeight={700} noWrap>
                {row.name}
              </Typography>
              {row.verified && (
                <Tooltip title="Identity verified">
                  <VerifiedOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                </Tooltip>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.expertise.slice(0, 2).join(' · ')}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'rating',
      label: 'Rating',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.rating,
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={0.5} justifyContent="center">
          <Typography variant="body2" fontWeight={800} sx={{ color: '#F59E0B' }}>
            {row.rating > 0 ? row.rating.toFixed(1) : '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({row.reviewCount})
          </Typography>
        </Stack>
      ),
    },
    { id: 'sessionsCompleted', label: 'Sessions', align: 'center', sortable: true },
    { id: 'revenue', label: 'Revenue', align: 'right', sortable: true, sortValue: (row) => row.revenue, render: (row) => <Typography variant="body2" fontWeight={700}>{formatCurrency(row.revenue)}</Typography> },
    { id: 'hourlyRate', label: 'Rate', align: 'right', sortable: true, render: (row) => <Typography variant="body2">{formatCurrency(row.hourlyRate)}/hr</Typography> },
    { id: 'responseRate', label: 'Response', align: 'center', sortable: true, render: (row) => <Typography variant="body2" fontWeight={600}>{row.responseRate > 0 ? `${row.responseRate}%` : '—'}</Typography> },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={row.status === 'ACTIVE' ? 'success' : row.status === 'SUSPENDED' ? 'error' : 'warning'} /> },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Mentor Management"
        subtitle="Approvals, verification, performance and payouts."
        actions={
          <Chip
            icon={<SchoolOutlinedIcon />}
            label={`${pending.length} awaiting approval`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        }
      />

      {/* Analytics strip */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Rating Distribution
            </Typography>
            <DonutChart segments={ratingSegments} size={150} centerValue="4.7" centerLabel="avg" />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Mentor Payout Volume (thousands)
            </Typography>
            <BarChart data={revenuePoints} height={150} color="#14B8A6" suffix="k" />
          </Card>
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(_, next: TabValue) => setTab(next)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        aria-label="Mentor management sections"
      >
        <Tab label={`Approval Queue (${pending.length})`} value="approvals" />
        <Tab label={`All Mentors (${mentors.length})`} value="mentors" />
        <Tab label="Top Mentors" value="top" />
      </Tabs>

      {tab === 'approvals' && (
        <Grid container spacing={3}>
          {pending.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 6, textAlign: 'center' }}>
                <EmojiEventsOutlinedIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={700}>
                  All caught up 🎉
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  There are no mentor applications waiting for review.
                </Typography>
              </Card>
            </Grid>
          )}
          {pending.map((approval) => (
            <Grid key={approval.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card hoverable sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar firstName={approval.name.split(' ')[0]} lastName={approval.name.split(' ')[1]} email={approval.email} size={44} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} noWrap>
                      {approval.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {approval.yearsExperience} yrs · requested {formatRelativeTime(approval.requestedAt)}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {approval.expertise.map((skill) => (
                    <Chip key={skill} size="small" label={skill} variant="outlined" sx={{ fontWeight: 600 }} />
                  ))}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6, flexGrow: 1 }}>
                  {approval.bio}
                </Typography>

                <AnimatedProgress
                  value={approval.verificationScore}
                  label="Verification score"
                  suffix="/100"
                  color={approval.verificationScore >= 90 ? '#10B981' : '#F59E0B'}
                />

                <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, mb: 2 }}>
                  {approval.certificates.map((certificate) => (
                    <Chip key={certificate} size="small" icon={<VerifiedOutlinedIcon />} label={certificate} color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                  ))}
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleOutlineOutlinedIcon />}
                    onClick={() => setDialog({ mentor: approval, action: 'APPROVE' })}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CloseOutlinedIcon />}
                    onClick={() => setDialog({ mentor: approval, action: 'REJECT' })}
                  >
                    Reject
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 'mentors' && (
        <AdvancedDataTable<AdminMentor>
          columns={columns}
          rows={mentors}
          keyExtractor={(row) => row.id}
          searchKeys={(row) => `${row.name} ${row.email} ${row.expertise.join(' ')} ${row.status}`}
          searchPlaceholder="Search mentors…"
          title={`All mentors (${mentors.length})`}
          selectable
          exportFilename="skill-infinity-mentors"
          emptyTitle="No mentors found"
          emptyDescription="Try a different search or filter."
          maxHeight={560}
        />
      )}

      {tab === 'top' && (
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Top Rated Mentors
          </Typography>
          <Stack spacing={1.5}>
            {topMentors.map((mentor, index) => (
              <Stack key={mentor.id} direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: '#fff',
                    background: index < 3 ? 'linear-gradient(135deg, #F59E0B, #FBBF24)' : 'linear-gradient(135deg, #64748B, #94A3B8)',
                  }}
                >
                  {index + 1}
                </Box>
                <Avatar firstName={mentor.name.split(' ')[0]} lastName={mentor.name.split(' ')[1]} email={mentor.email} size={40} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} noWrap>
                    {mentor.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {mentor.expertise.join(' · ')}
                  </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, width: 160 }}>
                  <AnimatedProgress value={mentor.rating} max={5} label="" suffix="★" color="#F59E0B" />
                </Box>
                <Typography variant="body2" fontWeight={800} sx={{ color: '#F59E0B', width: 44, textAlign: 'right' }}>
                  {mentor.rating.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 90, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  {formatCurrency(mentor.revenue)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}

      <ApprovalDialog
        open={dialog.mentor !== null && dialog.action !== null}
        mentor={dialog.mentor}
        action={dialog.action}
        loading={approveMutation.isPending || rejectMutation.isPending}
        onConfirm={(reason) => {
          if (!dialog.mentor || !dialog.action) return;
          if (dialog.action === 'APPROVE') approveMutation.mutate(dialog.mentor.id);
          else rejectMutation.mutate({ mentorId: dialog.mentor.id, reason: reason ?? '' });
          setDialog({ mentor: null, action: null });
        }}
        onClose={() => setDialog({ mentor: null, action: null })}
      />
    </Box>
  );
};

export default MentorsPage;
