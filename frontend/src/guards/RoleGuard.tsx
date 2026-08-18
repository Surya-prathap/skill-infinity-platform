import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectUserRoles } from '@/store/selectors';
import { ROUTES } from '@/constants';
import type { Role } from '@/types';

interface RoleGuardProps {
  roles: Role[];
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children }) => {
  const userRoles = useAppSelector(selectUserRoles);
  const allowed = roles.some((role) => userRoles.includes(role));

  if (!allowed) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
};
