import { AuthShell, ForgotPasswordForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

export const ForgotPasswordPage: React.FC = () => {
  useDocumentTitle('Forgot Password');

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="No worries — we'll help you get back in."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
};

export default ForgotPasswordPage;
