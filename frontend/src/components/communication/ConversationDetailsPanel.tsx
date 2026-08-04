import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import { Avatar } from '@/components/ui';
import { Typography } from '@/components/ui/Typography';
import { formatRelativeTime, formatDateTime } from '@/utils';
import { PresenceBadge } from './PresenceBadge';
import { AttachmentPreview } from './AttachmentPreview';
import { CURRENT_USER_ID, seedParticipants } from '@/features/communication/data';
import { seedSessions } from '@/features/sessions/data';
import type { ChatMessage, Conversation, PresenceInfo } from '@/types';

interface ConversationDetailsPanelProps {
  conversation: Conversation;
  messages: ChatMessage[];
  presence: Record<string, PresenceInfo>;
  onClose: () => void;
  onPinnedMessageClick: (messageId: string) => void;
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  icon,
  title,
  children,
}) => (
  <Box sx={{ px: 2, py: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.secondary' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

/** Right rail — profile, presence, session info, shared files, participants, pinned. */
export const ConversationDetailsPanel: React.FC<ConversationDetailsPanelProps> = ({
  conversation,
  messages,
  presence,
  onClose,
  onPinnedMessageClick,
}) => {
  const isGroup = conversation.type === 'group' || conversation.type === 'session';
  const other = conversation.participants.find((participant) => participant.userId !== CURRENT_USER_ID);
  const otherPresence = other ? presence[other.userId] : null;
  const session = conversation.sessionId
    ? seedSessions.find((item) => item.id === conversation.sessionId)
    : undefined;

  const attachments = messages
    .filter((message) => !message.deleted)
    .flatMap((message) => message.attachments ?? []);
  const pinned = messages.filter((message) => message.pinned && !message.deleted);
  const mediaCount = attachments.filter(
    (attachment) => attachment.kind === 'image' || attachment.kind === 'video',
  ).length;

  const stats = [
    { label: 'Messages', value: messages.length },
    { label: 'Files', value: attachments.length },
    { label: 'Media', value: mediaCount },
    { label: 'Members', value: conversation.participants.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ flexGrow: 1 }}>
          Details
        </Typography>
        <IconButton size="small" aria-label="Close details" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
        {/* Profile / group header */}
        <Box sx={{ textAlign: 'center', px: 2, pb: 1.5 }}>
          {isGroup || conversation.avatarEmoji ? (
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.18)' : 'rgba(109,93,246,0.12)',
                border: '1px solid rgba(109,93,246,0.25)',
              }}
            >
              {conversation.avatarEmoji ?? '👥'}
            </Box>
          ) : (
            <Box sx={{ position: 'relative', width: 'fit-content', mx: 'auto' }}>
              <Avatar firstName={other?.firstName} lastName={other?.lastName} email={other?.email} size={72} sx={{ borderRadius: '22px' }} />
              {otherPresence && (
                <Box sx={{ position: 'absolute', bottom: 2, right: 2 }}>
                  <PresenceBadge status={otherPresence.status} size={13} showLabel={false} />
                </Box>
              )}
            </Box>
          )}
          <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
            {conversation.title ?? other?.name ?? 'Conversation'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {other?.headline ?? conversation.subtitle}
          </Typography>
          {otherPresence && (
            <Box sx={{ mt: 0.75, display: 'flex', justifyContent: 'center' }}>
              <PresenceBadge status={otherPresence.status} />
            </Box>
          )}
          {otherPresence?.customStatus && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              “{otherPresence.customStatus}”
            </Typography>
          )}
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.75,
            px: 2,
            mb: 1,
          }}
        >
          {stats.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                textAlign: 'center',
                py: 1,
                borderRadius: 2.5,
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* Session info */}
        {session && (
          <Section icon={<ScheduleOutlinedIcon sx={{ fontSize: 17 }} />} title="Current session">
            <Box sx={{ p: 1.5, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="body2" fontWeight={700}>
                {session.title ?? 'Session'}
              </Typography>
              {session.startTime && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {formatDateTime(session.startTime)}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {session.durationMinutes} minutes · {session.status.replaceAll('_', ' ')}
              </Typography>
            </Box>
          </Section>
        )}

        {other && (
          <Section icon={<LanguageOutlinedIcon sx={{ fontSize: 17 }} />} title="Profile">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Timezone</Typography>
                <Typography variant="body2" fontWeight={600}>{other.timezone ?? '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Last seen</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {otherPresence?.lastSeen ? formatRelativeTime(otherPresence.lastSeen) : otherPresence?.status === 'online' ? 'Right now' : '—'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Role</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {other.role === 'ROLE_MENTOR' ? 'Mentor' : other.role === 'ROLE_ADMIN' ? 'Admin' : 'Learner'}
                </Typography>
              </Box>
            </Box>
          </Section>
        )}

        <Divider />

        {/* Shared files */}
        <Section icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 17 }} />} title={`Shared files (${attachments.length})`}>
          {attachments.length === 0 ? (
            <Typography variant="body2" color="text.disabled">No files shared yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {attachments.slice(0, 8).map((attachment) => (
                <AttachmentPreview key={attachment.id} attachment={attachment} compact />
              ))}
            </Box>
          )}
        </Section>

        <Divider />

        {/* Participants */}
        <Section icon={<GroupsOutlinedIcon sx={{ fontSize: 17 }} />} title="Participants">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {conversation.participants.map((participant) => {
              const info = presence[participant.userId];
              return (
                <Box key={participant.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      firstName={seedParticipants[participant.userId]?.firstName ?? participant.firstName}
                      lastName={seedParticipants[participant.userId]?.lastName ?? participant.lastName}
                      email={participant.email}
                      size={34}
                    />
                    {info && (
                      <Box sx={{ position: 'absolute', bottom: -1, right: -1 }}>
                        <PresenceBadge status={info.status} size={9} showLabel={false} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {participant.name}
                      {participant.userId === CURRENT_USER_ID && (
                        <Box component="span" sx={{ color: 'primary.main', ml: 0.5 }}>(you)</Box>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {participant.role === 'ROLE_MENTOR' ? 'Mentor' : 'Learner'}
                      {participant.userId === CURRENT_USER_ID ? '' : info ? ` · ${info.status}` : ''}
                    </Typography>
                  </Box>
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </Box>
              );
            })}
          </Box>
        </Section>

        <Divider />

        {/* Pinned messages */}
        <Section icon={<PushPinOutlinedIcon sx={{ fontSize: 17 }} />} title={`Pinned messages (${pinned.length})`}>
          {pinned.length === 0 ? (
            <Typography variant="body2" color="text.disabled">No pinned messages yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {pinned.map((message) => (
                <Tooltip key={message.id} title="Jump to message">
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => onPinnedMessageClick(message.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onPinnedMessageClick(message.id);
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                    }}
                  >
                    <Typography variant="caption" fontWeight={700}>
                      {message.senderName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>
                      {message.kind === 'voice' ? '🎙️ Voice message' : message.content}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
            </Box>
          )}
        </Section>
      </Box>

      <Box sx={{ px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideoLibraryOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.disabled">
          Session started {formatRelativeTime(conversation.createdAt)}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default ConversationDetailsPanel;
