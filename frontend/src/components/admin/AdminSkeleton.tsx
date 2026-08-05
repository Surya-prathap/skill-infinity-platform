import { Box, Grid, Skeleton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';

/** KPI row skeleton with shimmering gradient cards. */
export const AdminKpiSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
      </Grid>
    ))}
  </Grid>
);

/** Chart panel skeleton. */
export const AdminChartSkeleton: React.FC<{ height?: number }> = ({ height = 320 }) => (
  <Skeleton variant="rounded" height={height} sx={{ borderRadius: 3 }} />
);

/** Full executive dashboard skeleton. */
export const AdminDashboardSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width={280} height={42} sx={{ mb: 1 }} />
    <Skeleton variant="text" width={420} height={20} sx={{ mb: 4 }} />
    <AdminKpiSkeleton />
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <AdminChartSkeleton height={360} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={3}>
          <AdminChartSkeleton height={170} />
          <AdminChartSkeleton height={170} />
        </Stack>
      </Grid>
    </Grid>
  </Box>
);

/** Management page skeleton (filter bar + table). */
export const AdminTableSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="rounded" height={56} sx={{ mb: 3, borderRadius: 2 }} />
    <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
  </Box>
);
