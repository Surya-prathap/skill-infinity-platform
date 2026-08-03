import { Box, Button, Chip, Grid, TextField } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Avatar, Card, PageHeader } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { formatRelativeTime, showInfo } from '@/utils';

const POSTS = [
  {
    id: '1',
    author: 'Sarah Chen',
    role: 'Frontend Developer',
    time: '2 hours ago',
    content:
      'Just finished my system design session and I finally understand how to scale APIs! Highly recommend booking a session with Alex.',
    likes: 24,
    comments: 6,
    tag: 'Learning',
  },
  {
    id: '2',
    author: 'Marcus Reid',
    role: 'Data Analyst',
    time: '5 hours ago',
    content:
      'Sharing my study plan for the AWS certification. Happy to answer any questions about the journey!',
    likes: 41,
    comments: 12,
    tag: 'Study Plan',
  },
  {
    id: '3',
    author: 'Priya Sharma',
    role: 'Mentor · Cloud Architect',
    time: '1 day ago',
    content:
      'Pro tip: when preparing for architecture interviews, always practice the trade-off analysis out loud. It makes a huge difference.',
    likes: 67,
    comments: 18,
    tag: 'Advice',
  },
];

export const CommunityPage: React.FC = () => {
  useDocumentTitle('Community');

  return (
    <Box>
      <PageHeader
        title="Community"
        subtitle="Learn together, share wins and grow with peers and mentors."
        actions={
          <Button variant="contained" startIcon={<SendOutlinedIcon />} onClick={() => showInfo('Post composer arrives with the Community feature.')}>
            New Post
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Composer placeholder */}
            <Card sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar name="You" size={40} />
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Share something with the community…"
                  disabled
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Stack>
            </Card>

            {POSTS.map((post) => (
              <Card key={post.id} hoverable sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar name={post.author} size={44} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {post.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {post.role} · {formatRelativeTime(post.time)}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={post.tag}
                    sx={{ ml: 'auto', fontWeight: 600 }}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" lineHeight={1.8}>
                  {post.content}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Button size="small" startIcon={<ThumbUpOutlinedIcon />}>
                    {post.likes}
                  </Button>
                  <Button size="small" startIcon={<ChatBubbleOutlineOutlinedIcon />}>
                    {post.comments}
                  </Button>
                  <Button size="small" startIcon={<ShareOutlinedIcon />} sx={{ ml: 'auto' }}>
                    Share
                  </Button>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Community Stats
            </Typography>
            <Stack spacing={1.5}>
              {[
                { label: 'Total members', value: '48,200' },
                { label: 'Posts this week', value: '1,204' },
                { label: 'Questions answered', value: '3,876' },
                { label: 'Active mentors', value: '2,500' },
              ].map((stat) => (
                <Stack key={stat.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommunityPage;
