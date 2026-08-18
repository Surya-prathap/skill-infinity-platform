import { AuthShell, RegisterForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks';

export const RegisterPage: React.FC = () => {
  useDocumentTitle('Create Account');

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Skill Infinity free and start learning from expert mentors."
    >
      <RegisterForm />
    </AuthShell>
  );
};

export default RegisterPage;
