import { Box } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@/constants';

interface LogoProps {
  showText?: boolean;
  size?: number;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ showText = true, size = 36, to = ROUTES.HOME }) => {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, #6D5DF6 0%, #43C6C0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: 4,
          flexShrink: 0,
        }}
      >
        <AutoStoriesIcon sx={{ fontSize: size * 0.58 }} />
      </Box>
      {showText && (
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          {APP_NAME}
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
