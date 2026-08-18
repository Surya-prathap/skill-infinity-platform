import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Stack } from './Stack';
import { Typography } from './Typography';
import { Card } from './Card';
import { AnimatedNumber } from './AnimatedNumber';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: ReactNode;
  /** Base hex color used for the gradient icon chip. */
  color?: string;
  /** Short delta caption, e.g. "+3 this month". */
  delta?: string;
  /** Whether the delta is positive (green) or negative (red). */
  deltaPositive?: boolean;
  hint?: string;
  hoverable?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  color = '#6D5DF6',
  delta,
  deltaPositive = true,
  hint,
  hoverable = true,
}) => {
  return (
    <Card hoverable={hoverable} sx={{ p: 2.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle corner glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative' }}>
        {icon && (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${color}, ${color}AA)`,
              boxShadow: `0 6px 16px ${color}40`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
            {label}
          </Typography>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          {delta && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              {deltaPositive ? (
                <ArrowUpwardIcon sx={{ fontSize: 13, color: 'success.main' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: 13, color: 'error.main' }} />
              )}
              <Typography
                variant="caption"
                fontWeight={600}
                color={deltaPositive ? 'success.main' : 'error.main'}
                noWrap
              >
                {delta}
              </Typography>
            </Stack>
          )}
          {hint && !delta && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {hint}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export default MetricCard;
