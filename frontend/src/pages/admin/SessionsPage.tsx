import { useMemo, useState } from 'react';
import { Box, Chip, Grid } from '@mui/material';
import { Stack, Typography } from '@/components/ui';
import LiveTvOutlinedIcon from '@mui/icons-material/LiveTvOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Avatar, AppDrawer } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdvancedDataTable, type AdminColumn, AdminTableSkeleton } from '@/components/admin';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils';
import { useAdminSessionsQuery } from '@/features/admin';
import type { AdminSession, AdminSessionStatus } from '@/types';

const STATUS_META: Record<AdminSessionStatus, { color: 'success' | 'info' | 'warning' | 'error' | 'default'; label: string }> = {
  LIVE: { color: 'success', label: 'Live' },
  SCHEDULED: { color: 'info', label: 'Upcoming' },
  COMPLETED: { color: 'success', label: 'Completed' },
  CANCELLED: { color: 'error', label: 'Cancelled' },
  RESCHEDULED: { color: 'warning', label: 'Rescheduled' },
};

export const SessionsPage: React.FC = () => {
  useDocumentTitle('Session Management');
  const { sessions, isLoading } = useAdminSessionsQuery();
  const [statusFilter, setStatusFilter] = useState<AdminSessionStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<AdminSession | null>(null);

  const filtered = useMemo(
    () => (statusFilter === 'ALL' ? sessions : sessions.filter((session) => session.status === statusFilter)),
    [sessions, statusFilter],
  );

  const stats = useMemo(() => {
    const count = (status: AdminSessionStatus) => sessions.filter((s) => s.status === status).length;
    const revenue = sessions.reduce((sum, s) => sum + s.revenue, 0);
    const duration = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return [
      { label: 'Live now', value: count('LIVE'), icon: <LiveTvOutlinedIcon />, color: '#10B981' },
      { label: 'Upcoming', value: count('SCHEDULED'), icon: <EventNoteOutlinedIcon />, color: '#3B82F6' },
      { label: 'Completed', value: count('COMPLETED'), icon: <CheckCircleOutlineOutlinedIcon />, color: '#6D5DF6' },
      { label: 'Cancelled', value: count('CANCELLED'), icon: <CancelOutlinedIcon />, color: '#EF4444' },
      { label: 'Rescheduled', value: count('RESCHEDULED'), icon: <UpdateOutlinedIcon />, color: '#F59E0B' },
      { label: 'Revenue', value: formatCurrency(revenue), icon: <PaymentsOutlinedIcon />, color: '#14B8A6' },
      { label: 'Total hours', value: `${Math.round(duration / 60)}h`, icon: <ScheduleOutlinedIcon />, color: '#A855F7' },
    ];
  }, [sessions]);

  const columns: AdminColumn<AdminSession>[] = [
    {
      id: 'title',
      label: 'Session',
      sortable: true,
      sortValue: (row) => row.title,
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700} noWrap>
            {row.title}
          </Typography>
          <Chip size="small" label={row.type} variant="outlined" sx={{ mt: 0.5, height: 20, fontWeight: 700 }} />
        </Box>
      ),
    },
    {
      id: 'mentorName',
      label: 'Mentor',
      sortable: true,
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar name={row.mentorName} size={30} />
          <Typography variant="body2">{row.mentorName}</Typography>
        </Stack>
      ),
    },
    { id: 'learnerName', label: 'Learner', sortable: true, render: (row) => <Typography variant="body2">{row.learnerName}</Typography> },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={STATUS_META[row.status].label} color={STATUS_META[row.status].color} /> },
    { id: 'startAt', label: 'Starts', sortable: true, sortValue: (row) => row.startAt, render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.startAt)}</Typography> },
    { id: 'durationMinutes', label: 'Duration', align: 'center', sortable: true, render: (row) => <Typography variant="body2">{row.durationMinutes}m</Typography> },
    { id: 'revenue', label: 'Revenue', align: 'right', sortable: true, sortValue: (row) => row.revenue, render: (row) => <Typography variant="body2" fontWeight={700}>{row.revenue > 0 ? formatCurrency(row.revenue) : '—'}</Typography> },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader title="Session Management" subtitle="Live sessions, bookings, revenue and session timelines." />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 4, lg: 3, xl: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    boxShadow: `0 6px 14px ${stat.color}3D`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] as const).map((status) => (
          <Chip
            key={status}
            label={status === 'ALL' ? `All (${sessions.length})` : STATUS_META[status].label}
            onClick={() => setStatusFilter(status)}
            color={statusFilter === status ? 'primary' : 'default'}
            variant={statusFilter === status ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      <AdvancedDataTable<AdminSession>
        columns={columns}
        rows={filtered}
        keyExtractor={(row) => row.id}
        searchKeys={(row) => `${row.title} ${row.mentorName} ${row.learnerName} ${row.status}`}
        searchPlaceholder="Search sessions…"
        title={`Sessions (${filtered.length})`}
        selectable
        exportFilename="skill-infinity-sessions"
        onRowClick={(row) => setSelected(row)}
        emptyTitle="No sessions match"
        emptyDescription="Adjust the status filter or search to find sessions."
        maxHeight={560}
      />

      <AppDrawer open={selected !== null} onClose={() => setSelected(null)} title="Session Details" width={400}>
        {selected && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
              {selected.title}
            </Typography>
            <StatusBadge label={STATUS_META[selected.status].label} color={STATUS_META[selected.status].color} />
            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              {[
                { label: 'Mentor', value: selected.mentorName },
                { label: 'Learner', value: selected.learnerName },
                { label: 'Type', value: selected.type },
                { label: 'Starts', value: formatDateTime(selected.startAt) },
                { label: 'Duration', value: `${selected.durationMinutes} minutes` },
                { label: 'Revenue', value: selected.revenue > 0 ? formatCurrency(selected.revenue) : '—' },
                { label: 'Created', value: formatRelativeTime(selected.startAt) },
              ].map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right' }}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </AppDrawer>
    </Box>
  );
};

export default SessionsPage;
