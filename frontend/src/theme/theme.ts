import { alpha, createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { brandColors, gradients } from './colors';
import { transitions } from './animations';
import { fontFamily, headingStyles } from './typography';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      gradients: typeof gradients;
      transition: (curve?: keyof typeof transitions) => string;
      glass: string;
    };
  }
  interface ThemeOptions {
    custom?: Partial<Theme['custom']>;
  }
  interface Palette {
    gradients: typeof gradients;
  }
  interface PaletteOptions {
    gradients?: typeof gradients;
  }
}

/* ============================================================
   Shared option factory
   ============================================================ */
const createAppThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const isDark = mode === 'dark';

  const background = isDark
    ? { default: '#0B1220', paper: '#121A2B', elevated: '#1A2438' }
    : { default: '#F6F7FB', paper: '#FFFFFF' };

  const primary = isDark
    ? {
        main: '#8E80FF',
        light: '#A99CFF',
        dark: '#6D5DF6',
        contrastText: '#0B1220',
      }
    : brandColors.primary;

  const secondary = isDark
    ? {
        main: '#2DD4BF',
        light: '#5EEAD4',
        dark: '#14B8A6',
        contrastText: '#0B1220',
      }
    : brandColors.secondary;

  const divider = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';

  const baseShadow = isDark
    ? '0 1px 2px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.25)'
    : '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)';

  const options: ThemeOptions = {
    palette: {
      mode,
      primary,
      secondary,
      success: isDark
        ? { main: '#34D399', light: '#6EE7B7', dark: '#10B981', contrastText: '#052E1B' }
        : brandColors.success,
      warning: isDark
        ? { main: '#FBBF24', light: '#FCD34D', dark: '#F59E0B', contrastText: '#451A03' }
        : brandColors.warning,
      error: isDark
        ? { main: '#F87171', light: '#FCA5A5', dark: '#EF4444', contrastText: '#450A0A' }
        : brandColors.error,
      info: isDark
        ? { main: '#60A5FA', light: '#93C5FD', dark: '#3B82F6', contrastText: '#0C1A2B' }
        : brandColors.info,
      background,
      text: {
        primary: isDark ? '#E6E9F2' : '#0F172A',
        secondary: isDark ? '#9AA3B8' : '#55627A',
        disabled: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.38)',
      },
      divider,
      action: {
        hover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
        selected: isDark ? 'rgba(142,128,255,0.14)' : 'rgba(109,93,246,0.1)',
        focus: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
      },
      gradients,
    },
    typography: {
      fontFamily,
      ...headingStyles,
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      '0 2px 6px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)',
      baseShadow,
      baseShadow,
      baseShadow,
      '0 6px 20px rgba(15,23,42,0.09), 0 2px 6px rgba(15,23,42,0.05)',
      '0 8px 24px rgba(15,23,42,0.1), 0 3px 8px rgba(15,23,42,0.06)',
      '0 10px 30px rgba(15,23,42,0.12), 0 4px 10px rgba(15,23,42,0.06)',
      '0 12px 36px rgba(15,23,42,0.14), 0 5px 12px rgba(15,23,42,0.08)',
      '0 16px 44px rgba(15,23,42,0.16), 0 6px 16px rgba(15,23,42,0.09)',
      '0 20px 52px rgba(15,23,42,0.18), 0 8px 20px rgba(15,23,42,0.1)',
      '0 24px 60px rgba(15,23,42,0.2), 0 10px 24px rgba(15,23,42,0.12)',
      '0 28px 68px rgba(15,23,42,0.22), 0 12px 28px rgba(15,23,42,0.14)',
      '0 32px 76px rgba(15,23,42,0.24), 0 14px 32px rgba(15,23,42,0.16)',
      '0 36px 84px rgba(15,23,42,0.26), 0 16px 36px rgba(15,23,42,0.18)',
      '0 40px 92px rgba(15,23,42,0.28), 0 18px 40px rgba(15,23,42,0.2)',
      '0 44px 100px rgba(15,23,42,0.3), 0 20px 44px rgba(15,23,42,0.22)',
      '0 48px 108px rgba(15,23,42,0.32), 0 22px 48px rgba(15,23,42,0.24)',
      '0 52px 116px rgba(15,23,42,0.34), 0 24px 52px rgba(15,23,42,0.26)',
      '0 56px 124px rgba(15,23,42,0.36), 0 26px 56px rgba(15,23,42,0.28)',
      '0 60px 132px rgba(15,23,42,0.38), 0 28px 60px rgba(15,23,42,0.3)',
      '0 64px 140px rgba(15,23,42,0.4), 0 30px 64px rgba(15,23,42,0.32)',
      '0 68px 148px rgba(15,23,42,0.42), 0 32px 68px rgba(15,23,42,0.34)',
      '0 72px 156px rgba(15,23,42,0.44), 0 34px 72px rgba(15,23,42,0.36)',
    ],
    custom: {
      gradients,
      transition: (curve = 'standard') => transitions[curve],
      glass: isDark
        ? `background: rgba(18, 26, 43, 0.72); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08);`
        : `background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.4);`,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: background.default,
            transition: 'background-color 300ms ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.01em',
            paddingInline: 20,
            transition: `transform ${transitions.fast}, box-shadow ${transitions.fast}, background-color ${transitions.standard}, border-color ${transitions.standard}`,
            '&:active': { transform: 'translateY(0) scale(0.98)' },
          },
          sizeSmall: { paddingInline: 14, minHeight: 34 },
          sizeMedium: { minHeight: 42 },
          sizeLarge: { minHeight: 50, paddingInline: 28, fontSize: '0.95rem' },
          contained: {
            boxShadow: `0 2px 10px ${alpha(primary.main, 0.28)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(primary.main, 0.38)}`,
              transform: 'translateY(-1px)',
            },
            '&.MuiButton-colorPrimary': {
              backgroundImage: `linear-gradient(135deg, ${primary.main} 0%, ${isDark ? primary.dark : brandColors.primary.dark} 100%)`,
              '&:hover': {
                backgroundImage: `linear-gradient(135deg, ${isDark ? primary.light : brandColors.primary.light} 0%, ${primary.main} 100%)`,
              },
            },
          },
          outlined: {
            '&:hover': { transform: 'translateY(-1px)' },
          },
          text: {
            '&:hover': { backgroundColor: alpha(primary.main, isDark ? 0.12 : 0.08) },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 10, transition: `background-color ${transitions.fast}` },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            transition: `box-shadow ${transitions.standard}, background-color ${transitions.standard}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${divider}`,
            backgroundImage: 'none',
            transition: `transform ${transitions.standard}, box-shadow ${transitions.standard}, border-color ${transitions.standard}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
            height: 28,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: `box-shadow ${transitions.fast}, border-color ${transitions.fast}`,
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(primary.main, 0.15)}`,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: divider,
              transition: 'border-color 120ms ease',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, backgroundImage: 'none' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.06)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 8,
            padding: '6px 10px',
            boxShadow: baseShadow,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48,
            transition: `color ${transitions.fast}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            borderRadius: 999,
            height: 3,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: `background-color ${transitions.fast}, color ${transitions.fast}`,
            '&.Mui-selected': {
              backgroundColor: alpha(primary.main, isDark ? 0.18 : 0.1),
              '&:hover': { backgroundColor: alpha(primary.main, isDark ? 0.24 : 0.14) },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: 40, color: 'inherit' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${divider}`,
          },
          head: { fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, height: 8 },
          bar: { borderRadius: 999 },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            '&:before': { display: 'none' },
            boxShadow: `0 1px 4px rgba(15,23,42,0.05)`,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(2,6,17,0.6)' : 'rgba(15,23,42,0.35)',
            backdropFilter: 'blur(2px)',
          },
        },
      },
    },
  };

  return options;
};

export const lightTheme: Theme = createTheme(createAppThemeOptions('light'));
export const darkTheme: Theme = createTheme(createAppThemeOptions('dark'));

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  mode === 'light' ? lightTheme : darkTheme;
