import { Box, LinearProgress } from '@mui/material';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';

interface ProgressCardProps {
  label: string;
  value: number;
  sublabel?: string;
  color?: string;
}

/** Compact completion card with an animated progress bar. */
export const ProgressCard: React.FC<ProgressCardProps> = ({
  label,
  value,
  sublabel,
  color = '#6D5DF6',
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <Card hoverable sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          {sublabel && (
            <Typography variant="caption" color="text.secondary">
              {sublabel}
            </Typography>
          )}
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color }}>
          {clamped}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={clamped}
        aria-label={`${label} ${clamped}%`}
        sx={{
          height: 10,
          borderRadius: 999,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          },
        }}
      />
    </Card>
  );
};

export default ProgressCard;
