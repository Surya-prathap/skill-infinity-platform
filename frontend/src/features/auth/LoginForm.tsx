import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Divider, Link } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, FormCheckbox, FormInput, PasswordInput } from '@/components';
import { useAuth } from '@/hooks';
import { setRememberMe } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { ROUTES, getHomeRoute } from '@/constants';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import { loginSchema, type LoginFormValues } from './schemas';

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hard re-entry guard: even though the button is disabled while submitting,
  // a second click (or Enter+click) can land before React re-renders. Two
  // concurrent login POSTs for the same account used to deadlock on the MySQL
  // row lock and stall login for 20s+ — never fire a second request.
  const submittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    dispatch(setRememberMe(values.rememberMe));
    try {
      const auth = await login({ email: values.email, password: values.password });
      showSuccess('Welcome back!');
      const from = (location.state as { from?: string } | null)?.from;
      const home = getHomeRoute(auth.roles);
      // An explicit `from` destination wins — EXCEPT the generic learner
      // `/dashboard`, so admins and mentors are never dropped back onto the
      // learner dashboard (e.g. when their session expired there).
      const destination = from && from !== ROUTES.DASHBOARD ? from : home;
      navigate(destination, { replace: true });
    } catch (error) {
      // `error` here is the string payload thrown by the thunk's `.unwrap()`
      // (not an Error instance), so use getErrorMessage to surface the real
      // backend/network message instead of a generic fallback.
      showError(getErrorMessage(error));
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
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
          autoComplete="current-password"
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <FormCheckbox
            name="rememberMe"
            control={control}
            label="Remember me"
            onChange={(checked) => dispatch(setRememberMe(checked))}
          />
          <Link
            component={RouterLink}
            to={ROUTES.FORGOT_PASSWORD}
            underline="hover"
            sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
          >
            Forgot password?
          </Link>
        </Stack>
        <Button type="submit" size="large" fullWidth loading={isSubmitting}>
          Sign In
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Don&apos;t have an account?{' '}          <Link
            component={RouterLink}
            to={ROUTES.REGISTER}
            underline="hover"
            sx={{ fontWeight: 700 }}
          >
            Create one free
          </Link>
      </Typography>
    </Box>
  );
};

export default LoginForm;
