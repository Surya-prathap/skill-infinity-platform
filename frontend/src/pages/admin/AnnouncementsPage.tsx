import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, TextField } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Stack as UiStack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardWidget, AdminTableSkeleton } from '@/components/admin';
import { formatDateTime, formatRelativeTime } from '@/utils';
import { useAdminAnnouncementsQuery, useCreateAnnouncementMutation } from '@/features/admin';
import type { AnnouncementPriority, AnnouncementTemplate, SystemAnnouncement } from '@/types';

const PRIORITY_COLOR: Record<AnnouncementPriority, 'success' | 'info' | 'warning' | 'error'> = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
};

const STATUS_COLOR: Record<SystemAnnouncement['status'], 'success' | 'info' | 'warning' | 'default'> = {
  PUBLISHED: 'success',
  SCHEDULED: 'info',
  DRAFT: 'warning',
  EXPIRED: 'default',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  announcementType: 'FEATURE',
  targetRole: 'ALL',
  priority: 'MEDIUM' as AnnouncementPriority,
};

export const AnnouncementsPage: React.FC = () => {
  useDocumentTitle('Announcements');
  const { announcements, templates, isLoading } = useAdminAnnouncementsQuery();
  const createMutation = useCreateAnnouncementMutation();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showPreview, setShowPreview] = useState(false);

  const applyTemplate = (template: AnnouncementTemplate) => {
    setForm({
      title: template.title,
      content: template.content,
      announcementType: template.type,
      targetRole: template.targetRole,
      priority: template.priority,
    });
  };

  const publish = () => {
    if (form.title.trim().length === 0 || form.content.trim().length === 0) return;
    createMutation.mutate({ ...form, scheduledAt: undefined, expiresAt: undefined });
    setForm({ ...EMPTY_FORM });
  };

  const valid = form.title.trim().length > 0 && form.content.trim().length > 0;

  const preview = useMemo(
    () => ({
      title: form.title || 'Announcement title',
      content: form.content || 'Announcement content will appear here…',
      priority: form.priority,
      targetRole: form.targetRole,
    }),
    [form],
  );

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader title="Announcements" subtitle="Build, schedule and broadcast system-wide announcements." />

      <Grid container spacing={3}>
        {/* Builder */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Announcement Builder
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Title"
                fullWidth
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="e.g. Scheduled maintenance on Saturday"
                required
              />
              <TextField
                label="Content"
                fullWidth
                multiline
                minRows={5}
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
                placeholder="Write the announcement message…"
                required
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Type"
                    fullWidth
                    value={form.announcementType}
                    onChange={(event) => setForm({ ...form, announcementType: event.target.value })}
                    slotProps={{ select: { native: true } }}
                  >
                    {['FEATURE', 'MAINTENANCE', 'POLICY', 'PRODUCT', 'INCIDENT'].map((type) => (
                      <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Target audience"
                    fullWidth
                    value={form.targetRole}
                    onChange={(event) => setForm({ ...form, targetRole: event.target.value })}
                    slotProps={{ select: { native: true } }}
                  >
                    {['ALL', 'ROLE_LEARNER', 'ROLE_MENTOR', 'ROLE_ADMIN'].map((role) => (
                      <option key={role} value={role}>
                        {role === 'ALL' ? 'Everyone' : role.replace('ROLE_', '').toLowerCase()}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Priority"
                    fullWidth
                    value={form.priority}
                    onChange={(event) => setForm({ ...form, priority: event.target.value as AnnouncementPriority })}
                    slotProps={{ select: { native: true } }}
                  >
                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Schedule for (optional)" type="datetime-local" fullWidth slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                <Button variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => setShowPreview((current) => !current)}>
                  {showPreview ? 'Hide preview' : 'Preview'}
                </Button>
                <Button variant="contained" startIcon={<SendOutlinedIcon />} disabled={!valid || createMutation.isPending} onClick={publish} sx={{ ml: 'auto' }}>
                  {createMutation.isPending ? 'Broadcasting…' : 'Broadcast announcement'}
                </Button>
              </Stack>
            </Stack>
          </Card>

          {showPreview && (
            <Card sx={{ p: 3, mt: 3, border: 1, borderColor: 'primary.main' }}>
              <UiStack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Live Preview
                </Typography>
                <Chip size="small" label={preview.priority} color={PRIORITY_COLOR[preview.priority]} sx={{ fontWeight: 800 }} />
              </UiStack>
              <Typography variant="h6" fontWeight={800}>
                {preview.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                {preview.content}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
                Audience: {preview.targetRole === 'ALL' ? 'Everyone' : preview.targetRole} · {preview.priority.toLowerCase()} priority
              </Typography>
            </Card>
          )}

          {/* History */}
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Broadcast History ({announcements.length})
            </Typography>
            <Stack spacing={2}>
              {announcements.map((announcement) => (
                <Box key={announcement.id} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <UiStack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography variant="body2" fontWeight={700}>
                      {announcement.title}
                    </Typography>
                    <StatusBadge label={announcement.status} color={STATUS_COLOR[announcement.status]} />
                  </UiStack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                    {announcement.content}
                  </Typography>
                  <UiStack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip size="small" label={announcement.announcementType} variant="outlined" sx={{ fontWeight: 700 }} />
                    <Chip size="small" label={announcement.priority} color={PRIORITY_COLOR[announcement.priority]} sx={{ fontWeight: 800 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {announcement.publishedAt ? formatDateTime(announcement.publishedAt) : formatRelativeTime(announcement.createdAt)}
                    </Typography>
                  </UiStack>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Templates */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardWidget title="Announcement Templates" subtitle="Start from a proven format" icon={<AutoAwesomeOutlinedIcon />}>
            <Stack spacing={1.5}>
              {templates.map((template) => (
                <Box
                  key={template.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => applyTemplate(template)}
                  onKeyDown={(event) => event.key === 'Enter' && applyTemplate(template)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                  }}
                >
                  <UiStack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {template.name}
                    </Typography>
                    <Chip size="small" label={template.type} color={PRIORITY_COLOR[template.priority]} variant="outlined" sx={{ fontWeight: 700 }} />
                  </UiStack>
                  <Typography variant="caption" color="text.secondary">
                    {template.description}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </DashboardWidget>

          <DashboardWidget title="Tips" subtitle="Effective communication" icon={<CampaignOutlinedIcon />} index={1} sx={{ mt: 3 }}>
            <Stack spacing={1}>
              {[
                'Use maintenance notices for planned downtime — always include a time window.',
                'Feature launches should link to documentation for self-serve learning.',
                'Mark urgent security updates with URGENT priority so they surface first.',
                'Schedule announcements during business hours for maximum reach.',
              ].map((tip) => (
                <Typography key={tip} variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  • {tip}
                </Typography>
              ))}
            </Stack>
          </DashboardWidget>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnnouncementsPage;
