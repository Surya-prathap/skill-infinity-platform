import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button as MuiButton, Chip, CircularProgress, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { GradientCard } from '@/components/mentor';
import { useMentorProfileQuery } from '@/features/mentor/hooks';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROLES, ROUTES } from '@/constants';

const REVIEW_STEPS = [
  {
    icon: <WorkspacePremiumOutlinedIcon />,
    title: 'Application submitted',
    description: 'Your mentor profile is saved and ready for review.',
    color: '#6D5DF6',
  },
  {
    icon: <HourglassTopOutlinedIcon />,
    title: 'Platform review',
    description: 'Our team verifies your expertise, experience and documents.',
    color: '#F59E0B',
  },
  {
    icon: <VerifiedOutlinedIcon />,
    title: 'Approved & live',
    description: 'You get the mentor role and your public profile goes live.',
    color: '#10B981',
  },
];

export const MentorApplicationSubmittedPage: React.FC = () => {
  useDocumentTitle('Application Under Review');
  const navigate = useNavigate();
  const { hasRole, fetchCurrentUser } = useAuth();
  const { mentor, notFound, refetch } = useMentorProfileQuery();
  const [refreshingRole, setRefreshingRole] = useState(false);
  // Incremented on every poll tick so the activation effect re-runs even when
  // the mentor status string stays "ACTIVE" (string equality alone would not
  // re-trigger it).
  const [checkTick, setCheckTick] = useState(0);
  // Counts how many times the role refresh completed without ROLE_MENTOR yet,
  // so we can surface a helpful hint instead of silently spinning forever.
  const [staleApprovalTries, setStaleApprovalTries] = useState(0);

  /* Poll the mentor status so this page flips to the mentor studio
     automatically as soon as the admin approves the application. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      void refetch().then(() => setCheckTick((tick) => tick + 1));
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [refetch]);

  const status = mentor?.status;

  /* Navigate the moment the application is approved AND the role is present. */
  useEffect(() => {
    if (status === 'ACTIVE' && hasRole([ROLES.MENTOR])) {
      navigate(ROUTES.MENTOR_DASHBOARD, { replace: true });
    }
  }, [status, hasRole, navigate]);

  /* Approved server-side but the JWT still carries the learner role — refresh
     the current user so the new ROLE_MENTOR unlocks the studio. Re-tried on
     every poll tick until the role lands (or the user re-logs-in). */
  useEffect(() => {
    if (notFound) {
      navigate(ROUTES.MENTOR_REGISTRATION, { replace: true });
      return;
    }
    if (status !== 'ACTIVE' || hasRole([ROLES.MENTOR])) {
      setRefreshingRole(false);
      return;
    }
    setRefreshingRole(true);
    void fetchCurrentUser()
      .unwrap()
      .then(() => setStaleApprovalTries((tries) => tries + 1))
      .catch(() => {})
      .finally(() => setRefreshingRole(false));
  }, [status, notFound, hasRole, fetchCurrentUser, navigate, checkTick]);

  const checkStatus = useCallback(() => {
    void refetch().then(() => setCheckTick((tick) => tick + 1));
  }, [refetch]);

  if (notFound) {
    return null;
  }

  if (!mentor) {
    return (
      <Box sx={{ mt: 2 }}>
        <GradientCard gradient="hero" sx={{ mb: 3 }}>
          <Skeleton variant="text" width={280} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Skeleton variant="text" width={420} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        </GradientCard>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress thickness={4} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Checking your application status…
          </Typography>
        </Card>
      </Box>
    );
  }

  const rejected = status === 'REJECTED';

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient={rejected ? 'brandWarm' : 'hero'} sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }} gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.16)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {rejected ? <CancelOutlinedIcon /> : <WorkspacePremiumOutlinedIcon />}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {rejected ? 'Application not approved' : 'Application under review'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.88, mt: 0.25 }}>
              {rejected
                ? 'Our team could not approve this application at this time.'
                : 'Your mentor application has been submitted — you will not appear as a mentor until it is approved.'}
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={rejected ? <CancelOutlinedIcon sx={{ fontSize: 15 }} /> : <HourglassTopOutlinedIcon sx={{ fontSize: 15 }} />}
            label={rejected ? 'Rejected' : 'Pending review'}
            sx={{
              color: '#fff',
              bgcolor: rejected ? 'rgba(244,63,94,0.85)' : 'rgba(245,158,11,0.9)',
              fontWeight: 700,
            }}
          />
        </Stack>
      </GradientCard>

      {rejected ? (
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Alert severity="warning" sx={{ borderRadius: 2.5, mb: 2.5 }}>
            Your mentor application was not approved. You can keep using the platform as a learner.
          </Alert>
          {mentor.rejectionReason ? (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              <b>Reason:</b> {mentor.rejectionReason}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Contact the support team if you believe this was a mistake or would like to re-apply.
            </Typography>
          )}
        </Card>
      ) : (
        <Box>
          {/* ================= Review timeline ================= */}
          <Card sx={{ p: { xs: 2.5, md: 4 }, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
              What happens next
            </Typography>
            <Stack spacing={2.5}>
              {REVIEW_STEPS.map((step, index) => (
                <Stack key={step.title} direction="row" gap={2} sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}99)`,
                      boxShadow: `0 6px 16px ${step.color}45`,
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {step.icon}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        bgcolor: '#fff',
                        color: step.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        boxShadow: 2,
                      }}
                    >
                      {index + 1}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Card>

          {staleApprovalTries >= 3 && (
            <Alert severity="warning" sx={{ borderRadius: 2.5, mb: 2.5 }}>
              Your application has been approved, but your mentor access hasn't activated on this
              device yet. Try signing out and back in, or contact support if this persists.
            </Alert>
          )}

          <Alert severity="info" sx={{ borderRadius: 2.5, mb: 3 }}>
            This page refreshes automatically every few seconds — you'll be taken to the Mentor
            Studio the moment your application is approved. You can also check manually below.
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
            <MuiButton
              variant="contained"
              startIcon={refreshingRole ? <CircularProgress size={18} color="inherit" /> : <RefreshOutlinedIcon />}
              disabled={refreshingRole}
              onClick={checkStatus}
            >
              {refreshingRole ? 'Activating mentor access…' : 'Check status'}
            </MuiButton>
            <MuiButton variant="outlined" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate(ROUTES.DASHBOARD)}>
              Back to dashboard
            </MuiButton>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default MentorApplicationSubmittedPage;
