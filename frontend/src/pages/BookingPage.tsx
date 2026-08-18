import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Card, EmptyState, ErrorState } from '@/components';
import { PageHeader } from '@/components/common';
import { BookingWizard } from '@/components/booking';
import { useDocumentTitle } from '@/hooks';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { useMentorProfile } from '@/features/marketplace';
import { useBookSessionMutation } from '@/features/sessions';

export const BookingPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { mentor, isOffline } = useMentorProfile(mentorId);
  const bookMutation = useBookSessionMutation();

  useDocumentTitle(mentor ? `Book with ${mentor.profile?.headline?.split('·')[0] ?? 'Mentor'}` : 'Book a session');

  const handleSubmit = async (request: Parameters<typeof bookMutation.mutateAsync>[0]) => {
    await bookMutation.mutateAsync(request);
  };

  if (isOffline && !mentor) {
    return (
      <ErrorState
        title="Mentor not found"
        message="This mentor isn't accepting bookings right now."
        actionLabel="Browse mentors"
        onAction={() => navigate(ROUTES.MENTORS)}
      />
    );
  }

  if (!mentor) {
    return (
      <Box sx={{ py: 6 }}>
        <EmptyState title="Loading mentor…" />
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.MENTOR_DETAILS.replace(':mentorId', mentor.id))} sx={{ mb: 2.5 }}>
        Back to profile
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Card sx={{ p: { xs: 2, md: 4 } }}>
          <PageHeader
            title="Book a session"
            subtitle={`Secure your spot with ${mentor.profile?.headline?.split('·')[0]?.trim() ?? 'your mentor'}`}
            actions={
              <Chip
                label={`${(mentor.pricingList ?? []).length} session type${(mentor.pricingList ?? []).length === 1 ? '' : 's'} available`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            }
          />
          <BookingWizard
            mentor={mentor}
            name={mentor.profile?.headline?.split('·')[0]?.trim()}
            // The public mentor profile already carries the mentor's pricing and
            // availability — no extra round-trips for the booking flow.
            pricing={mentor.pricingList ?? []}
            availability={mentor.availabilities}
            learnerId={user?.userId}
            learnerName={[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
            learnerEmail={user?.email}
            onSubmit={handleSubmit}
          />
        </Card>
      </motion.div>
    </Box>
  );
};

export default BookingPage;
