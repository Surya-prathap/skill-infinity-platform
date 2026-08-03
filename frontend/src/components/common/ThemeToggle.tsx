import { useState, type MouseEvent } from 'react';
import { Box, IconButton, ListItemIcon, ListItemText, MenuItem,  MenuList,
  Popover, Tooltip } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import CheckIcon from '@mui/icons-material/Check';
import { useThemeMode } from '@/contexts';
import type { ThemeMode } from '@/types';

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
  { mode: 'light', label: 'Light', icon: <LightModeIcon fontSize="small" /> },
  { mode: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small" /> },
  { mode: 'system', label: 'System', icon: <BrightnessAutoIcon fontSize="small" /> },
];

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const currentIcon =
    mode === 'system' ? (
      <BrightnessAutoIcon />
    ) : mode === 'dark' ? (
      <DarkModeIcon />
    ) : (
      <LightModeIcon />
    );

  return (
    <>
      <Tooltip title={`Theme: ${mode}`}>
        <IconButton onClick={handleOpen} aria-label="Toggle theme" size="small">
          {currentIcon}
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 190, mt: 1 } } }}
      >
        <MenuList dense>
          {OPTIONS.map((option) => (
            <MenuItem
              key={option.mode}
              selected={mode === option.mode}
              onClick={() => {
                setMode(option.mode);
                handleClose();
              }}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText>
                <Typography variant="body2" fontWeight={500}>
                  {option.label}
                </Typography>
              </ListItemText>
              {mode === option.mode && (
                <Box sx={{ ml: 1, display: 'flex' }}>
                  <CheckIcon fontSize="small" color="primary" />
                </Box>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
};

export default ThemeToggle;
