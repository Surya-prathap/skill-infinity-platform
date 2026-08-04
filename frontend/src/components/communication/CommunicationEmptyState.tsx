import { Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Typography } from '@/components/ui/Typography';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

interface CommunicationEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

/** Shared premium empty / error state for panels and lists. */
export const CommunicationEmptyState: React.FC<CommunicationEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    style={{ textAlign: 'center' }}
  >
    <Box sx={{ py: compact ? 3 : 7, px: 3 }}>
      <Box
        sx={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          mx: 'auto',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.14)' : 'rgba(109,93,246,0.1)',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>
      <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight={700}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', mt: 0.5 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={<RefreshOutlinedIcon />} onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  </motion.div>
);

/** Offline / disconnected banner with retry. */
export const ConnectionBanner: React.FC<{ status: string; onRetry: () => void }> = ({
  status,
  onRetry,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1,
      background: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
      borderBottom: '1px solid rgba(245,158,11,0.3)',
    }}
  >
    <WifiOffOutlinedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
    <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
      {status}
    </Typography>
    <Button size="small" variant="outlined" onClick={onRetry} startIcon={<RefreshOutlinedIcon />}>
      Reconnect
    </Button>
  </Box>
);

export default CommunicationEmptyState;
