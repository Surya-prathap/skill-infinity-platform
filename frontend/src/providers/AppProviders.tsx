import type { ReactNode } from 'react';
import { StoreProvider } from './StoreProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeContextProvider } from '@/contexts';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <StoreProvider>
      <ThemeContextProvider>
        <QueryProvider>{children}</QueryProvider>
      </ThemeContextProvider>
    </StoreProvider>
  );
};
