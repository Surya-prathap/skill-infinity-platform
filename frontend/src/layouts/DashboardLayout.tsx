import { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DashboardHeader, DashboardSidebar, RoleSync } from '@/components/common';
import { getDashboardNav } from '@/constants/navigation';
import { ROLES, ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectUserRoles } from '@/store/selectors';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const roles = useAppSelector(selectUserRoles);

  // Mentors have a completely separate dashboard — never land on the learner
  // dashboard even when /dashboard is opened directly.
  if (roles.includes(ROLES.MENTOR) && location.pathname === ROUTES.DASHBOARD) {
    return <Navigate to={ROUTES.MENTOR_DASHBOARD} replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Watches for role changes (e.g. learner → mentor) and redirects to the matching dashboard. */}
      <RoleSync />
      <DashboardSidebar
        items={getDashboardNav(roles)}
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
