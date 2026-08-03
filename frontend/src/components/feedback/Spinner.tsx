import { Box } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { spin } from '@/theme';

interface SpinnerProps {
  size?: number;
  label?: string;
}

/** Brand gradient ring spinner. */
export const Spinner: React.FC<SpinnerProps> = ({ size = 40, label }) => {
  const ring = (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent 0%, #6D5DF6 80%, #43C6C0 100%)',
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
        mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
        flexShrink: 0,
        animation: `${spin} 0.8s linear infinite`,
      }}
    />
  );

  if (!label) return ring;

  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
      {ring}
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
};

export default Spinner;
