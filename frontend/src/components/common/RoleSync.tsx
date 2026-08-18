import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { selectIsAuthenticated, selectUserRoles } from '@/store/selectors';
import { authService } from '@/services';
import { getHomeRoute, ROLES, ROUTES } from '@/constants';
import type { Role } from '@/types';

/** How often the current user (and their roles) is re-synced with the backend. */
const SYNC_INTERVAL_MS = 20_000;

/** Order-insensitive comparison — the backend may return roles in any order. */
const rolesEqual = (a: readonly Role[], b: readonly Role[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((role, index) => role === sortedB[index]);
};

/**
 * Keeps the in-memory user roles in sync with the identity-service while the
 * app is open. When a learner is promoted to mentor (or an admin changes a
 * user's role), the fresh roles are written back to the store — and if the
 * user is sitting on the learner dashboard, they are automatically taken to
 * the dashboard that matches their new role (mentor studio, admin console).
 * The mentor can still book sessions and use all learner features — the two
 * dashboards remain separate, exactly as intended.
 */
export const RoleSync: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const roles = useAppSelector(selectUserRoles);
  const rolesRef = useRef(roles);
  rolesRef.current = roles;

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const sync = async (): Promise<void> => {
      try {
        // silent: this background poll must not flash the global loading bar.
        const response = await authService.getCurrentUser({ silent: true });
        if (cancelled) return;
        const fresh = response.data.data;
        if (!fresh) return;

        const nextRoles = fresh.roles ?? [];
        const previousRoles = rolesRef.current;
        if (rolesEqual(previousRoles, nextRoles)) return;

        dispatch(setUser(fresh));

        // A learner who just became a mentor should land on the mentor studio,
        // not stay on the learner dashboard.
        if (nextRoles.includes(ROLES.MENTOR) && location.pathname === ROUTES.DASHBOARD) {
          navigate(getHomeRoute(nextRoles), { replace: true });
        }
      } catch {
        /* Role sync is best-effort — never surface errors to the user. */
      }
    };

    const timer = window.setInterval(() => void sync(), SYNC_INTERVAL_MS);
    const onFocus = () => void sync();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, dispatch, navigate, location.pathname]);

  return null;
};

export default RoleSync;
