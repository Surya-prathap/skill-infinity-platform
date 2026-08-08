import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, InputBase } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { PageHeader } from '@/components/common';
import { CommunityCard } from '@/components/community';
import { CommunityCardSkeleton } from '@/components/community';
import { EmptyState } from '@/components/feedback';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle, useDebounce } from '@/hooks';
import { useCommunitiesQuery, usePopularTagsQuery } from '@/features/community';
import { useJoinCommunityMutation } from '@/features/community';
import { showInfo } from '@/utils';
import { ROUTES } from '@/constants';

export const CommunitiesPage: React.FC = () => {
  useDocumentTitle('Communities');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? '';

  const [category, setCategory] = useState<string>(initialCategory);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const { communities, isLoading, isOffline } = useCommunitiesQuery(undefined, undefined);
  const { tags } = usePopularTagsQuery();
  const joinMutation = useJoinCommunityMutation();
  // Category filter chips are derived from the real communities returned by the API.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    return communities
      .filter((community) => {
        if (!community.category || seen.has(community.category)) return false;
        seen.add(community.category);
        return true;
      })
      .map((community) => ({
        id: community.category,
        name: community.category,
        emoji: community.emoji ?? '📌',
        description: '',
        communityCount: 0,
      }));
  }, [communities]);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  const filtered = communities.filter((community) => {
    if (category && community.category !== category) return false;
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      community.name.toLowerCase().includes(q) ||
      community.description.toLowerCase().includes(q) ||
      community.tags.some((tag) => tag.includes(q))
    );
  });

  return (
    <Box>
      <PageHeader
        title="Communities"
        subtitle="Join spaces where engineers, designers and mentors learn together."
        actions={
          <Button variant="outlined" startIcon={<GroupsOutlinedIcon />} onClick={() => showInfo('Creating communities is coming soon!')}>
            Create community
          </Button>
        }
      />

      {/* Search */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.1,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 560,
          mb: 2.5,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:focus-within': { borderColor: 'primary.main', boxShadow: (theme) => `0 0 0 4px ${theme.palette.primary.main}14` },
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <InputBase
          fullWidth
          placeholder="Search communities by name, topic or tag…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search communities"
          sx={{ fontSize: '0.9rem' }}
        />
      </Box>

      {/* Category rail */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <Chip
          label="All"
          onClick={() => setCategory('')}
          color={!category ? 'primary' : 'default'}
          variant={!category ? 'filled' : 'outlined'}
          sx={{ fontWeight: 800 }}
        />
        {categories.map((item) => (
          <Chip
            key={item.id}
            icon={<Box component="span">{item.emoji}</Box>}
            label={item.name}
            onClick={() => setCategory(category === item.name ? '' : item.name)}
            color={category === item.name ? 'primary' : 'default'}
            variant={category === item.name ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Box>

      {/* Popular tags */}
      <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" sx={{ mb: 3 }}>
        <Typography variant="caption" fontWeight={800} color="text.secondary">
          Popular tags:
        </Typography>
        {tags.slice(0, 8).map((tag) => (
          <Chip
            key={tag.name}
            label={`#${tag.name}`}
            size="small"
            variant="outlined"
            onClick={() => {
              setSearch(tag.name);
            }}
            sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
          />
        ))}
      </Stack>

      {isOffline && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
          Communities unavailable — check your connection.
        </Typography>
      )}

      {isLoading && communities.length === 0 ? (
        <Grid container spacing={3}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CommunityCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ mt: 2 }}>
          <EmptyState
            icon={<GroupsOutlinedIcon />}
            title={debouncedSearch ? `No communities for “${debouncedSearch}”` : 'No communities here yet'}
            description={debouncedSearch ? 'Try a different search or browse all categories.' : 'Be the first to create a community in this category.'}
            actionLabel={debouncedSearch ? 'Clear search' : undefined}
            onAction={debouncedSearch ? () => setSearch('') : undefined}
          />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((community, index) => (
            <Grid key={community.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.35 }}
                style={{ height: '100%' }}
              >
                <CommunityCard
                  community={community}
                  onOpen={(item) => navigate(ROUTES.COMMUNITY_DETAILS.replace(':communityId', item.id))}
                  onToggleJoin={(item) => joinMutation.mutate(item.id)}
                  joining={joinMutation.isPending}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CommunitiesPage;
