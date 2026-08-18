import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { BootstrapLoader } from '@/components/feedback/Loader';

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<BootstrapLoader />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
