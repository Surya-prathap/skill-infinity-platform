import { useState, type MouseEvent } from 'react';
import { IconButton, ListItemText, MenuItem, MenuList, Popover, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLanguage } from '@/store/selectors';
import { setLanguage } from '@/store/slices/settingsSlice';
import { showInfo } from '@/utils';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
] as const;

/** i18n architecture placeholder — the selected language persists; translation maps arrive later. */
export const LanguageSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (code: string, label: string) => {
    dispatch(setLanguage(code));
    handleClose();
    showInfo(`Language switched to ${label} (i18n architecture ready)`);
  };

  return (
    <>
      <Tooltip title="Language">
        <IconButton onClick={handleOpen} aria-label="Change language" size="small">
          <TranslateIcon />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 180, mt: 1 } } }}
      >
        <MenuList dense>
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              selected={language === lang.code}
              onClick={() => handleSelect(lang.code, lang.label)}
            >
              <ListItemText>
                {lang.label}
              </ListItemText>
              {language === lang.code && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
};

export default LanguageSwitcher;
