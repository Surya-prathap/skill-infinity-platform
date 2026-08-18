import {
  Alert,
  Box,
  Button as MuiButton,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import BrightnessAutoOutlinedIcon from '@mui/icons-material/BrightnessAutoOutlined';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Avatar } from '@/components/ui/Avatar';
import { FormInput, FormSelect, FormTextarea } from '@/components';
import { GradientCard, SettingsSection } from '@/components/mentor';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSettings } from '@/store/selectors';
import { updateSettings } from '@/store/slices/settingsSlice';
import { useThemeMode } from '@/contexts';
import { useAuth, useDocumentTitle } from '@/hooks';
import { showSuccess } from '@/utils';
import {
  type PersonalFormValues,
  personalSchema,
  toOptionalNumber,
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/mentor/schemas';
import { TIMEZONES } from '@/features/mentor/constants';
import {
  useMentorPreferencesQuery,
  useMentorProfileQuery,
  useUpdateMentorProfileMutation,
  useUpdatePreferenceMutation,
} from '@/features/mentor/hooks';
import { authService } from '@/services';
import type { ThemeMode } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
];

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'light', label: 'Light', icon: <LightModeOutlinedIcon /> },
  { mode: 'dark', label: 'Dark', icon: <DarkModeOutlinedIcon /> },
  { mode: 'system', label: 'System', icon: <BrightnessAutoOutlinedIcon /> },
];

