import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const ErrorLayout: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Outlet />
    </Box>
  );
};

export default ErrorLayout;
