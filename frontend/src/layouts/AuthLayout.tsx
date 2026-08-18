import { Box } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/common';
import { APP_TAGLINE } from '@/constants';

const HIGHLIGHTS = [
  { title: 'Expert mentors', description: 'Learn from verified industry professionals.' },
  { title: 'Live 1:1 sessions', description: 'Book sessions that fit your schedule.' },
  { title: 'Credit ecosystem', description: 'Earn, spend and track credits seamlessly.' },
];

export const AuthLayout: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '46%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
          background: 'linear-gradient(160deg, #4F46E5 0%, #7C3AED 55%, #0EA5E9 100%)',
        }}
      >
        <Box
          className="dot-grid"
          sx={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none' }}
        />
        <Box sx={{ position: 'relative' }}>
          <Logo size={40} />
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 420 }}>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em', mb: 2 }}>
            {APP_TAGLINE}
          </Typography>
          <Stack spacing={2.5} sx={{ mt: 4 }}>
            {HIGHLIGHTS.map((highlight) => (
              <Box key={highlight.title} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#5EEAD4',
                    boxShadow: '0 0 12px rgba(94,234,212,0.8)',
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {highlight.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.8, position: 'relative' }}>
          © {year} Skill Infinity. Enterprise Microservices Platform.
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          position: 'relative',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
