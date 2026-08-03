import type { ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  actionLabel = 'Try Again',
  onAction,
  icon,
}) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{ py: 6, px: 3, textAlign: 'center' }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'error.light',
          color: 'error.main',
          mb: 1,
        }}
      >
        {icon ?? <ErrorOutlineOutlinedIcon sx={{ fontSize: 36 }} />}
      </Box>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
        {message}
      </Typography>
      {onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
};

export default ErrorState;
