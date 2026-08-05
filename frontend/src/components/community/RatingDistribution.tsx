import { Box, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';

interface RatingDistributionProps {
  /** Mapping from star count (5 → 1) to review counts. */
  breakdown: Record<string, number>;
  total: number;
  onSelect?: (star: number) => void;
  selected?: number;
}

/** 5→1 star distribution bars with animated fill. */
export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  breakdown,
  total,
  onSelect,
  selected,
}) => {

  return (
    <Stack spacing={0.75}>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = breakdown[String(star)] ?? 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const active = selected === star;
        return (
          <Box
            key={star}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(star) : undefined}
            onKeyDown={onSelect ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(star);
              }
            } : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: onSelect ? 'pointer' : 'default',
              px: 0.5,
              py: 0.25,
              borderRadius: 1.5,
              transition: 'background-color 0.15s ease',
              '&:hover': onSelect ? { bgcolor: 'action.hover' } : undefined,
              ...(active && { bgcolor: 'action.selected' }),
            }}
            aria-label={`${star} star reviews: ${count}`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, width: 34, flexShrink: 0 }}>
              <StarIcon sx={{ fontSize: 15, color: '#F59E0B' }} />
              <Typography fontSize="0.8rem" fontWeight={700}>
                {star}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              >
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 7,
                    borderRadius: 999,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                      borderRadius: 999,
                    },
                  }}
                />
              </motion.div>
            </Box>
            <Typography fontSize="0.78rem" color="text.secondary" fontWeight={600} sx={{ width: 30, textAlign: 'right' }}>
              {Math.round(percentage)}%
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
};

export default RatingDistribution;
