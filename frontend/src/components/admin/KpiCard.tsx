import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { Card, Stack, Typography } from '@/components/ui';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Sparkline } from './Sparkline';

export interface KpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: ReactNode;
  color?: string;
  delta?: number;
  deltaLabel?: string;
  sparkline?: number[];
  hint?: string;
  index?: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  color = '#6D5DF6',
  delta,
  deltaLabel,
  sparkline,
  hint,
  index = 0,
}) => {
  const deltaPositive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      <Card hoverable sx={{ p: 2.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient corner glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -48,
            right: -48,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}1F, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${color}, ${color}99)`,
              boxShadow: `0 8px 20px ${color}3D`,
            }}
          >
            {icon}
          </Box>
          {sparkline && sparkline.length > 1 && (
            <Sparkline data={sparkline} color={color} width={92} height={32} />
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          <AnimatedNumber
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            variant="h4"
            fontWeight={800}
            aria-label={`${label}: ${prefix}${value.toLocaleString('en-US')}${suffix}`}
          />
          {delta !== undefined && (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.25,
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: deltaPositive ? 'success.main' : 'error.main',
                bgcolor: deltaPositive ? 'success.light' : 'error.light',
              }}
            >
              {delta === 0 ? (
                <TrendingFlatIcon sx={{ fontSize: 13 }} />
              ) : deltaPositive ? (
                <ArrowUpwardIcon sx={{ fontSize: 13 }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 13 }} />
              )}
              {Math.abs(delta).toFixed(1)}%
            </Box>
          )}
        </Box>
        {(deltaLabel || hint) && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {deltaLabel ?? hint}
          </Typography>
        )}
      </Card>
    </motion.div>
  );
};

export default KpiCard;
