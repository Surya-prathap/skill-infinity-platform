import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectAuthInitialized, selectIsAuthenticated } from '@/store/selectors';
import { ROUTES } from '@/constants';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Blocks rendering of protected routes until the persisted session has been
 * restored (redux-persist rehydration). A browser refresh starts with an empty
 * auth slice — redirecting to /login before rehydration completes would log
 * the user out on every refresh. Once rehydrated, the decision is final.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const initialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

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

  if (!isAuthenticated) {
    const from = location.pathname + location.search;
    return <Navigate to={ROUTES.LOGIN} state={{ from }} replace />;
  }

  return <>{children}</>;
};
