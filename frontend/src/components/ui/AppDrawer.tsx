import type { ReactNode } from 'react';
import MuiDrawer, { type DrawerProps as MuiDrawerProps } from '@mui/material/Drawer';
import { Box, IconButton } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import CloseIcon from '@mui/icons-material/Close';

export interface AppDrawerProps extends MuiDrawerProps {
  title?: string;
  width?: number;
  children: ReactNode;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  title,
  width = 360,
  children,
  anchor = 'right',
  ...rest
}) => {
  return (
    <MuiDrawer anchor={anchor} {...rest}>
      <Box
        sx={{
          width: { xs: '100%', sm: width },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {title && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <IconButton aria-label="Close drawer" onClick={(event) => rest.onClose?.(event, 'escapeKeyDown')}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>{children}</Box>
      </Box>
    </MuiDrawer>
  );
};

export default AppDrawer;
