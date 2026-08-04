import { motion } from 'framer-motion';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import PanToolIcon from '@mui/icons-material/PanTool';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import CallEndIcon from '@mui/icons-material/CallEnd';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import type { MeetingControls as Controls } from '@/store/slices/meetingSlice';

interface MeetingControlsProps {
  controls: Controls;
  isHost: boolean;
  isScreenSharing: boolean;
  unreadChat: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onToggleReactions: () => void;
  onToggleHand: () => void;
  onToggleRecording: () => void;
  onToggleCaptions: () => void;
  onTogglePip: () => void;
  onLeave: () => void;
}

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  accent?: string;
  children: React.ReactNode;
  badge?: number;
  activeWhenOn?: boolean;
  style?: React.CSSProperties;
}

const ControlButton = ({ label, onClick, active, danger, accent, children, badge, activeWhenOn = true, style }: ControlButtonProps) => {
  const isActive = activeWhenOn ? active : !active;
  return (
    <Tooltip title={label} placement="top">
      <motion.button
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        aria-label={label}
        onClick={onClick}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '50%',
          cursor: 'pointer',
          color: isActive ? '#0B1220' : 'rgba(255,255,255,0.94)',
          background: danger
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : isActive
              ? accent ?? '#8E80FF'
              : 'rgba(255,255,255,0.1)',
          boxShadow: danger
            ? '0 6px 20px rgba(239,68,68,0.45)'
            : isActive
              ? `0 6px 20px ${alpha(accent ?? '#8E80FF', 0.45)}`
              : '0 4px 14px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(14px)',
          border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.14)',
          transition: 'transform 120ms ease, box-shadow 200ms ease, background 200ms ease',
          ...(style ?? {}),
        }}
      >
        {children}
        {badge !== undefined && badge > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              borderRadius: 999,
              background: '#EF4444',
              color: '#fff',
              fontSize: '0.66rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {badge}
          </span>
        )}
      </motion.button>
    </Tooltip>
  );
};

/** Floating glass control bar — the signature meeting UI element. */
export const MeetingControls = ({
  controls,
  isHost,
  isScreenSharing,
  unreadChat,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleParticipants,
  onToggleChat,
  onToggleReactions,
  onToggleHand,
  onToggleRecording,
  onToggleCaptions,
  onTogglePip,
  onLeave,
}: MeetingControlsProps) => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.15 }}
      style={{
        position: 'absolute',
        bottom: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'rgba(10,14,26,0.78)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
        zIndex: 20,
        maxWidth: 'calc(100vw - 32px)',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <ControlButton label={controls.micOn ? 'Mute' : 'Unmute'} active={controls.micOn} onClick={onToggleMic}>
        {controls.micOn ? <MicIcon sx={{ fontSize: 22 }} /> : <MicOffIcon sx={{ fontSize: 22 }} />}
      </ControlButton>

      <ControlButton
          label={controls.camOn ? 'Turn camera off' : 'Turn camera on'}
          active={controls.camOn}
          onClick={onToggleCamera}>
        {controls.camOn ? <VideocamIcon sx={{ fontSize: 22 }} /> : <VideocamOffIcon sx={{ fontSize: 22 }} />}
      </ControlButton>

      <ControlButton
        label={isScreenSharing ? 'Stop presenting' : 'Present screen'}
        active={isScreenSharing}
        accent="#2DD4BF"
        onClick={onToggleScreenShare}
      >
        {isScreenSharing ? <StopScreenShareIcon sx={{ fontSize: 21 }} /> : <PresentToAllIcon sx={{ fontSize: 21 }} />}
      </ControlButton>

      <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />

      <ControlButton label="Participants" active={controls.participantsOpen} activeWhenOn={false} onClick={onToggleParticipants}>
        <PeopleAltIcon sx={{ fontSize: 22 }} />
      </ControlButton>

      <ControlButton label="Chat" active={controls.chatOpen} activeWhenOn={false} onClick={onToggleChat} badge={unreadChat}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 21 }} />
      </ControlButton>

      <ControlButton label="Reactions" active={controls.reactionsOpen} activeWhenOn={false} accent="#FBBF24" onClick={onToggleReactions}>
        <EmojiEmotionsIcon sx={{ fontSize: 22 }} />
      </ControlButton>

      <ControlButton
        label={controls.handRaised ? 'Lower hand' : 'Raise hand'}
        active={controls.handRaised}
        accent="#FBBF24"
        onClick={onToggleHand}
      >
        {controls.handRaised ? <PanToolIcon sx={{ fontSize: 22 }} /> : <PanToolOutlinedIcon sx={{ fontSize: 22 }} />}
      </ControlButton>

      <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />

      {isHost && (
        <ControlButton
          label={controls.recording ? 'Stop recording' : 'Record'}
          active={controls.recording}
          accent="#EF4444"
          onClick={onToggleRecording}
        >
          <FiberManualRecordIcon sx={{ fontSize: 21 }} />
        </ControlButton>
      )}

      <ControlButton
        label={controls.captionsOn ? 'Turn captions off' : 'Live captions'}
        active={controls.captionsOn}
        accent="#60A5FA"
        onClick={onToggleCaptions}
      >
        <SubtitlesIcon sx={{ fontSize: 21 }} />
      </ControlButton>

      <ControlButton label="Picture-in-picture" active={controls.pip} activeWhenOn={false} accent="#A99CFF" onClick={onTogglePip}>
        <PictureInPictureAltIcon sx={{ fontSize: 21 }} />
      </ControlButton>

      <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />

      <ControlButton label="Leave meeting" danger onClick={onLeave}>
        <CallEndIcon sx={{ fontSize: 22 }} />
      </ControlButton>
    </motion.div>
  );
};
