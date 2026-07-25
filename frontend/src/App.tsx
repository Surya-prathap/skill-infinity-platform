import React from 'react';
import { ThemeContextProvider } from './contexts';
import { AppRouter } from './routes';

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <AppRouter />
    </ThemeContextProvider>
  );
};

export default App;
