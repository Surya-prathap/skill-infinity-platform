import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { DashboardHeader, DashboardSidebar } from '@/components/common';
import { DASHBOARD_NAV } from '@/constants/navigation';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <DashboardSidebar
        items={DASHBOARD_NAV}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
        <Container maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
