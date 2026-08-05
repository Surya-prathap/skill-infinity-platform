import { useState } from 'react';
import { Box, Button, Chip, Grid } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Stack as UiStack, Typography } from '@/components/ui';
import { DashboardWidget, AdminTableSkeleton } from '@/components/admin';
import { formatDate, formatRelativeTime, showSuccess } from '@/utils';
import { useAdminReportsQuery } from '@/features/admin';
import type { ReportDefinition, ReportFormat } from '@/types';

const FORMATS: ReportFormat[] = ['CSV', 'EXCEL', 'PDF'];

export const ReportsPage: React.FC = () => {
  useDocumentTitle('Reports');
  const { reports, isLoading } = useAdminReportsQuery();
  const [generating, setGenerating] = useState<string | null>(null);

  const generate = (report: ReportDefinition) => {
    setGenerating(report.id);
    window.setTimeout(() => {
      setGenerating(null);
      showSuccess(`${report.title} generated — download started`);
    }, 1200);
  };

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Reports"
        subtitle="Generate, download and schedule platform reports."
        actions={<Chip icon={<DescriptionOutlinedIcon />} label={`${reports.length} report types`} variant="outlined" sx={{ fontWeight: 700 }} />}
      />

      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid key={report.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              style={{ height: '100%' }}
            >
              <Card hoverable sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      bgcolor: 'action.selected',
                    }}
                  >
                    {report.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {report.title}
                    </Typography>
                    <Chip size="small" label={report.category} variant="outlined" sx={{ height: 20, fontWeight: 700 }} />
                  </Box>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
                  {report.description}
                </Typography>

                <UiStack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {report.lastGeneratedAt ? `Generated ${formatRelativeTime(report.lastGeneratedAt)}` : 'Never generated'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.downloadCount} downloads
                  </Typography>
                </UiStack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FileDownloadOutlinedIcon />}
                    disabled={generating === report.id}
                    onClick={() => generate(report)}
                    sx={{ flex: 1 }}
                  >
                    {generating === report.id ? 'Generating…' : 'Generate'}
                  </Button>
                </Stack>

                <AnimatePresence>
                  {generating === report.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {FORMATS.map((format) => (
                          <Button
                            key={format}
                            size="small"
                            variant="outlined"
                            onClick={() => showSuccess(`${report.title} downloaded as ${format}`)}
                            sx={{ flex: 1, fontSize: '0.7rem' }}
                          >
                            {format}
                          </Button>
                        ))}
                      </Stack>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DashboardWidget title="Schedule" subtitle="Automated delivery" index={0}>
            <UiStack spacing={1.5}>
              {[
                { report: 'Revenue Report', schedule: 'Every Monday 06:00 UTC', recipients: 'finance@skillinfinity.com', active: true },
                { report: 'User Report', schedule: '1st of every month', recipients: 'growth@skillinfinity.com', active: true },
                { report: 'Community Report', schedule: 'Weekly · Sundays', recipients: 'community@skillinfinity.com', active: false },
                { report: 'Support Report', schedule: 'Daily 18:00 UTC', recipients: 'support-leads@skillinfinity.com', active: true },
              ].map((item) => (
                <Box key={item.report} sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  <UiStack direction="row" alignItems="center" spacing={1.5}>
                    <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: item.active ? 'success.main' : 'text.disabled' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {item.report}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.schedule} → {item.recipients}
                      </Typography>
                    </Box>
                    <Chip size="small" label={item.active ? 'Active' : 'Paused'} color={item.active ? 'success' : 'default'} variant="outlined" sx={{ fontWeight: 700 }} />
                  </UiStack>
                </Box>
              ))}
            </UiStack>
          </DashboardWidget>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardWidget title="Report Health" subtitle="Delivery reliability" index={1}>
            <UiStack spacing={1.5}>
              {[
                { label: 'Generated last 7 days', value: '23 reports' },
                { label: 'Success rate', value: '99.2%' },
                { label: 'Avg. generation time', value: '4.2 seconds' },
                { label: 'Scheduled jobs', value: '4 active / 1 paused' },
                { label: 'Next scheduled run', value: formatDate(new Date().toISOString()) },
              ].map((item) => (
                <UiStack key={item.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={800}>
                    {item.value}
                  </Typography>
                </UiStack>
              ))}
            </UiStack>
          </DashboardWidget>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
