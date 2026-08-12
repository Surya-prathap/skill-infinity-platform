import { useEffect } from 'react';
import { AppProviders } from '@/providers';
import { AppRouter } from '@/routes';
import { scheduleRoutePrefetch } from '@/routes/prefetch';
import { AppToaster, GlobalLoadingBar } from '@/components/feedback';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const App: React.FC = () => {
  // Warm the browser cache with every lazy route chunk once the app has
  // painted, so page transitions never block on a network fetch.
  useEffect(() => {
    scheduleRoutePrefetch();
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <GlobalLoadingBar />
        <AppRouter />
        <AppToaster />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
