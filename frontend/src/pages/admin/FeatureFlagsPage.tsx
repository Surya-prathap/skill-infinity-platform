import { useMemo, useState } from 'react';
import { Box, Chip, Grid, Switch, Tooltip } from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Stack as UiStack, Typography, Typography as UiTypography } from '@/components/ui';
import { AnimatedProgress, AdminTableSkeleton } from '@/components/admin';
import { formatRelativeTime } from '@/utils';
import { useAdminFeatureFlagsQuery, useUpdateFeatureFlagMutation } from '@/features/admin';
import type { FeatureFlag, FlagEnvironment } from '@/types';

const ENV_COLOR: Record<FlagEnvironment, 'success' | 'info' | 'warning'> = {
  production: 'success',
  staging: 'info',
  development: 'warning',
};

export const FeatureFlagsPage: React.FC = () => {
  useDocumentTitle('Feature Flags');
  const { flags, isLoading } = useAdminFeatureFlagsQuery();
  const updateFlag = useUpdateFeatureFlagMutation();
  const [environmentFilter, setEnvironmentFilter] = useState<FlagEnvironment | 'ALL'>('ALL');

  const filtered = useMemo(
    () => (environmentFilter === 'ALL' ? flags : flags.filter((flag) => flag.environment === environmentFilter)),
    [flags, environmentFilter],
  );

  const stats = useMemo(() => {
    const enabled = flags.filter((flag) => flag.enabled).length;
    const avgRollout = flags.length ? Math.round(flags.reduce((sum, flag) => sum + flag.rolloutPercentage, 0) / flags.length) : 0;
    return { total: flags.length, enabled, avgRollout };
  }, [flags]);

  const setFlag = (flag: FeatureFlag, patch: Partial<Pick<FeatureFlag, 'enabled' | 'rolloutPercentage'>>) => {
    updateFlag.mutate({
      featureKey: flag.featureKey,
      featureName: flag.featureName,
      description: flag.description,
      enabled: patch.enabled ?? flag.enabled,
      rolloutPercentage: patch.rolloutPercentage ?? flag.rolloutPercentage,
      environment: flag.environment,
    });
  };

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Feature Flags"
        subtitle="Roll out capabilities safely with percentage-based releases."
        actions={<Chip icon={<CloudDoneOutlinedIcon />} label={`${stats.enabled}/${stats.total} enabled`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total flags', value: stats.total, color: '#6D5DF6' },
          { label: 'Enabled', value: stats.enabled, color: '#10B981' },
          { label: 'Avg rollout', value: `${stats.avgRollout}%`, color: '#3B82F6' },
          { label: 'In production', value: flags.filter((flag) => flag.environment === 'production').length, color: '#A855F7' },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                {stat.label}
              </UiTypography>
              <UiTypography variant="h5" fontWeight={800} sx={{ color: stat.color }}>
                {stat.value}
              </UiTypography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        {(['ALL', 'production', 'staging', 'development'] as const).map((environment) => (
          <Chip
            key={environment}
            label={environment === 'ALL' ? `All (${flags.length})` : environment}
            onClick={() => setEnvironmentFilter(environment)}
            color={environmentFilter === environment ? 'primary' : 'default'}
            variant={environmentFilter === environment ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
          />
        ))}
      </Stack>

      <Grid container spacing={3}>
        {filtered.map((flag) => (
          <Grid key={flag.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card hoverable sx={{ p: 2.5, height: '100%' }}>
              <UiStack direction="row" alignItems="flex-start" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: flag.enabled ? '#fff' : 'text.secondary',
                    background: flag.enabled ? 'linear-gradient(135deg, #6D5DF6, #14B8A6)' : 'action.hover',
                    boxShadow: flag.enabled ? '0 6px 16px rgba(109,93,246,0.35)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  <FlagOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <UiStack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" fontWeight={800} noWrap>
                      {flag.featureName}
                    </Typography>
                    <Chip size="small" label={flag.environment} color={ENV_COLOR[flag.environment]} sx={{ height: 20, fontWeight: 800, textTransform: 'capitalize' }} />
                  </UiStack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    {flag.featureKey}
                  </Typography>
                </Box>
                <Tooltip title={flag.enabled ? 'Disable feature' : 'Enable feature'}>
                  <Switch
                    checked={flag.enabled}
                    onChange={(event) => setFlag(flag, { enabled: event.target.checked })}
                    aria-label={`Toggle ${flag.featureName}`}
                  />
                </Tooltip>
              </UiStack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2, lineHeight: 1.6 }}>
                {flag.description}
              </Typography>

              <Stack spacing={0.5} direction="row" alignItems="center" sx={{ mb: 1.5 }}>
                <BoltOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <AnimatedProgress
                  value={flag.rolloutPercentage}
                  label="Rollout"
                  suffix="%"
                  height={6}
                  color={flag.enabled ? '#6D5DF6' : '#94A3B8'}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={flag.rolloutPercentage}
                  aria-label={`${flag.featureName} rollout percentage`}
                  onChange={(event) => setFlag(flag, { rolloutPercentage: Number(event.target.value) })}
                  style={{ width: 120, accentColor: '#6D5DF6' }}
                />
              </Stack>

              <Typography variant="caption" color="text.disabled">
                Updated {formatRelativeTime(flag.updatedAt)}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeatureFlagsPage;
