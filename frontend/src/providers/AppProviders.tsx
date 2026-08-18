import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
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
        <QueryProvider>
          {/* Respect the OS "reduce motion" setting: infinite hero/blob
              animations are disabled for those users, keeping the UI fast
              and accessible. */}
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </QueryProvider>
      </ThemeContextProvider>
    </StoreProvider>
  );
};
