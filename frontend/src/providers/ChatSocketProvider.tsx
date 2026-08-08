import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/selectors';
import { connectChatSocket, disconnectChatSocket } from '@/socket/chatSocket';

interface ChatSocketProviderProps {
  children: ReactNode;
}

/**
 * Mounts the real-time chat socket while the user is authenticated and tears
 * it down on logout/unmount. Chat event handlers dispatch straight into the
 * Redux chat slice.
 */
export const ChatSocketProvider: React.FC<ChatSocketProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    connectChatSocket(dispatch, user?.userId ?? '');
    return () => disconnectChatSocket();
  }, [dispatch, isAuthenticated, user?.userId]);

  return <>{children}</>;
};

export default ChatSocketProvider;
