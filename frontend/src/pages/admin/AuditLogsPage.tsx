import { useMemo, useState } from 'react';
import { Box, Chip, Grid } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Stack as UiStack, Typography, Typography as UiTypography } from '@/components/ui';
import { AuditTimeline, FilterDrawer, FilterSection, FilterMultiChipRow, AdminTableSkeleton } from '@/components/admin';
import { DonutChart } from '@/components/charts';
import { formatRelativeTime } from '@/utils';
import { useAdminAuditLogsQuery } from '@/features/admin';
import type { AuditActionCategory } from '@/types';

const CATEGORY_META: Record<AuditActionCategory, string> = {
  ADMIN: '#6D5DF6',
  PAYMENT: '#F59E0B',
  MODERATION: '#EF4444',
  SETTINGS: '#3B82F6',
  AUTH: '#14B8A6',
  ROLE: '#A855F7',
  SYSTEM: '#64748B',
};

export const AuditLogsPage: React.FC = () => {
  useDocumentTitle('Audit Logs');
  const { logs, isLoading } = useAdminAuditLogsQuery();
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => (categoryFilter.length === 0 ? logs : logs.filter((log) => categoryFilter.includes(log.category))),
    [logs, categoryFilter],
  );

  const categorySegments = useMemo(() => {
    const counts = new Map<AuditActionCategory, number>();
    logs.forEach((log) => counts.set(log.category, (counts.get(log.category) ?? 0) + 1));
    return Array.from(counts.entries())
      .map(([category, count]) => ({ label: category, value: count, color: CATEGORY_META[category] }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  const todayCount = logs.filter((log) => new Date(log.createdAt).getTime() > Date.now() - 24 * 3600_000).length;

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="Every privileged action, role change and system event."
        actions={
          <FilterDrawer
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onReset={() => setCategoryFilter([])}
            activeCount={categoryFilter.length}
            title="Filter audit logs"
            onToggle={() => setFilterOpen(true)}
          >
            <FilterSection label="Category">
              <FilterMultiChipRow
                options={[
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Auth', value: 'AUTH' },
                  { label: 'Payments', value: 'PAYMENT' },
                  { label: 'Moderation', value: 'MODERATION' },
                  { label: 'Settings', value: 'SETTINGS' },
                  { label: 'Roles', value: 'ROLE' },
                  { label: 'System', value: 'SYSTEM' },
                ]}
                selected={categoryFilter}
                onToggle={(value) =>
                  setCategoryFilter((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]))
                }
              />
            </FilterSection>
          </FilterDrawer>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <UiStack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Event Timeline
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filtered.length} events {categoryFilter.length > 0 ? '· filtered' : '· latest first'}
                </Typography>
              </Box>
              <Chip
                icon={<HistoryOutlinedIcon />}
                label={`${todayCount} today`}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </UiStack>
            <AuditTimeline logs={filtered} limit={20} />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Events by Category
              </Typography>
              <DonutChart segments={categorySegments} size={160} centerValue={String(logs.length)} centerLabel="events" />
              <Stack spacing={1} sx={{ mt: 2 }}>
                {categorySegments.map((segment) => (
                  <Stack key={segment.label} direction="row" alignItems="center" spacing={1}>
                    <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                    <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                      {segment.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {segment.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Admins
              </Typography>
              <Stack spacing={1.5}>
                {Array.from(new Set(logs.map((log) => log.adminName))).slice(0, 4).map((admin, index) => (
                  <Stack key={admin} direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        background: `linear-gradient(135deg, ${Object.values(CATEGORY_META)[index % 7]}, ${Object.values(CATEGORY_META)[(index + 3) % 7]})`,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      {admin === 'System' ? '⚙️' : admin.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </Box>
                    <Typography variant="body2" fontWeight={700}>
                      {admin}
                    </Typography>
                    <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', ml: 'auto' }} />
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Retention
              </Typography>
              <UiTypography variant="body2" color="text.secondary">
                Audit logs are retained for <strong>12 months</strong> and exported nightly to cold storage.
              </UiTypography>
              <UiTypography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                Oldest event: {formatRelativeTime(logs[logs.length - 1]?.createdAt ?? new Date().toISOString())}
              </UiTypography>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditLogsPage;
