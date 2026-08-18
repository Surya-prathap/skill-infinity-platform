import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useSearchParams } from 'react-router-dom';
import { AuthShell } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';
import { showInfo, showSuccess } from '@/utils';

export const EmailVerificationPage: React.FC = () => {
  useDocumentTitle('Verify Email');
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const email = searchParams.get('email') ?? 'your email';

  const handleVerify = () => {
    // Architecture-ready: verify token with the identity-service later.
    setVerified(true);
    showSuccess('Email verified successfully!');
  };

  const handleResend = () => {
    showInfo(`Verification email re-sent to ${email}.`);
  };

  return (
    <AuthShell
      title={verified ? 'Email verified!' : 'Verify your email'}
      subtitle={
        verified
          ? 'Your account is ready. Start exploring mentors and sessions.'
          : `We sent a verification link to ${email}.`
      }
    >
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Box
          sx={{
            mx: 'auto',
            width: 84,
            height: 84,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            color: 'success.main',
            bgcolor: 'success.light',
            boxShadow: '0 0 0 8px rgba(16,185,129,0.12)',
          }}
        >
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 42 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
          {verified
            ? 'You can now sign in and book your first session.'
            : 'Click the link in the email to activate your account. If you did not receive it, check your spam folder.'}
        </Typography>
        <Button variant="contained" size="large" fullWidth onClick={handleVerify} sx={{ mb: 1.5 }}>
          {verified ? 'Go to Dashboard' : 'I have verified — Continue'}
        </Button>
        {!verified && (
          <Button variant="text" onClick={handleResend}>
            Resend verification email
          </Button>
        )}
      </Box>
    </AuthShell>
  );
};

export default EmailVerificationPage;
