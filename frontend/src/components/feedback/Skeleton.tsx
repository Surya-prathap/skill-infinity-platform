import { Box, Grid, Skeleton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';

/** Skeleton dashboard with stat cards and a content panel. */
export const PageSkeleton: React.FC = () => {
  return (
    <Box>
      <Skeleton variant="text" width={220} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={320} height={20} sx={{ mb: 4 }} />
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[0, 1, 2, 3].map((item) => (
          <Grid key={item} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={130} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant="rounded" height={320} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={140} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

/** Skeleton table rows. */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={3} sx={{ py: 1.5, alignItems: 'center' }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} height={24} />
          ))}
        </Stack>
      ))}
    </Box>
  );
};

/** Skeleton list of card rows. */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={72} />
      ))}
    </Stack>
  );
};