export const MentorSettingsPage: React.FC = () => {
  useDocumentTitle('Mentor Settings');
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const { mode, setMode } = useThemeMode();
  const { user } = useAuth();

  const { mentor, isOffline } = useMentorProfileQuery();
  const { preferences } = useMentorPreferencesQuery();
  const updateProfile = useUpdateMentorProfileMutation();
  const updatePreference = useUpdatePreferenceMutation();

  const profile = mentor?.profile;

  /* ---------------- Profile form ---------------- */
  const profileForm = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      headline: profile?.headline ?? '',
      bio: profile?.bio ?? '',
      aboutMe: profile?.aboutMe ?? '',
      country: profile?.country ?? '',
      city: profile?.city ?? '',
      timezone: profile?.timezone ?? '',
      yearsOfExperience: profile?.yearsOfExperience ?? null,
    },
    mode: 'onChange',
  });

  const handleProfileSubmit = (values: PersonalFormValues) => {
    updateProfile.mutate({
      headline: values.headline,
      bio: values.bio || undefined,
      aboutMe: values.aboutMe || undefined,
      country: values.country || undefined,
      city: values.city || undefined,
      timezone: values.timezone || undefined,
      yearsOfExperience: toOptionalNumber(values.yearsOfExperience) ?? undefined,
    });
  };

  /* ---------------- Password form ---------------- */
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const handlePasswordSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showSuccess('Password changed successfully');
      passwordForm.reset();
    } catch {
      // Error toast handled by the api layer.
    }
  };

  /* ---------------- Preference helpers ---------------- */
  const setPreference = (patch: Parameters<typeof updatePreference.mutate>[0]) => {
    updatePreference.mutate(patch);
  };

  const toggleProfileFlag = (key: 'profileVisible' | 'acceptingStudents') => {
    updateProfile.mutate({ [key]: profile?.[key] === false });
  };

  const name =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'Mentor';

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="brandWarm" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Avatar name={name} size={52} sx={{ border: '2px solid rgba(255,255,255,0.5)' }} />
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Settings
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Manage your studio profile, preferences and security
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </GradientCard>

      <Grid container spacing={3}>
        {/* ================= Profile ================= */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Profile Settings"
              subtitle="How you appear to learners"
              icon={<PersonOutlineOutlinedIcon />}
              iconColor="#6D5DF6"
              sx={{ mb: 3 }}
            >
              <Box
                component="form"
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                noValidate
              >
                <Stack spacing={2.5}>
                  <FormInput
                    name="headline"
                    control={profileForm.control}
                    label="Professional headline"
                    required
                    placeholder="e.g. Senior Staff Engineer · System Design & Cloud"
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="country"
                        control={profileForm.control}
                        label="Country"
                        placeholder="e.g. United States"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="city"
                        control={profileForm.control}
                        label="City"
                        placeholder="e.g. San Francisco"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="yearsOfExperience"
                        control={profileForm.control}
                        label="Years of experience"
                        type="number"
                      />
                    </Grid>
                  </Grid>
                  <FormSelect
                    name="timezone"
                    control={profileForm.control}
                    label="Timezone"
                    options={TIMEZONES}
                    placeholder="Select your timezone"
                  />
                  <FormTextarea
                    name="bio"
                    control={profileForm.control}
                    label="Short bio"
                    rows={3}
                  />
                  <FormTextarea
                    name="aboutMe"
                    control={profileForm.control}
                    label="About me"
                    rows={4}
                  />
                  <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
                    <MuiButton type="submit" variant="contained" loading={updateProfile.isPending}>
                      Save profile
                    </MuiButton>
                  </Stack>
                </Stack>
              </Box>
            </SettingsSection>
          </motion.div>

          {/* ================= Preferences ================= */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Studio Preferences"
              subtitle="Booking behaviour and session management"
              icon={<TuneOutlinedIcon />}
              iconColor="#14B8A6"
              sx={{ mb: 3 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.autoApproveSessions}
                        onChange={(event) =>
                          setPreference({ autoApproveSessions: event.target.checked })
                        }
                      />
                    }
                    label="Auto-approve sessions"
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', pl: 6, mt: -0.5 }}
                  >
                    Accept new bookings without manual review
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationOnBooking}
                        onChange={(event) =>
                          setPreference({ notificationOnBooking: event.target.checked })
                        }
                      />
                    }
                    label="Notify on new bookings"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.notificationOnCancellation}
                        onChange={(event) =>
                          setPreference({ notificationOnCancellation: event.target.checked })
                        }
                      />
                    }
                    label="Notify on cancellations"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(preferences.bufferMinutesBetweenSessions)}
                        onChange={(event) =>
                          setPreference({
                            bufferMinutesBetweenSessions: event.target.checked ? 15 : 0,
                          })
                        }
                      />
                    }
                    label="Buffer time between sessions"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2.5 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pref-booking-days-label">Advance booking window</InputLabel>
                    <Select
                      labelId="pref-booking-days-label"
                      value={preferences.advanceBookingDays ?? 14}
                      onChange={(event) =>
                        setPreference({ advanceBookingDays: Number(event.target.value) })
                      }
                      label="Advance booking window"
                    >
                      {[7, 14, 30, 60, 90].map((days) => (
                        <MenuItem key={days} value={days}>
                          {days} days
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="pref-cancel-label">Cancellation policy</InputLabel>
                    <Select
                      labelId="pref-cancel-label"
                      value={preferences.cancellationHours ?? 24}
                      onChange={(event) =>
                        setPreference({ cancellationHours: Number(event.target.value) })
                      }
                      label="Cancellation policy"
                    >
                      {[6, 12, 24, 48, 72].map((hours) => (
                        <MenuItem key={hours} value={hours}>
                          {hours} hours notice
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </SettingsSection>
          </motion.div>
        </Grid>

        {/* ================= Right column ================= */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            {/* Password & security */}
            <SettingsSection
              title="Password & Security"
              subtitle="Keep your studio account safe"
              icon={<LockOutlinedIcon />}
              iconColor="#EF4444"
              sx={{ mb: 3 }}
            >
              <Box
                component="form"
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                noValidate
              >
                <Stack spacing={2}>
                  <FormInput
                    name="currentPassword"
                    control={passwordForm.control}
                    label="Current password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                  <FormInput
                    name="newPassword"
                    control={passwordForm.control}
                    label="New password"
                    type="password"
                    required
                    autoComplete="new-password"
                    helperText="8+ characters with upper, lower and a number"
                  />
                  <FormInput
                    name="confirmPassword"
                    control={passwordForm.control}
                    label="Confirm new password"
                    type="password"
                    required
                    autoComplete="new-password"
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <MuiButton type="submit" variant="contained" color="error">
                      Update password
                    </MuiButton>
                  </Stack>
                </Stack>
              </Box>
            </SettingsSection>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Appearance"
              subtitle="Theme mode"
              icon={<PaletteOutlinedIcon />}
              iconColor="#8B5CF6"
              sx={{ mb: 3 }}
            >
              <Stack direction="row" gap={1.5} flexWrap="wrap">
                {THEME_OPTIONS.map((option) => (
                  <Box
                    key={option.mode}
                    role="radio"
                    aria-checked={mode === option.mode}
                    tabIndex={0}
                    onClick={() => setMode(option.mode)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setMode(option.mode);
                      }
                    }}
                    sx={{
                      flex: '1 1 90px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      py: 1.5,
                      px: 1,
                      borderRadius: 2.5,
                      border: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderColor: mode === option.mode ? 'primary.main' : 'divider',
                      bgcolor: mode === option.mode ? 'action.selected' : 'transparent',
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      '&:focus-visible': {
                        outline: '3px solid rgba(109,93,246,0.35)',
                        outlineOffset: 1,
                      },
                    }}
                  >
                    <Box sx={{ color: mode === option.mode ? 'primary.main' : 'text.secondary' }}>
                      {option.icon}
                    </Box>
                    <Typography variant="caption" fontWeight={700}>
                      {option.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SettingsSection>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Notifications"
              subtitle="Choose what you want to hear about"
              icon={<NotificationsNoneOutlinedIcon />}
              iconColor="#F59E0B"
              sx={{ mb: 3 }}
            >
              <Grid container spacing={1}>
                {(
                  [
                    { key: 'emailNotifications' as const, label: 'Email notifications' },
                    { key: 'pushNotifications' as const, label: 'Push notifications' },
                    { key: 'sessionReminders' as const, label: 'Session reminders' },
                    { key: 'marketingEmails' as const, label: 'Product & marketing emails' },
                  ] as const
                ).map((item) => (
                  <Grid key={item.key} size={{ xs: 12 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Switch
                        checked={settings[item.key]}
                        onChange={(event) => {
                          dispatch(updateSettings({ [item.key]: event.target.checked }));
                          showSuccess('Preference updated');
                        }}
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </SettingsSection>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Privacy"
              subtitle="Who can see and book your profile"
              icon={<PrivacyTipOutlinedIcon />}
              iconColor="#10B981"
              sx={{ mb: 3 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Public profile
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Show your profile in mentor search results
                  </Typography>
                </Box>
                <Switch
                  checked={profile?.profileVisible !== false}
                  onChange={() => toggleProfileFlag('profileVisible')}
                />
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Accepting new students
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allow learners to book new sessions
                  </Typography>
                </Box>
                <Switch
                  checked={profile?.acceptingStudents !== false}
                  onChange={() => toggleProfileFlag('acceptingStudents')}
                />
              </Stack>
            </SettingsSection>
          </motion.div>

          {/* Language & timezone */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <SettingsSection
              title="Language & Timezone"
              subtitle="Regional preferences"
              icon={<LanguageOutlinedIcon />}
              iconColor="#3B82F6"
              sx={{ mb: 3 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="settings-lang-label">Language</InputLabel>
                    <Select
                      labelId="settings-lang-label"
                      value={settings.language}
                      onChange={(event) => {
                        dispatch(updateSettings({ language: String(event.target.value) }));
                        showSuccess('Language updated');
                      }}
                      label="Language"
                    >
                      {LANGUAGES.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="settings-tz-label">Timezone</InputLabel>
                    <Select
                      labelId="settings-tz-label"
                      value={settings.timezone}
                      onChange={(event) => {
                        dispatch(updateSettings({ timezone: String(event.target.value) }));
                        showSuccess('Timezone updated');
                      }}
                      label="Timezone"
                    >
                      {TIMEZONES.map((option) => (
                        <MenuItem key={String(option.value)} value={String(option.value)}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </SettingsSection>
          </motion.div>

          {isOffline && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2.5 }}>
              Offline preview — changes are saved on this device and will sync when you're back
              online.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorSettingsPage;
