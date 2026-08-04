import { useMemo, useState } from 'react';
import { Box, Chip, Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import { PageHeader, PageTransition } from '@/components';
import { AnnouncementCard } from '@/components/communication';
import { Typography } from '@/components/ui/Typography';
import { useAnnouncementsQuery } from '@/features/communication';
import { useDocumentTitle } from '@/hooks';
import { formatDateTime } from '@/utils';
import type { Announcement, AnnouncementCategory } from '@/types';

const CATEGORIES: { value: 'ALL' | AnnouncementCategory; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PLATFORM', label: 'Platform' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'PROMOTION', label: 'Promotions' },
  { value: 'EVENT', label: 'Events' },
];

/** Premium announcement center — featured hero, filters, detail dialog. */
export const AnnouncementsPage: React.FC = () => {
  useDocumentTitle('Announcements');
  const { announcements, isOffline } = useAnnouncementsQuery();
  const [category, setCategory] = useState<'ALL' | AnnouncementCategory>('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Announcement | null>(null);

  const featured = useMemo(
    () => announcements.find((announcement) => announcement.pinned) ?? announcements[0] ?? null,
    [announcements],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return announcements.filter((announcement) => {
      if (featured && announcement.id === featured.id) return false;
      if (category !== 'ALL' && announcement.category !== category) return false;
      if (needle && !`${announcement.title} ${announcement.body}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [announcements, featured, category, query]);

  return (
    <PageTransition>
      <PageHeader
        title="Announcements"
        subtitle="Platform updates, maintenance windows, events and promotions from the Skill Infinity team."
      />

      {/* Featured hero */}
      {featured && (
        <Box sx={{ mb: 3 }}>
          <AnnouncementCard announcement={featured} featured onOpen={setSelected} />
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {CATEGORIES.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              size="small"
              onClick={() => setCategory(item.value)}
              color={category === item.value ? 'primary' : 'default'}
              variant={category === item.value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <TextField
          size="small"
          placeholder="Search announcements…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ width: { xs: '100%', sm: 260 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Grid */}
      {visible.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CampaignOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>
            No announcements found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {query ? `Nothing matches “${query}”` : 'Check back soon for updates.'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
          {visible.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4), type: 'spring', stiffness: 300, damping: 28 }}
            >
              <AnnouncementCard announcement={announcement} onOpen={setSelected} />
            </motion.div>
          ))}
        </Box>
      )}

      {isOffline && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          Showing cached announcements — connect to the communication service for live updates.
        </Typography>
      )}

      {/* Detail dialog */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth aria-label="Announcement details">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Announcement
          </Typography>
          <IconButton size="small" aria-label="Close" onClick={() => setSelected(null)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '0 !important' }}>
          {selected && (
            <>
              <Typography variant="h6" fontWeight={800}>
                {selected.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                <Chip label={selected.category} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {selected.author} · {formatDateTime(selected.publishedAt)}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {selected.body}
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default AnnouncementsPage;
