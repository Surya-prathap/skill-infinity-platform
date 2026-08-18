import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login as loginThunk,
  logout as logoutThunk,
  register as registerThunk,
  fetchCurrentUser as fetchCurrentUserThunk,
} from '@/store/slices/authSlice';
import { selectIsAuthenticated, selectUser, selectUserRoles } from '@/store/selectors';
import type { LoginRequest, RegisterRequest, Role } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const roles = useAppSelector(selectUserRoles);

  const login = useCallback(
    (credentials: LoginRequest) => dispatch(loginThunk(credentials)).unwrap(),
    [dispatch],
  );

  const register = useCallback(
    (payload: RegisterRequest) => dispatch(registerThunk(payload)).unwrap(),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);

  const fetchCurrentUser = useCallback(() => dispatch(fetchCurrentUserThunk()), [dispatch]);

  const hasRole = useCallback(
    (required: Role[]) => required.some((role) => roles.includes(role)),
    [roles],
  );

  return { user, isAuthenticated, roles, login, register, logout, fetchCurrentUser, hasRole };
};
