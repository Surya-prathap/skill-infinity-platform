import { Box, Chip, type ChipProps } from '@mui/material';

type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  label: string;
  color?: StatusColor;
  size?: 'small' | 'medium';
  /** Shows a pulsing dot before the label. */
  withDot?: boolean;
}

const DOT_COLORS: Record<StatusColor, string> = {
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  default: '#94A3B8',
};

const CHIP_COLORS: Record<StatusColor, ChipProps['color']> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color = 'default', size = 'small', withDot = true }) => {
  return (
    <Chip
      size={size}
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {withDot && (
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: DOT_COLORS[color],
                boxShadow: `0 0 0 3px ${DOT_COLORS[color]}26`,
              }}
            />
          )}
          {label}
        </Box>
      }
      color={CHIP_COLORS[color]}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default StatusBadge;
