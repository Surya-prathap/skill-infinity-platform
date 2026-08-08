import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import { Avatar } from '@/components/ui';
import { Typography } from '@/components/ui/Typography';
import { PresenceBadge } from './PresenceBadge';
import { TypingIndicator } from './TypingIndicator';
import { useCurrentUserIdentity } from '@/hooks';
import type { Conversation, PresenceInfo } from '@/types';

interface ChatHeaderProps {
  conversation: Conversation;
  presence?: PresenceInfo | null;
  typingNames: string[];
  onBack: () => void;
  onSearchClick: () => void;
  onInfoClick: () => void;
  onCallClick: () => void;
  onVideoCallClick?: () => void;
  infoOpen: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  presence,
  typingNames,
  onBack,
  onSearchClick,
  onInfoClick,
  onCallClick,
  onVideoCallClick,
  infoOpen,
}) => {
  const { userId: currentUserId } = useCurrentUserIdentity();
  const isGroup = conversation.type === 'group' || conversation.type === 'session';
  const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
  const label =
    conversation.title ??
    other?.name ??
    conversation.participants.map((participant) => participant.name).join(', ') ??
    'Conversation';

  const statusLine = () => {
    if (typingNames.length > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TypingIndicator names={typingNames} />
        </Box>
      );
    }
    if (isGroup) {
      return (
        <Typography variant="caption" color="text.secondary">
          {conversation.subtitle ?? `${conversation.participants.length} members`}
        </Typography>
      );
    }
    if (presence) {
      if (presence.customStatus) {
        return (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 260 }}>
            {presence.customStatus}
          </Typography>
        );
      }
      return <PresenceBadge status={presence.status} />;
    }
    return (
      <Typography variant="caption" color="text.secondary">
        Conversation
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.25, sm: 2 },
        minHeight: 64,
        borderBottom: 1,
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(18,26,43,0.55)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <IconButton aria-label="Back to conversations" onClick={onBack} sx={{ display: { md: 'none' } }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        {isGroup || conversation.avatarEmoji ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              background: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.18)' : 'rgba(109,93,246,0.12)',
              border: '1px solid rgba(109,93,246,0.25)',
            }}
          >
            {conversation.avatarEmoji ?? '👥'}
          </Box>
        ) : (
          <Avatar firstName={other?.firstName} lastName={other?.lastName} email={other?.email} size={40} sx={{ borderRadius: '12px' }} />
        )}
        {!isGroup && presence && (
          <Box sx={{ position: 'absolute', bottom: -1, right: -1 }}>
            <PresenceBadge status={presence.status} size={10} showLabel={false} />
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={800} noWrap>
          {label}
        </Typography>
        <Box sx={{ minHeight: 18, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {statusLine()}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <Tooltip title="Search in conversation">
          <IconButton size="small" aria-label="Search in conversation" onClick={onSearchClick}>
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Voice call">
          <IconButton size="small" aria-label="Voice call" onClick={onCallClick}>
            <CallOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Video call">
          <IconButton size="small" aria-label="Video call" onClick={onVideoCallClick}>
            <VideocamOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Screen share">
          <IconButton size="small" aria-label="Screen share" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            <ScreenShareOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={infoOpen ? 'Hide details' : 'Show details'}>
          <IconButton size="small" aria-label="Conversation details" onClick={onInfoClick} color={infoOpen ? 'primary' : 'default'}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatHeader;
