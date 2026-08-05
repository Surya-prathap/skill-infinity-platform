import { useEffect, useMemo, useState } from 'react';
import { Box, Dialog, InputAdornment, ListItemButton, ListItemIcon, ListItemText, TextField } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { Stack, Typography } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { ADMIN_NAV_GROUPS } from '@/constants/navigation';
import { ROUTES } from '@/constants';
import { showInfo } from '@/utils';
import type { NavItem } from '@/types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface CommandResult {
  label: string;
  group: string;
  path?: string;
  action?: () => void;
  icon?: React.ReactNode;
}

const QUICK_ACTIONS: CommandResult[] = [
  { label: 'Create announcement', group: 'Quick actions', path: ROUTES.ADMIN_ANNOUNCEMENTS, icon: '📣' },
  { label: 'Review mentor approvals', group: 'Quick actions', path: ROUTES.ADMIN_MENTORS, icon: '✅' },
  { label: 'Generate revenue report', group: 'Quick actions', path: ROUTES.ADMIN_REPORTS, icon: '📊' },
  { label: 'Toggle maintenance mode', group: 'Quick actions', path: ROUTES.ADMIN_SETTINGS, icon: '🔧' },
  { label: 'Export audit log', group: 'Quick actions', path: ROUTES.ADMIN_AUDIT, icon: '🧾' },
];

export const AdminCommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const pages: CommandResult[] = useMemo(
    () =>
      ADMIN_NAV_GROUPS.flatMap((group) =>
        group.items.map((item: NavItem) => ({
          label: item.label,
          group: group.label,
          path: item.path,
          icon: item.icon,
        })),
      ),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...pages, ...QUICK_ACTIONS];
    if (!q) return all;
    return all.filter((result) => result.label.toLowerCase().includes(q) || result.group.toLowerCase().includes(q));
  }, [query, pages]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  const run = (result: CommandResult) => {
    onClose();
    if (result.path) navigate(result.path);
    else if (result.action) result.action();
    else showInfo(`${result.label} — action available soon`);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && results[activeIndex]) {
      run(results[activeIndex]!);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      aria-label="Command palette"
    >
      <Box onKeyDown={handleKeyDown}>
        <TextField
          autoFocus
          fullWidth
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages and quick actions…"
          variant="standard"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      border: 1,
                      borderColor: 'divider',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'text.secondary',
                      bgcolor: 'background.default',
                    }}
                  >
                    ESC
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          sx={{ px: 2.5, py: 1.5 }}
        />

        <Box sx={{ maxHeight: 380, overflowY: 'auto', px: 1.5, pb: 1.5 }} role="listbox" aria-label="Command results">
          <AnimatePresence mode="popLayout">
            {results.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No results for “{query}”
                </Typography>
              </motion.div>
            )}
            {results.map((result, index) => (
              <motion.div
                key={`${result.group}-${result.label}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.02 }}
              >
                <ListItemButton
                  selected={index === activeIndex}
                  onClick={() => run(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  sx={{ borderRadius: 2, mb: 0.25 }}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    {result.icon && typeof result.icon === 'string' ? (
                      <Box component="span" sx={{ fontSize: 18 }}>
                        {result.icon}
                      </Box>
                    ) : (
                      result.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {result.label}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {result.group}
                        </Typography>
                      </Stack>
                    }
                  />
                  {index === activeIndex && <KeyboardArrowRightIcon fontSize="small" color="primary" />}
                </ListItemButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <Box sx={{ px: 2.5, py: 1.25, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
          {['↑ ↓ navigate', '↵ select', 'esc close'].map((hint) => (
            <Typography key={hint} variant="caption" color="text.disabled" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                component="span"
                sx={{ px: 0.5, py: 0.15, borderRadius: 0.75, border: 1, borderColor: 'divider', fontSize: '0.62rem', fontWeight: 700 }}
              >
                {hint.split(' ')[0]}
              </Box>
              {hint.split(' ').slice(1).join(' ')}
            </Typography>
          ))}
        </Box>
      </Box>
    </Dialog>
  );
};

export default AdminCommandPalette;
