import { AuthShell, ResetPasswordForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Reset Password');

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick a strong password you haven't used before."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
};

export default ResetPasswordPage;
