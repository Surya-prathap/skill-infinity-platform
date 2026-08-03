import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Chip, Divider, Link } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, FormInput, PasswordInput } from '@/components';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { passwordRequirements, showError, showSuccess } from '@/utils';
import { registerSchema, type RegisterFormValues } from './schemas';

export const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' }) ?? '';

  const metRequirements = useMemo(
    () => passwordRequirements.map((requirement) => requirement.test(password)),
    [password],
  );
  const strength = metRequirements.filter(Boolean).length;

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        email: values.email,
        password: values.password,
        username: values.username || undefined,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      });
      showSuccess('Account created — welcome to Skill Infinity!');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Unable to create your account. Please try again.',
      );
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormInput name="firstName" control={control} label="First name" autoComplete="given-name" />
          <FormInput name="lastName" control={control} label="Last name" autoComplete="family-name" />
        </Stack>
        <FormInput name="username" control={control} label="Username" autoComplete="username" />
        <FormInput
          name="email"
          control={control}
          label="Email address"
          type="email"
          autoComplete="email"
        />
        <PasswordInput
          name="password"
          control={control}
          label="Password"
          autoComplete="new-password"
        />

        {password.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
              {passwordRequirements.map((requirement, index) => (
                <Box
                  key={requirement.label}
                  sx={{
                    flex: 1,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: metRequirements[index]
                      ? ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'][strength - 1]
                      : 'action.hover',
                    transition: 'background-color 0.2s ease',
                  }}
                />
              ))}
            </Box>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {passwordRequirements.map((requirement, index) => (
                <Chip
                  key={requirement.label}
                  size="small"
                  label={requirement.label}
                  color={metRequirements[index] ? 'success' : 'default'}
                  variant={metRequirements[index] ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
        )}

        <PasswordInput
          name="confirmPassword"
          control={control}
          label="Confirm password"
          autoComplete="new-password"
        />

        <Button type="submit" size="large" fullWidth loading={isSubmitting}>
          Create Account
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link component={RouterLink} to={ROUTES.LOGIN} underline="hover" sx={{ fontWeight: 700 }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default RegisterForm;
