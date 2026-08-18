import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated, selectUserRoles } from '@/store/selectors';
import { getHomeRoute } from '@/constants';

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * Guest-only pages (login/register/…). Waits for auth rehydration so an
 * already-signed-in user refreshing /login is routed to their dashboard
 * instead of flashing the login form.
 */
export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const initialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const roles = useAppSelector(selectUserRoles);

  if (!initialized) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isAuthenticated) {
    // Already signed in — send to the dashboard matching their role
    // (admin console, mentor studio, or learner dashboard).
    return <Navigate to={getHomeRoute(roles)} replace />;
  }

  return <>{children}</>;
};
