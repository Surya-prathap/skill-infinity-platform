import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  adminReducer,
  authReducer,
  meetingReducer,
  mentorReducer,
  settingsReducer,
  themeReducer,
} from '@/store/slices';

export const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      mentor: mentorReducer,
      settings: settingsReducer,
      theme: themeReducer,
      meeting: meetingReducer,
      admin: adminReducer,
    },
  });

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface RenderOptions {
  initialEntries?: string[];
}

export const renderWithProviders = (ui: ReactNode, options: RenderOptions = {}) => {
  const store = createTestStore();
  const queryClient = createTestQueryClient();
  const { initialEntries = ['/'] } = options;

  const view = render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );

  return { ...view, store, queryClient };
};
