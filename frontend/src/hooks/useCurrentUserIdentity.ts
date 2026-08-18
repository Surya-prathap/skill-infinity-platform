import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import type { AuthUser } from '@/types';

export interface CurrentUserIdentity {
  /** Real authenticated user id from the identity-service ('' when logged out). */
  userId: string;
  /** Display name derived from the real account. */
  userName: string;
  user: AuthUser | null;
}

/**
 * Single source of truth for the signed-in user's identity across chat,
 * community, meetings and everywhere else. Replaces the old hard-coded
 * CURRENT_USER_ID / CURRENT_USER_NAME seed constants — the values always
 * come from the real auth store.
 */
export const useCurrentUserIdentity = (): CurrentUserIdentity => {
  const user = useAppSelector(selectUser);

  return useMemo<CurrentUserIdentity>(
    () => ({
      userId: user?.userId ?? '',
      userName: user?.username || user?.email || '',
      user,
    }),
    [user],
  );
};
