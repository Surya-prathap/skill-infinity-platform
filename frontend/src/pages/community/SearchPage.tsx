import { useEffect, useState } from 'react';
import { Box, Button, Chip, Divider, Grid, InputBase, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import TagIcon from '@mui/icons-material/Tag';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { PageHeader } from '@/components/common';
import { CommunityCard, PostCard, TagChip } from '@/components/community';
import { EmptyState } from '@/components/feedback';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { useCommunitySearchQuery, usePopularTagsQuery } from '@/features/community';
import { StarRating } from '@/components/community';
import { useRecentSearches } from '@/features/marketplace';
import { formatRelativeTime } from '@/utils';
import { ROUTES } from '@/constants';

export const SearchPage: React.FC = () => {
  useDocumentTitle('Search');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const { recent, addSearch, clearSearches } = useRecentSearches();
  const { results, isFetching } = useCommunitySearchQuery(query);
  const { tags: popularTags } = usePopularTagsQuery();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const submitSearch = () => {
    if (query.trim()) {
      addSearch(query.trim());
      setSearchParams({ q: query.trim() });
    }
  };

  const hasResults =
    results.communities.length > 0 ||
    results.posts.length > 0 ||
    results.tags.length > 0 ||
    results.users.length > 0 ||
    results.reviews.length > 0;

  return (
    <Box>
      <PageHeader
        title="Search"
        subtitle="Find communities, posts, mentors, tags and reviews across the platform."
      />

      {/* Search input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2.5,
          py: 1.3,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 720,
          mb: 3,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:focus-within': { borderColor: 'primary.main', boxShadow: (theme) => `0 0 0 4px ${theme.palette.primary.main}14` },
        }}
      >
        <SearchIcon sx={{ color: 'primary.main' }} />
        <InputBase
          fullWidth
          autoFocus
          placeholder="Search communities, posts, mentors, tags, users, reviews…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitSearch();
          }}
          aria-label="Search the community"
          sx={{ fontSize: '1rem' }}
        />
        <Button variant="contained" size="small" onClick={submitSearch} sx={{ fontWeight: 800 }}>
          Search
        </Button>
      </Box>

      {/* Recent searches */}
      {!query && recent.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <HistoryOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight={800}>
              Recent searches
            </Typography>
            <Button size="small" onClick={clearSearches} sx={{ ml: 'auto', fontWeight: 700 }}>
              Clear
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {recent.map((term) => (
              <Chip
                key={term}
                label={term}
                onClick={() => {
                  setQuery(term);
                  setSearchParams({ q: term });
                }}
                variant="outlined"
                sx={{ fontWeight: 700, cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Popular tags when idle */}
      {!query && (
        <Card sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
            Popular right now
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {popularTags.slice(0, 12).map((tag) => (
              <TagChip
                key={tag.name}
                label={tag.name}
                count={tag.count}
                onClick={() => {
                  setQuery(tag.name);
                  setSearchParams({ q: tag.name });
                }}
              />
            ))}
          </Box>
        </Card>
      )}

      {query && isFetching && (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={90} />
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="rounded" height={90} />
        </Stack>
      )}

      {query && !isFetching && !hasResults && (
        <EmptyState
          icon={<SearchIcon />}
          title={`No results for “${query}”`}
          description="Try different keywords, or explore popular tags below."
        />
      )}

      {query && !isFetching && hasResults && (
        <Stack spacing={4}>
          {/* Communities */}
          {results.communities.length > 0 && (
            <Section title="Communities" icon={<GroupsOutlinedIcon />} count={results.communities.length}>
              <Grid container spacing={2.5}>
                {results.communities.map((community) => (
                  <Grid key={community.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <CommunityCard community={community} onOpen={(item) => navigate(ROUTES.COMMUNITY_DETAILS.replace(':communityId', item.id))} />
                  </Grid>
                ))}
              </Grid>
            </Section>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <Section title="Posts" icon={<ArticleOutlinedIcon />} count={results.posts.length}>
              <Stack spacing={2.5}>
                {results.posts.map((post) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </Stack>
            </Section>
          )}

          {/* Users */}
          {results.users.length > 0 && (
            <Section title="People" icon={<PeopleOutlinedIcon />} count={results.users.length}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1.5 }}>
                {results.users.map((user) => (
                  <Card key={user.id} hoverable sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar name={user.name} size={42} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user.title ?? (user.isMentor ? 'Mentor' : 'Member')}
                      </Typography>
                    </Box>
                    {user.isMentor && <Chip label="Mentor" size="small" color="secondary" variant="outlined" sx={{ ml: 'auto', fontWeight: 800 }} />}
                  </Card>
                ))}
              </Box>
            </Section>
          )}

          {/* Reviews */}
          {results.reviews.length > 0 && (
            <Section title="Reviews" icon={<StarBorderIcon />} count={results.reviews.length}>
              <Stack spacing={1.5}>
                {results.reviews.map((review) => (
                  <Card
                    key={review.id}
                    hoverable
                    sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                    onClick={() => navigate(ROUTES.MENTOR_REVIEWS.replace(':mentorId', review.mentorId))}
                  >
                    <StarRating value={review.rating} size={16} readOnly />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography fontSize="0.85rem" fontWeight={700} noWrap>
                        {review.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {review.learnerName ?? 'Anonymous'} · {formatRelativeTime(review.createdAt)}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Section>
          )}

          {/* Tags */}
          {results.tags.length > 0 && (
            <Section title="Tags" icon={<TagIcon />} count={results.tags.length}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {results.tags.map((tag) => (
                  <TagChip key={tag.name} label={tag.name} count={tag.count} onClick={() => setQuery(tag.name)} />
                ))}
              </Box>
            </Section>
          )}
        </Stack>
      )}
    </Box>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; count: number; children: React.ReactNode }> = ({ title, icon, count, children }) => (
  <Box>
    <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      <Chip label={String(count)} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
    </Stack>
    {children}
    <Divider sx={{ mt: 3 }} />
  </Box>
);

export default SearchPage;
