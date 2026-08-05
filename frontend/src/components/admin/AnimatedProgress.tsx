import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  suffix?: string;
  color?: string;
  height?: number;
  showValue?: boolean;
}

export const getToneColor = (ratio: number): string => {
  if (ratio >= 0.85) return '#10B981';
  if (ratio >= 0.65) return '#F59E0B';
  return '#EF4444';
};

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  label,
  suffix = '%',
  color,
  height = 8,
  showValue = true,
}) => {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const resolved = color ?? getToneColor(ratio);

  return (
    <Box>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && (
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {label}
            </Typography>
          )}
          {showValue && (
            <Typography variant="caption" fontWeight={800} sx={{ color: resolved }}>
              {value.toLocaleString('en-US')}
              {suffix}
            </Typography>
          )}
        </Box>
      )}
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius: 999,
          bgcolor: 'action.hover',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${resolved}AA, ${resolved})`,
            boxShadow: `0 0 12px ${resolved}66`,
          }}
        />
      </Box>
    </Box>
  );
};

export default AnimatedProgress;
