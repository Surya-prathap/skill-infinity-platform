import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Card, Stack, Typography } from '@/components/ui';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  index?: number;
  sx?: object;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  actions,
  children,
  index = 0,
  sx,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      <Card sx={{ p: 2.5, height: '100%', ...sx }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5, flexWrap: 'wrap' }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
        </Stack>
        {children}
      </Card>
    </motion.div>
  );
};

export default ChartCard;
