import { useSearchParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import { AuthShell, LoginForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Sign In');
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === 'true';

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your learning journey.">
      {expired && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Your session expired. Please sign in again to continue.
        </Alert>
      )}
      <LoginForm />
    </AuthShell>
  );
};

export default LoginPage;
