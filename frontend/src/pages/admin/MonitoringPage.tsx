import { Box, Chip, Grid, Tooltip } from '@mui/material';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import WifiTetheringOutlinedIcon from '@mui/icons-material/WifiTetheringOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Stack, Stack as UiStack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardWidget, AnimatedProgress, getToneColor, AdminTableSkeleton } from '@/components/admin';
import { LineChart, BarChart } from '@/components/charts';
import { formatRelativeTime } from '@/utils';
import { useAdminMonitoringQuery } from '@/features/admin';
import type { ServiceStatus } from '@/types';

const STATUS_COLOR: Record<ServiceStatus, 'success' | 'warning' | 'error' | 'default'> = {
  UP: 'success',
  DEGRADED: 'warning',
  DOWN: 'error',
  MAINTENANCE: 'default',
};

const INFRA = [
  { name: 'API Gateway', key: 'apiStatus' as const },
  { name: 'Database', key: 'database' as const },
  { name: 'Redis', key: 'redis' as const },
  { name: 'RabbitMQ', key: 'rabbitmq' as const },
  { name: 'MinIO', key: 'minio' as const },
];

export const MonitoringPage: React.FC = () => {
  useDocumentTitle('System Monitoring');
  const { metrics, services, health, isLoading } = useAdminMonitoringQuery();

  if (isLoading) return <AdminTableSkeleton />;

  const infraStatus = (key: keyof typeof metrics): ServiceStatus => metrics[key] as ServiceStatus;

  const gauges = [
    { label: 'CPU Usage', value: metrics.cpuUsage, icon: <MemoryOutlinedIcon />, color: '#6D5DF6' },
    { label: 'Memory', value: metrics.memoryUsage, icon: <DnsOutlinedIcon />, color: '#14B8A6' },
    { label: 'Storage', value: metrics.storageUsage, icon: <StorageOutlinedIcon />, color: '#F59E0B' },
    { label: 'Response Time', value: Math.min(metrics.responseTimeMs / 5, 100), suffix: ' ms', icon: <TimerOutlinedIcon />, color: '#3B82F6' },
    { label: 'Error Rate', value: Math.min(metrics.errorRate * 20, 100), suffix: ' %', icon: <ErrorOutlineOutlinedIcon />, color: '#EF4444' },
  ];

  const latencySeries = [
    { name: 'Latency (ms)', color: '#6D5DF6', points: metrics.latencySeries },
  ];

  return (
    <Box>
      <PageHeader
        title="System Monitoring"
        subtitle={`${health?.activeServices ?? metrics.apiStatus === 'UP' ? 12 : 11}/${health?.totalServices ?? 12} services operational · refreshes every 30s`}
        actions={<StatusBadge label={metrics.apiStatus === 'UP' ? 'All systems operational' : 'Degraded'} color={metrics.apiStatus === 'UP' ? 'success' : 'warning'} withDot />}
      />

      {/* Infrastructure strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2.5, mb: 3 }}>
        {INFRA.map((infra) => {
          const status = infraStatus(infra.key);
          return (
            <Box key={infra.name} sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                {infra.name}
              </Typography>
              <StatusBadge label={status} color={STATUS_COLOR[status]} />
            </Box>
          );
        })}
      </Box>

      {/* Gauges */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2.5, mb: 3 }}>
        {gauges.map((gauge) => (
          <Box key={gauge.label} sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <UiStack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Box sx={{ color: gauge.color, display: 'flex' }}>{gauge.icon}</Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {gauge.label}
              </Typography>
            </UiStack>
            <AnimatedProgress
              value={gauge.value}
              max={100}
              label=""
              suffix={gauge.suffix ?? '%'}
              color={getToneColor(gauge.value / 100)}
            />
            <Typography variant="caption" fontWeight={800} sx={{ color: getToneColor(gauge.value / 100), mt: 0.5, display: 'block' }}>
              {gauge.label === 'Response Time' ? `${metrics.responseTimeMs} ms` : `${gauge.value}${gauge.suffix ?? '%'}`}
            </Typography>
          </Box>
        ))}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardWidget
            title="API Latency"
            subtitle="24h response time by hour"
            icon={<TimerOutlinedIcon />}
            index={0}
            actions={
              <Chip size="small" label={`${metrics.requestsPerMinute.toLocaleString()} req/min`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
            }
          >
            <LineChart series={latencySeries} height={240} suffix="ms" />
          </DashboardWidget>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardWidget title="Request Volume" subtitle="Requests per hour" icon={<WifiTetheringOutlinedIcon />} index={1}>
            <BarChart data={metrics.requestVolume.slice(0, 8)} height={200} color="#14B8A6" />
            <UiStack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Active sockets
              </Typography>
              <Typography variant="body2" fontWeight={800}>
                {metrics.activeSockets.toLocaleString()}
              </Typography>
            </UiStack>
          </DashboardWidget>
        </Grid>
      </Grid>

      {/* Services table */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <DashboardWidget
            title="Microservices"
            subtitle={`${services.length} services · ${services.filter((s) => s.status === 'UP').length} healthy`}
            icon={<DnsOutlinedIcon />}
            index={0}
          >
            <Box sx={{ overflowX: 'auto' }}>
              <Stack spacing={1}>
                {services.map((service) => (
                  <Box
                    key={service.name}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr auto', md: '2fr 2fr 1fr 1fr 1fr 1fr 1fr' },
                      gap: 1.5,
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }} noWrap>
                        {service.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', md: 'block' } }}>
                        {service.description}
                      </Typography>
                    </Box>
                    <StatusBadge label={service.status} color={STATUS_COLOR[service.status]} />
                    <Tooltip title="Latency">
                      <Typography variant="caption" fontWeight={700} sx={{ display: { xs: 'none', md: 'block' } }}>
                        {service.latencyMs} ms
                      </Typography>
                    </Tooltip>
                    <Tooltip title="Error rate">
                      <Typography variant="caption" fontWeight={700} sx={{ display: { xs: 'none', md: 'block' } }}>
                        {service.errorRate}%
                      </Typography>
                    </Tooltip>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 90 }}>
                      <AnimatedProgress value={service.cpu} label="" suffix="%" height={6} />
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' }, width: 90 }}>
                      <AnimatedProgress value={service.memory} label="" suffix="%" height={6} color="#6D5DF6" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                      {service.uptime.toFixed(2)}% up
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </DashboardWidget>
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
        Last refreshed {formatRelativeTime(new Date().toISOString())}
      </Typography>
    </Box>
  );
};

export default MonitoringPage;
