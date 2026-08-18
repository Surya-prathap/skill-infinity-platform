import { Box, Button } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { getHomeRoute } from '@/constants';
import { useAuth, useDocumentTitle } from '@/hooks';

export const UnauthorizedPage: React.FC = () => {
  useDocumentTitle('Access Denied');
  const navigate = useNavigate();
  const { roles } = useAuth();

  return (
    <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center', py: 6, px: 3 }}>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'warning.light',
          color: 'warning.main',
          mb: 1,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 44 }} />
      </Box>
      <Typography variant="h1" fontWeight={900} sx={{ fontSize: { xs: '3.5rem', md: '4.5rem' }, letterSpacing: '-0.03em', color: 'primary.main' }}>
        403
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        You don&apos;t have permission to view this page. If you believe this is a mistake, contact
        your administrator.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="contained" onClick={() => navigate(getHomeRoute(roles))}>
          Go to Dashboard
        </Button>
      </Stack>
    </Stack>
  );
};

export default UnauthorizedPage;
