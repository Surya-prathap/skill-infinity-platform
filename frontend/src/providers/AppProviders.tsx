import type { ReactNode } from 'react';
import { StoreProvider } from './StoreProvider';
import { QueryProvider } from './QueryProvider';
import { ChatSocketProvider } from './ChatSocketProvider';
import { ThemeContextProvider } from '@/contexts';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <StoreProvider>
      <ThemeContextProvider>
        <QueryProvider>
          <ChatSocketProvider>{children}</ChatSocketProvider>
        </QueryProvider>
      </ThemeContextProvider>
    </StoreProvider>
  );
};
