import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Link } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { Button, FormInput } from '@/components';
import { authService } from '@/services';
import { ROUTES } from '@/constants';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from './schemas';

export const ForgotPasswordForm: React.FC = () => {
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      // The API returns the same message whether or not the email exists.
      setSent(true);
      void error;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        {sent ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            If an account exists for that email, a password reset link is on its way. Please check
            your inbox.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              Enter the email address associated with your account and we&apos;ll send you a link to
              reset your password.
            </Typography>
            <FormInput
              name="email"
              control={control}
              label="Email address"
              type="email"
              autoComplete="email"
            />
            <Button type="submit" size="large" fullWidth loading={isSubmitting}>
              Send Reset Link
            </Button>
          </>
        )}
      </Stack>

      <Stack spacing={1} sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Remembered it?{' '}
          <Link component={RouterLink} to={ROUTES.LOGIN} underline="hover" sx={{ fontWeight: 700 }}>
            Back to sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default ForgotPasswordForm;
