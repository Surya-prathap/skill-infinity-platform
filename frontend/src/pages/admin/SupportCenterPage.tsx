import { useMemo, useState } from 'react';
import { Box, Chip, Grid, IconButton, TextField, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Avatar, AppDrawer, Stack, Typography, Typography as UiTypography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminTableSkeleton } from '@/components/admin';
import { formatDateTime, formatRelativeTime } from '@/utils';
import { useAdminSupportQuery, useSupportReplyMutation } from '@/features/admin';
import type { SupportTicket, TicketPriority, TicketStatus } from '@/types';

const PRIORITY_COLOR: Record<TicketPriority, 'success' | 'info' | 'warning' | 'error'> = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'error',
};

const STATUS_COLOR: Record<TicketStatus, 'success' | 'info' | 'warning' | 'default'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export const SupportCenterPage: React.FC = () => {
  useDocumentTitle('Support Center');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const { tickets, isLoading } = useAdminSupportQuery(statusFilter === 'ALL' ? undefined : statusFilter);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [draft, setDraft] = useState('');
  const replyMutation = useSupportReplyMutation(selected?.id ?? 'none');

  const stats = useMemo(
    () => [
      { label: 'Open', value: tickets.filter((t) => t.status === 'OPEN').length, icon: <SupportAgentOutlinedIcon />, color: '#F59E0B' },
      { label: 'In progress', value: tickets.filter((t) => t.status === 'IN_PROGRESS').length, icon: <MarkEmailReadOutlinedIcon />, color: '#3B82F6' },
      { label: 'Resolved', value: tickets.filter((t) => t.status === 'RESOLVED').length, icon: <TaskAltOutlinedIcon />, color: '#10B981' },
      { label: 'Closed', value: tickets.filter((t) => t.status === 'CLOSED').length, icon: <LockClockOutlinedIcon />, color: '#64748B' },
    ],
    [tickets],
  );

  const criticalCount = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  if (isLoading) return <AdminTableSkeleton />;

  const openTicket = (ticket: SupportTicket) => {
    setSelected(ticket);
    setDraft('');
  };

  const sendReply = () => {
    if (!selected || draft.trim().length === 0) return;
    replyMutation.mutate(draft.trim());
    setDraft('');
  };

  return (
    <Box>
      <PageHeader
        title="Support Center"
        subtitle="Tickets, priorities, timelines and responses."
        actions={
          criticalCount > 0 ? (
            <Chip icon={<PriorityHighOutlinedIcon />} label={`${criticalCount} critical`} color="error" sx={{ fontWeight: 700 }} />
          ) : (
            <StatusBadge label="All tickets handled" color="success" />
          )
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    boxShadow: `0 6px 14px ${stat.color}3D`,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                    {stat.label}
                  </UiTypography>
                  <UiTypography variant="subtitle1" fontWeight={800}>
                    {stat.value}
                  </UiTypography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
          <Chip
            key={status}
            label={status === 'ALL' ? `All (${tickets.length})` : status.replace('_', ' ')}
            onClick={() => setStatusFilter(status)}
            color={statusFilter === status ? 'primary' : 'default'}
            variant={statusFilter === status ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
          />
        ))}
      </Stack>

      <Grid container spacing={3}>
        {tickets.map((ticket, index) => (
          <Grid key={ticket.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              style={{ height: '100%' }}
            >
              <Box
                onClick={() => openTicket(ticket)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === 'Enter' && openTicket(ticket)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <Avatar name={ticket.userName} size={36} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {ticket.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {ticket.userName} · {ticket.category}
                    </Typography>
                  </Box>
                  <Chip size="small" label={ticket.priority} color={PRIORITY_COLOR[ticket.priority]} sx={{ fontWeight: 800 }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                  {ticket.description}
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <StatusBadge label={ticket.status.replace('_', ' ')} color={STATUS_COLOR[ticket.status]} />
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(ticket.createdAt)} · {ticket.replies.length} replies
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Ticket detail drawer */}
      <AppDrawer open={selected !== null} onClose={() => setSelected(null)} title="Ticket Timeline" width={460}>
        <AnimatePresence>
          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
                  {selected.subject}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip size="small" label={selected.priority} color={PRIORITY_COLOR[selected.priority]} sx={{ fontWeight: 800 }} />
                  <StatusBadge label={selected.status.replace('_', ' ')} color={STATUS_COLOR[selected.status]} />
                  {selected.assignedTo && <Chip size="small" label={`Assigned: ${selected.assignedTo}`} variant="outlined" />}
                </Stack>

                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    {selected.userName} · {formatDateTime(selected.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                    {selected.description}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {selected.replies.map((reply) => {
                    const isAdmin = reply.senderType === 'ADMIN';
                    return (
                      <Stack key={reply.id} spacing={0.5} alignItems={isAdmin ? 'flex-end' : 'flex-start'}>
                        <Box
                          sx={{
                            maxWidth: '90%',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: isAdmin ? 'primary.main' : 'background.paper',
                            color: isAdmin ? '#fff' : 'text.primary',
                            border: isAdmin ? 'none' : 1,
                            borderColor: 'divider',
                            opacity: reply.internal ? 0.6 : 1,
                          }}
                        >
                          <Typography variant="caption" fontWeight={700} sx={{ mb: 0.25, opacity: 0.85, display: 'block' }}>
                            {isAdmin ? 'Support Team' : reply.senderName}
                            {reply.internal ? ' · internal' : ''}
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {reply.message}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(reply.createdAt)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Reply as support team…"
                    aria-label="Reply to ticket"
                  />
                  <Tooltip title="Send reply">
                    <IconButton
                      color="primary"
                      onClick={sendReply}
                      disabled={draft.trim().length === 0 || replyMutation.isPending}
                      aria-label="Send reply"
                    >
                      <SendOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </AppDrawer>
    </Box>
  );
};

export default SupportCenterPage;
