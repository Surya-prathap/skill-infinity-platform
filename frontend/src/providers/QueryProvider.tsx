import { useEffect, useRef, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const user = useAppSelector(selectUser);
  const prevUserIdRef = useRef<string | undefined>(user?.userId);

  useEffect(() => {
    const currentId = user?.userId;
    const previousId = prevUserIdRef.current;
    if (previousId !== currentId) {
      // A different user (or a logout) is now signed in. Drop every cached
      // query so the previous user's wallet balance, sessions, and profile can
      // never leak into the new session — the root cause of "every user sees
      // the same wallet" and "login shows the previous user's details".
      queryClient.clear();
      prevUserIdRef.current = currentId;
    }
  }, [user?.userId]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
