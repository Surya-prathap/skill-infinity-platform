import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode, toggleThemeMode } from '@/store/slices/themeSlice';
import { selectResolvedThemeMode, selectThemeMode } from '@/store/selectors';
import type { ThemeMode } from '@/types';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeMode = (): ThemeContextValue => useContext(ThemeContext);

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const resolvedMode = useAppSelector(selectResolvedThemeMode);

  // Reflect the resolved mode on <html> for global CSS hooks.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
    document.documentElement.style.colorScheme = resolvedMode;
  }, [resolvedMode]);

  const theme = useMemo(() => getTheme(resolvedMode), [resolvedMode]);

  const setMode = useCallback(
    (next: ThemeMode) => dispatch(setThemeMode(next)),
    [dispatch],
  );

  const toggleMode = useCallback(
    () => dispatch(toggleThemeMode(resolvedMode)),
    [dispatch, resolvedMode],
  );

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode, toggleMode }),
    [mode, resolvedMode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
