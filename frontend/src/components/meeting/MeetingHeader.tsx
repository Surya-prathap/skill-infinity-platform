import { motion } from 'framer-motion';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { CallTimer } from './CallTimer';
import { ConnectionBadge } from './ConnectionBadge';
import type { Meeting, ConnectionQuality, MeetingLayout } from '@/types';

interface MeetingHeaderProps {
  meeting: Meeting | null;
  startedAt: string | null;
  participantCount: number;
  quality: ConnectionQuality;
  latencyMs: number;
  layout: MeetingLayout;
  onLayoutChange: (layout: MeetingLayout) => void;
  controls: {
    chatOpen: boolean;
    participantsOpen: boolean;
    settingsOpen: boolean;
    statsOpen: boolean;
    unreadChat: number;
  };
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleSettings: () => void;
  onToggleStats: () => void;
  isPresenter: boolean;
}

const LAYOUT_OPTIONS: { value: MeetingLayout; label: string }[] = [
  { value: 'gallery', label: 'Gallery' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'compact', label: 'Compact' },
];

const glassButton = {
  color: 'rgba(255,255,255,0.92)',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(14px)',
} as const;

/** Top navigation bar for the meeting room. */
export const MeetingHeader = ({
  meeting,
  startedAt,
  participantCount,
  quality,
  latencyMs,
  layout,
  onLayoutChange,
  controls,
  onToggleChat,
  onToggleParticipants,
  onToggleSettings,
  onToggleStats,
  isPresenter,
}: MeetingHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: 'rgba(10,14,26,0.72)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        zIndex: 10,
        flexWrap: 'wrap',
      }}
    >
      {/* Title block */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1
            style={{
              margin: 0,
              fontSize: '0.98rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.96)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meeting?.title ?? 'Meeting'}
          </h1>
          {isPresenter && (
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#2DD4BF',
                background: 'rgba(45,212,191,0.12)',
                border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: 999,
                padding: '2px 8px',
              }}
            >
              Presenter
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <CallTimer startedAt={startedAt} />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.62)',
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 14 }} />
            {participantCount}
          </span>
          {meeting?.kind === 'session' && (
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 999,
                padding: '2px 9px',
              }}
            >
              Session meeting
            </span>
          )}
        </div>
      </div>

      {/* Connection */}
      <ConnectionBadge quality={quality} latencyMs={latencyMs} />

      {/* Layout switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: 3,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        role="group"
        aria-label="Layout switcher"
      >
        {LAYOUT_OPTIONS.map((option) => (
          <button
            key={option.value}
            aria-pressed={layout === option.value}
            onClick={() => onLayoutChange(option.value)}
            style={{
              border: 'none',
              cursor: 'pointer',
              borderRadius: 9,
              padding: '5px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: layout === option.value ? '#0B1220' : 'rgba(255,255,255,0.72)',
              background: layout === option.value ? '#8E80FF' : 'transparent',
              transition: 'all 160ms ease',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Panel toggles */}
      <div style={{ display: 'flex', gap: 6 }}>
        <Tooltip title="Participants">
          <IconButton
            aria-label="Toggle participants panel"
            onClick={onToggleParticipants}
            sx={{
              ...glassButton,
              '&:hover': { background: 'rgba(142,128,255,0.25)', transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <PeopleAltIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="In-meeting chat">
          <Badge color="error" badgeContent={controls.unreadChat} invisible={controls.unreadChat === 0}>
            <IconButton
              aria-label="Toggle meeting chat"
              onClick={onToggleChat}
              sx={{
                ...glassButton,
                '&:hover': { background: 'rgba(142,128,255,0.25)', transform: 'translateY(-1px)' },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Badge>
        </Tooltip>
        <Tooltip title="Call quality">
          <IconButton
            aria-label="Toggle call quality panel"
            onClick={onToggleStats}
            sx={{
              ...glassButton,
              '&:hover': { background: 'rgba(45,212,191,0.22)', transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <MonitorHeartIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Device settings">
          <IconButton
            aria-label="Toggle device settings"
            onClick={onToggleSettings}
            sx={{
              ...glassButton,
              '&:hover': { background: 'rgba(251,191,36,0.2)', transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(0.95)' },
            }}
          >
            <SettingsIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
      </div>
    </motion.header>
  );
};
