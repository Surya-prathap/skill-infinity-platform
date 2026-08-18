import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { FilterDrawer, MarketplaceMentorCard } from '@/components/marketplace';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { useDebounce } from '@/hooks';
import { useMentorSearch, useRecentSearches, useSavedMentors } from '@/features/marketplace';
import { SORT_OPTIONS } from '@/features/marketplace/constants';
import { Pagination } from '@/components/ui/Pagination';
import type { DiscoveryFilters, MentorSortKey } from '@/types';

const PAGE_SIZE = 6;

export const MentorsPage: React.FC = () => {
  useDocumentTitle('Find Mentors');
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<MentorSortKey>('RATING');
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const { saved, isSaved, toggleSaved, savedMentors } = useSavedMentors();
  const { recent, addSearch } = useRecentSearches();

  const debounced = useDebounce(debouncedQuery, 400);

  const discoveryQuery = useMemo(
    () => ({
      keyword: debounced || undefined,
      categories: activeCategory ? [activeCategory] : filters.categories,
      skills: filters.skills,
      minExperience: filters.minExperience,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      languages: filters.languages,
      country: filters.country,
      timezone: filters.timezone,
      verifiedOnly: filters.verifiedOnly,
      sortBy: sortBy === 'PRICE_LOW' ? 'price' : sortBy === 'PRICE_HIGH' ? 'price' : 'rating',
      sortDirection: (sortBy === 'PRICE_LOW' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
      page,
      size: PAGE_SIZE,
    }),
    [debounced, filters, activeCategory, sortBy, page],
  );

  const { data, isFetching, isOffline } = useMentorSearch(discoveryQuery);

  const handleSearch = (value: string) => {
    setDebouncedQuery(value);
    setPage(0);
  };

  const handleFilterChange = (next: DiscoveryFilters) => {
    setFilters(next);
    setPage(0);
  };

  const toggleCategory = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category));
    setPage(0);
  };

  const displayMentors = showSaved
    ? savedMentors.map((m) => ({ id: m.id, mentor: m }))
    : data.content.map((summary) => ({ id: summary.id, mentor: summary }));

  /** Trending skills derived from the real mentor search results (no seed data). */
  const trendingSkills = useMemo(() => {
    const seen = new Set<string>();
    const skills: string[] = [];
    for (const summary of data.content) {
      const headline = summary.headline ?? '';
      const parts = headline.split('·');
      for (const part of parts) {
        const candidate = part.trim();
        if (candidate && !seen.has(candidate)) {
          seen.add(candidate);
          skills.push(candidate);
        }
      }
      if (skills.length >= 4) break;
    }
    return skills;
  }, [data.content]);

  /** Trending mentors from real search results (top by sessions, capped at 3). */
  const trendingMentors = useMemo(
    () => [...data.content].sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 3),
    [data.content],
  );

  return (
    <Box>
      {/* ================= Hero ================= */}
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4.5 },
          mb: 3.5,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: 'linear-gradient(130deg, #4F46E5 0%, #7C3AED 50%, #0EA5E9 125%)',
        }}
      >
        <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }} />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            top: -140,
            right: '6%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)',
            // Blur removed: gradient fades to transparent on its own; animating a
            // blurred layer forces a full re-raster every animation frame.
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />
        <Box sx={{ position: 'relative', maxWidth: 640 }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
              Find your perfect mentor
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2.5, maxWidth: 520 }}>
              Hand-picked experts across engineering, data, design and leadership. Book sessions
              with world-class mentors in minutes.
            </Typography>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <TextField
              fullWidth
              size="medium"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search by skill, topic or mentor…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) addSearch(query);
              }}
              slotProps={{
                input: {
                  sx: { borderRadius: 999, bgcolor: 'rgba(255,255,255,0.96)', color: '#0F172A', pl: 1.5 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#0F172A' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          addSearch(query);
                          handleSearch(query);
                        }}
                        sx={{ borderRadius: 999, bgcolor: '#5443D4', mr: 0.5 }}
                      >
                        Search
                      </Button>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </motion.div>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
            {trendingSkills.length > 0 && (
              <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
                Trending:
              </Typography>
            )}
            {trendingSkills.slice(0, 4).map((skill) => (
              <Chip
                key={skill}
                size="small"
                label={skill}
                onClick={() => {
                  setQuery(skill);
                  handleSearch(skill);
                }}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                  fontWeight: 600,
                }}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ================= Search toolbar ================= */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={1.5}
        sx={{ mb: 3, alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
          <Tooltip title="Filters">
            <Button
              variant="outlined"
              startIcon={<TuneOutlinedIcon />}
              onClick={() => setFiltersOpen(true)}
            >
              Filters
              {Object.keys(filters).length > 0 && (
                <Chip size="small" label={Object.keys(filters).length} sx={{ ml: 0.75, bgcolor: 'primary.main', color: '#fff', height: 18, fontSize: '0.65rem' }} />
              )}
            </Button>
          </Tooltip>
          <Tooltip title={showSaved ? 'Show all mentors' : 'Show saved mentors'}>
            <Button
              variant={showSaved ? 'contained' : 'outlined'}
              startIcon={<FavoriteOutlinedIcon />}
              onClick={() => setShowSaved((prev) => !prev)}
            >
              Saved {saved.length > 0 && `(${saved.length})`}
            </Button>
          </Tooltip>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1}>
          {recent.length > 0 && !showSaved && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
              <HistoryOutlinedIcon sx={{ fontSize: 16 }} />
              {recent.slice(0, 3).map((term) => (
                <Chip
                  key={term}
                  size="small"
                  label={term}
                  onClick={() => {
                    setQuery(term);
                    handleSearch(term);
                  }}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          )}
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as MentorSortKey)}
            slotProps={{
              select: {
                startAdornment: <SortOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              },
            }}
            sx={{ minWidth: 190 }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {/* Category rail */}
      {!showSaved && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {['All', 'Software Engineering', 'Data & AI', 'Design & UX', 'Product & Career', 'Cloud & DevOps', 'Security', 'Mobile', 'Blockchain'].map((category) => {
            const value = category === 'All' ? null : category;
            const active = activeCategory === value;
            return (
              <Chip
                key={category}
                label={category}
                onClick={() => toggleCategory(value!)}
                sx={{
                  fontWeight: 700,
                  px: 0.5,
                  bgcolor: active ? 'primary.main' : 'background.paper',
                  color: active ? '#fff' : 'text.secondary',
                  border: 1,
                  borderColor: active ? 'primary.main' : 'divider',
                  '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* ================= Results ================= */}
      {isFetching && data.content.length === 0 ? (
        <PageSkeleton />
      ) : displayMentors.length === 0 ? (
        <Card sx={{ p: 4 }}>
          <EmptyState
            icon={<SearchIcon sx={{ fontSize: 40 }} />}
            title={showSaved ? 'No saved mentors yet' : 'No mentors match your filters'}
            description={
              showSaved
                ? 'Tap the heart on any mentor card to save them here for quick access.'
                : 'Try adjusting your filters or search terms to find more mentors.'
            }
            actionLabel={showSaved ? 'Browse mentors' : 'Clear filters'}
            onAction={() => {
              if (showSaved) {
                setShowSaved(false);
              } else {
                setFilters({});
                setActiveCategory(null);
                setQuery('');
                setDebouncedQuery('');
              }
            }}
          />
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            <AnimatePresence>
              {displayMentors.map(({ id, mentor }, index) => (
                <Grid key={id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <MarketplaceMentorCard
                    mentor={mentor}
                    saved={isSaved(id)}
                    onToggleSave={() => toggleSaved(id)}
                    index={index}
                  />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>

          {!showSaved && (
            <Pagination
              page={page + 1}
              count={data.totalPages}
              totalItems={data.totalElements}
              pageSize={PAGE_SIZE}
              onChange={(_, value) => setPage(value - 1)}
              sx={{ mt: 3 }}
            />
          )}

          {isOffline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Showing curated preview — live search activates when the API is reachable.
            </Typography>
          )}
        </>
      )}

      {/* ================= Featured / trending strip ================= */}
      {!showSaved && (
        <Box sx={{ mt: 6 }}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 6px 16px rgba(245,158,11,0.4)' }}>
              <LocalFireDepartmentOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Trending mentors
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Most booked this week
              </Typography>
            </Box>
          </Stack>
          {trendingMentors.length > 0 && (
            <Grid container spacing={3}>
              {trendingMentors.map((mentor, index) => (
                <Grid key={mentor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <MarketplaceMentorCard
                    mentor={mentor}
                    saved={isSaved(mentor.id)}
                    onToggleSave={() => toggleSaved(mentor.id)}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Featured banner */}
      {!showSaved && (
        <Box
          sx={{
            mt: 5,
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            background: 'linear-gradient(120deg, #0F766E 0%, #14B8A6 60%, #0EA5E9 130%)',
          }}
        >
          <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.14 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" gap={3} sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 34 }} />
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" fontWeight={800}>
                Are you an expert? Become a mentor.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Share your knowledge, build your brand and earn from every session.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate(ROUTES.BECOME_MENTOR)}
              sx={{ bgcolor: '#fff', color: '#0F766E', fontWeight: 800, '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
            >
              Join as mentor
            </Button>
          </Stack>
        </Box>
      )}

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange({})}
      />
    </Box>
  );
};

export default MentorsPage;
