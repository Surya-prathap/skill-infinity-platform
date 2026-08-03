import { useState } from 'react';
import { Box, Button, Divider, FormControlLabel, Grid, MenuItem, Switch, TextField } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Card, ConfirmDialog, PageHeader } from '@/components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectSettings } from '@/store/selectors';
import { resetSettings, updateSettings } from '@/store/slices/settingsSlice';
import { useDocumentTitle } from '@/hooks';
import { showInfo, showSuccess } from '@/utils';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
];

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Settings');
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const togglePreference = (key: keyof typeof settings) => {
    dispatch(updateSettings({ [key]: !settings[key] }));
    showSuccess('Preference updated');
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Customize your experience and preferences." />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Preferences
            </Typography>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Language"
                value={settings.language}
                onChange={(event) => dispatch(updateSettings({ language: event.target.value }))}
                helperText="i18n architecture — translations ship later."
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                size="small"
                label="Timezone"
                value={settings.timezone}
                onChange={(event) => dispatch(updateSettings({ timezone: event.target.value }))}
                helperText="Used for session scheduling."
              />
              <Divider />
              <FormControlLabel
                control={<Switch checked={settings.emailNotifications} onChange={() => togglePreference('emailNotifications')} />}
                label="Email notifications"
              />
              <FormControlLabel
                control={<Switch checked={settings.pushNotifications} onChange={() => togglePreference('pushNotifications')} />}
                label="Push notifications"
              />
              <FormControlLabel
                control={<Switch checked={settings.sessionReminders} onChange={() => togglePreference('sessionReminders')} />}
                label="Session reminders"
              />
              <FormControlLabel
                control={<Switch checked={settings.marketingEmails} onChange={() => togglePreference('marketingEmails')} />}
                label="Product & marketing emails"
              />
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Security
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage your password and account security.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </Card>

            <Card sx={{ p: 3, borderColor: 'error.main' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="error">
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Reset all preferences to their default values.
              </Typography>
              <Button variant="outlined" color="error" onClick={() => setConfirmResetOpen(true)}>
                Reset Preferences
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset all preferences?"
        message="This will restore your settings to their defaults. This action cannot be undone."
        confirmText="Reset"
        variant="danger"
        onCancel={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          dispatch(resetSettings());
          setConfirmResetOpen(false);
          showSuccess('Preferences reset to defaults');
        }}
      />

      <ConfirmDialog
        open={changePasswordOpen}
        title="Change password"
        message="Password change arrives with the User Portal on Day 12 — no architectural changes required."
        confirmText="OK"
        onCancel={() => setChangePasswordOpen(false)}
        onConfirm={() => {
          setChangePasswordOpen(false);
          showInfo('Password change ships with the User Portal on Day 12 — no architectural changes required.');
        }}
      />
    </Box>
  );
};

export default SettingsPage;
