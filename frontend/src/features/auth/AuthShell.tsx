import type { ReactNode } from 'react';
import { Box, Paper } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 4,
          p: { xs: 3, sm: 4.5 },
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ mb: 3, display: { lg: 'none' } }}>
          <Logo size={36} />
        </Box>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </Paper>
    </motion.div>
  );
};

export default AuthShell;
