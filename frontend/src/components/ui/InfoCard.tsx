import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Stack } from './Stack';
import { Typography } from './Typography';

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  color?: string;
  /** Rendered as a clickable link when provided. */
  href?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, color = '#6D5DF6', href }) => {
  const content = (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: 1,
        borderColor: 'divider',
        transition: 'background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        '&:hover': href && {
          bgcolor: 'action.hover',
          transform: 'translateY(-1px)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          bgcolor: `${color}18`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );

  if (href) {
    return (
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {content}
      </Box>
    );
  }
  return content;
};

export default InfoCard;
