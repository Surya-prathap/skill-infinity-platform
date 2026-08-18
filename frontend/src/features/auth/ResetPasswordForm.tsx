import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Link } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, PasswordInput } from '@/components';
import { authService } from '@/services';
import { ROUTES } from '@/constants';
import { showError, showSuccess } from '@/utils';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schemas';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      showError('The reset link is invalid or expired. Please request a new one.');
      return;
    }
    try {
      await authService.resetPassword(token, values.password);
      showSuccess('Password reset successful. Please sign in.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to reset your password. Please try again.',
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {!token && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Missing reset token. Use the link from your email.
          </Alert>
        )}
        <PasswordInput
          name="password"
          control={control}
          label="New password"
          autoComplete="new-password"
        />
        <PasswordInput
          name="confirmPassword"
          control={control}
          label="Confirm new password"
          autoComplete="new-password"
        />
        <Button type="submit" size="large" fullWidth loading={isSubmitting}>
          Reset Password
        </Button>
      </Stack>

      <Stack spacing={1} sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <Link component={RouterLink} to={ROUTES.LOGIN} underline="hover" sx={{ fontWeight: 600 }}>
            Back to sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default ResetPasswordForm;
