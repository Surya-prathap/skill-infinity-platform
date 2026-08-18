import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Switch, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Stack as UiStack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminTableSkeleton } from '@/components/admin';
import { showSuccess } from '@/utils';
import { useAdminSettingsQuery, useUpdateSettingMutation } from '@/features/admin';
import type { PlatformSetting } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  platform: 'Platform',
  authentication: 'Authentication',
  registration: 'Registration',
  payments: 'Payments',
  wallet: 'Wallet',
  notifications: 'Notifications',
  mentors: 'Mentors',
  sessions: 'Sessions',
};

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Platform Settings');
  const { settings, isLoading } = useAdminSettingsQuery();
  const updateSetting = useUpdateSettingMutation();

  const categories = useMemo(() => {
    const map = new Map<string, PlatformSetting[]>();
    settings.forEach((setting) => {
      const list = map.get(setting.category) ?? [];
      list.push(setting);
      map.set(setting.category, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [settings]);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.[0] ?? 'platform');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const activeSettings = categories.find(([key]) => key === activeCategory)?.[1] ?? [];

  if (isLoading) return <AdminTableSkeleton />;

  const getValue = (setting: PlatformSetting) =>
    drafts[setting.settingKey] ?? setting.settingValue;

  const setValue = (setting: PlatformSetting, value: string) =>
    setDrafts((current) => ({ ...current, [setting.settingKey]: value }));

  const saveAll = () => {
    activeSettings.forEach((setting) => {
      const value = getValue(setting);
      if (value !== setting.settingValue) {
        updateSetting.mutate({
          settingKey: setting.settingKey,
          settingValue: value,
          dataType: setting.dataType,
          description: setting.description,
          category: setting.category,
        });
      }
    });
    setDrafts({});
    showSuccess('Settings saved');
  };

  const maintenance = settings.find((s) => s.settingKey === 'platform.maintenance_mode');

  return (
    <Box>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure platform-wide behavior, security and feature policies."
        actions={
          maintenance ? (
            <StatusBadge
              label={maintenance.settingValue === 'true' ? 'Maintenance mode ON' : 'Live'}
              color={maintenance.settingValue === 'true' ? 'warning' : 'success'}
            />
          ) : undefined
        }
      />

      <Grid container spacing={3}>
        {/* Category nav */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 1.5 }}>
            <Tabs
              orientation="vertical"
              value={activeCategory}
              onChange={(_, next) => setActiveCategory(next)}
              sx={{ borderRight: 0, '& .MuiTab-root': { alignItems: 'flex-start', px: 1.5, minHeight: 44 } }}
              aria-label="Settings categories"
            >
              {categories.map(([key]) => (
                <Tab
                  key={key}
                  value={key}
                  label={
                    <UiStack direction="row" alignItems="center" spacing={1}>
                      {key === 'platform' ? <DnsOutlinedIcon sx={{ fontSize: 18 }} /> : <LockOutlinedIcon sx={{ fontSize: 18 }} />}
                      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {CATEGORY_LABELS[key] ?? key}
                      </Typography>
                    </UiStack>
                  }
                />
              ))}
            </Tabs>
          </Card>
        </Grid>

        {/* Settings panel */}
        <Grid size={{ xs: 12, md: 9 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ p: 3 }}>
                <UiStack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ textTransform: 'capitalize' }}>
                      {CATEGORY_LABELS[activeCategory] ?? activeCategory}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeSettings.length} configuration keys
                    </Typography>
                  </Box>
                  <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={saveAll} disabled={updateSetting.isPending}>
                    Save changes
                  </Button>
                </UiStack>

                <Stack spacing={1.5}>
                  {activeSettings.map((setting) => {
                    const isDirty = getValue(setting) !== setting.settingValue;
                    return (
                      <Box
                        key={setting.settingKey}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 1,
                          borderColor: isDirty ? 'primary.main' : 'divider',
                          bgcolor: isDirty ? 'action.selected' : 'transparent',
                          transition: 'border-color 0.2s ease, background-color 0.2s ease',
                        }}
                      >
                        <UiStack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <UiStack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                                {setting.settingKey}
                              </Typography>
                              {setting.encrypted && (
                                <Tooltip title="Encrypted value">
                                  <Chip size="small" icon={<LockOutlinedIcon />} label="encrypted" variant="outlined" sx={{ height: 20, fontWeight: 700 }} />
                                </Tooltip>
                              )}
                              {isDirty && <Chip size="small" label="unsaved" color="primary" sx={{ height: 20, fontWeight: 700 }} />}
                            </UiStack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
                              {setting.description}
                            </Typography>
                          </Box>

                          {setting.dataType === 'BOOLEAN' ? (
                            <Switch
                              checked={getValue(setting) === 'true'}
                              onChange={(event) => setValue(setting, String(event.target.checked))}
                              slotProps={{ input: { 'aria-label': setting.settingKey } }}
                            />
                          ) : (
                            <TextField
                              size="small"
                              value={getValue(setting)}
                              onChange={(event) => setValue(setting, event.target.value)}
                              sx={{ width: { xs: 140, sm: 220 } }}
                              slotProps={{ htmlInput: { 'aria-label': setting.settingKey } }}
                            />
                          )}
                        </UiStack>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;
