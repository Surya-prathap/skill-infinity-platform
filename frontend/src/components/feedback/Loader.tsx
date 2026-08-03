import { Box, CircularProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

/** Full-screen splash shown while redux-persist rehydrates. */
export const BootstrapLoader: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: (theme) => theme.palette.background.default,
      }}
    >
      <Box sx={{ position: 'relative', width: 64, height: 64 }}>
        <CircularProgress size={64} thickness={3.5} />
        <AutoStoriesIcon
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'primary.main',
            fontSize: 28,
          }}
        />
      </Box>
      <Stack alignItems="center" spacing={0.5}>
        <Typography variant="h6" fontWeight={700}>
          Skill Infinity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loading your experience…
        </Typography>
      </Stack>
    </Box>
  );
};

interface LoaderProps {
  size?: number;
  label?: string;
}

/** Inline loading indicator. */
export const Loader: React.FC<LoaderProps> = ({ size = 36, label }) => {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 4 }}>
      <CircularProgress size={size} thickness={4} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Stack>
  );
};

/** Full-page loading indicator for route transitions. */
export const PageLoader: React.FC<LoaderProps> = ({ size = 48, label = 'Loading page…' }) => {
  return (
    <Box
      sx={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={size} thickness={4.5} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
};
