import { Box, Button, Chip, Grid } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import StarIcon from '@mui/icons-material/Star';
import { useState } from 'react';
import { Avatar, Card, SearchBar } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { showInfo } from '@/utils';

const MENTORS = [
  { id: '1', name: 'Alex Rivera', title: 'Staff Engineer · System Design', rating: 4.9, reviews: 132, skills: ['System Design', 'AWS', 'Distributed Systems'] },
  { id: '2', name: 'Emily Watson', title: 'React Performance Specialist', rating: 4.8, reviews: 98, skills: ['React', 'TypeScript', 'Performance'] },
  { id: '3', name: 'Priya Sharma', title: 'Cloud Architect · Security', rating: 5.0, reviews: 214, skills: ['Cloud', 'Security', 'Architecture'] },
  { id: '4', name: 'David Kim', title: 'Career Coach · Behavioral Prep', rating: 4.7, reviews: 156, skills: ['Interviews', 'Career', 'Leadership'] },
  { id: '5', name: 'Sarah Chen', title: 'Backend Engineer · Microservices', rating: 4.9, reviews: 87, skills: ['Java', 'Spring', 'Kafka'] },
  { id: '6', name: 'Marcus Reid', title: 'Data Engineering Lead', rating: 4.6, reviews: 64, skills: ['Python', 'SQL', 'Data Pipelines'] },
];

export const MentorsPage: React.FC = () => {
  useDocumentTitle('Find Mentors');
  const [query, setQuery] = useState('');

  const filtered = MENTORS.filter((mentor) =>
    mentor.name.toLowerCase().includes(query.toLowerCase()) ||
    mentor.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Box>
      <Stack spacing={1} sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Find Your Perfect Mentor
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
          Browse verified professionals across every domain. Mentor profiles and booking arrive with
          the full marketplace.
        </Typography>
      </Stack>

      <Box sx={{ maxWidth: 520, mx: 'auto', mb: 5 }}>
        <SearchBar placeholder="Search by name, skill or domain…" value={query} onChange={setQuery} />
      </Box>

      {filtered.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No mentors found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try a different search term.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((mentor) => (
            <Grid key={mentor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card hoverable sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar name={mentor.name} size={56} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {mentor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {mentor.title}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
                  <StarIcon fontSize="small" sx={{ color: '#F59E0B' }} />
                  <Typography variant="body2" fontWeight={700}>
                    {mentor.rating}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({mentor.reviews} reviews)
                  </Typography>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2.5 }}>
                  {mentor.skills.map((skill) => (
                    <Chip key={skill} size="small" label={skill} variant="outlined" />
                  ))}
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => showInfo('Mentor profiles and booking ship with the Marketplace feature.')}
                >
                  View Profile
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MentorsPage;
