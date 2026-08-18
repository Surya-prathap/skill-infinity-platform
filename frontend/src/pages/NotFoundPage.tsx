import { Box, Button } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/common';
import { ROUTES } from '@/constants';
import { useDocumentTitle } from '@/hooks';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" spacing={2} sx={{ textAlign: 'center', py: 6, px: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Logo showText={false} size={56} />
      </Box>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Typography
          variant="h1"
          fontWeight={900}
          className="text-gradient"
          sx={{ fontSize: { xs: '5rem', md: '7.5rem' }, letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          404
        </Typography>
      </motion.div>
      <Typography variant="h5" fontWeight={700}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you&apos;re looking for doesn&apos;t exist, may have been moved, or is still being
        built by our mentors. 🛠️
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate(ROUTES.HOME)}>
          Back to Home
        </Button>
      </Stack>
    </Stack>
  );
};

export default NotFoundPage;
