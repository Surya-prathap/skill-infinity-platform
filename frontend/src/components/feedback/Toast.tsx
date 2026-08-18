import { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

export const AppToaster: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: 12,
          background: isDark ? theme.palette.background.paper : '#FFFFFF',
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[6],
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: theme.palette.success.main, secondary: '#FFFFFF' },
        },
        error: {
          iconTheme: { primary: theme.palette.error.main, secondary: '#FFFFFF' },
        },
      }}
    />
  );
};

export default AppToaster;
