import { AppProviders } from '@/providers';
import { AppRouter } from '@/routes';
import { AppToaster, GlobalLoadingBar } from '@/components/feedback';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const App: React.FC = () => {
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
