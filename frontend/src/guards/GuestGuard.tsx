import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUserRoles } from '@/store/selectors';
import { getHomeRoute } from '@/constants';

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const roles = useAppSelector(selectUserRoles);

  if (isAuthenticated) {
    // Already signed in — send to the dashboard matching their role
    // (admin console, mentor studio, or learner dashboard).
    return <Navigate to={getHomeRoute(roles)} replace />;
  }

  return <>{children}</>;
};
