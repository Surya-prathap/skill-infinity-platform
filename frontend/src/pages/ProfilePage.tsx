import { useState } from 'react';
import { Box, Button, Chip, Divider, Grid } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { Avatar, Card, Modal, PageHeader } from '@/components';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROLE_LABELS } from '@/constants';

const STATS = [
  { label: 'Sessions', value: '24' },
  { label: 'Reviews', value: '18' },
  { label: 'Credits', value: '320' },
  { label: 'Community posts', value: '9' },
];

export const ProfilePage: React.FC = () => {
  useDocumentTitle('Profile');
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.username || 'Skill Member';

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account details."
        actions={
          <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              email={user?.email}
              size={96}
              sx={{ mx: 'auto', mb: 2, fontSize: 36 }}
            />
            <Typography variant="h5" fontWeight={800}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {user?.roles?.map((role) => (
                <Chip key={role} size="small" label={ROLE_LABELS[role] ?? role} color="primary" variant="outlined" />
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={1}>
              {STATS.map((stat) => (
                <Grid key={stat.label} size={6}>
                  <Typography variant="h6" fontWeight={800}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                This is where your bio will appear. Add a short introduction about your learning
                goals, interests and what you hope to achieve on Skill Infinity. (Profile
                management ships with the User Portal on Day 12.)
              </Typography>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <BadgeOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Username:</strong> {user?.username || '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Email:</strong> {user?.email || '—'}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Full profile management (name, bio, avatar, preferences) arrives with the User Portal on
            Day 12 — no architectural changes required.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => setEditOpen(false)}>
            Got it
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};

export default ProfilePage;
