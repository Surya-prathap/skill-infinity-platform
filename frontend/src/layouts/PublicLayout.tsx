import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Footer, Header, ScrollToTop } from '@/components/common';

export const PublicLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Header />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
          <Outlet />
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default PublicLayout;
