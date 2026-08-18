import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { motion } from 'framer-motion';
import { gradients } from '@/theme';

export type GradientKey = keyof typeof gradients;

interface GradientCardProps {
  gradient?: GradientKey;
  children: ReactNode;
  sx?: SxProps<Theme>;
  /** Floating blurred orbs (true) or a static dot-grid (false). */
  animated?: boolean;
}

/** Premium gradient surface used for hero banners and highlighted panels. */
export const GradientCard: React.FC<GradientCardProps> = ({
  gradient = 'brand',
  children,
  sx,
  animated = true,
}) => {
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        background: gradients[gradient],
        ...sx,
      }}
    >
      <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }} />
      {animated && (
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            top: -180,
            right: '4%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.28), transparent 70%)',
            // No filter: blur() — the radial gradient already fades to transparent.
            // Animating a blurred layer re-rasterizes every frame (frame-rate killer).
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />
      )}
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  );
};

export default GradientCard;
