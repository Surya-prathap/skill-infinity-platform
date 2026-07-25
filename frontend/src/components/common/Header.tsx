import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { APP_NAME, ROUTES } from '../../utils';

const NAV_ITEMS = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Mentors', path: ROUTES.MENTORS },
  { label: 'Community', path: ROUTES.COMMUNITY },
  { label: 'Sessions', path: ROUTES.SESSIONS },
  { label: 'Wallet', path: ROUTES.WALLET },
];

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        {APP_NAME}
      </Typography>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component="a"
              href={item.path}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="a"
            href={ROUTES.HOME}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
            }}
          >
            <AutoStoriesIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {APP_NAME}
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.label}
                  href={item.path}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' },
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              href={ROUTES.LOGIN}
              size="small"
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              href={ROUTES.REGISTER}
              size="small"
              disableElevation
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
