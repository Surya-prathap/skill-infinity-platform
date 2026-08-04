import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import PanToolIcon from '@mui/icons-material/PanTool';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { avatarFor, qualityColor, roleColor, roleLabel } from './meetingHelpers';
import type { MeetingParticipant } from '@/types';

interface ParticipantPanelProps {
  participants: MeetingParticipant[];
  onClose: () => void;
  onPin: (id: string | null) => void;
  pinnedId: string | null;
}

/** Sliding participant panel with live presence and management actions. */
export const ParticipantPanel = ({ participants, onClose, onPin, pinnedId }: ParticipantPanelProps) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return participants;
    return participants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(needle) || roleLabel[participant.role].toLowerCase().includes(needle),
    );
  }, [participants, query]);

  const hosts = filtered.filter((participant) => participant.role === 'HOST' || participant.role === 'MENTOR');
  const others = filtered.filter((participant) => participant.role !== 'HOST' && participant.role !== 'MENTOR');

  const renderRow = (participant: MeetingParticipant, index: number): React.ReactNode => (
    <motion.li
      key={participant.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={avatarFor(participant.id)}
          alt=""
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            objectFit: 'cover',
            border: participant.isSpeaking
              ? '2px solid #2DD4BF'
              : '2px solid rgba(255,255,255,0.14)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: participant.audioEnabled ? '#34D399' : '#EF4444',
            border: '2px solid #121A2B',
          }}
          aria-label={participant.audioEnabled ? 'Audio on' : 'Muted'}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.94)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {participant.name}
            {participant.isLocal && ' (You)'}
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: roleColor[participant.role],
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 999,
              padding: '1px 7px',
            }}
          >
            {roleLabel[participant.role]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: qualityColor[participant.connectionQuality],
              boxShadow: `0 0 6px ${qualityColor[participant.connectionQuality]}`,
            }}
          />
          <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.5)' }}>
            {participant.connectionQuality} quality
          </span>
          {participant.handRaised && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.66rem', color: '#FBBF24' }}>
              <PanToolIcon sx={{ fontSize: 12 }} /> hand raised
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {participant.screenSharing && (
          <Tooltip title="Sharing screen">
            <IconButton size="small" sx={{ color: '#2DD4BF' }} aria-label="Screen sharing">
              <PresentToAllIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={participant.audioEnabled ? 'Audio on' : 'Muted'}>
          <span>
            <IconButton size="small" sx={{ color: participant.audioEnabled ? 'rgba(255,255,255,0.6)' : '#F87171' }} aria-label="Audio status">
              {participant.audioEnabled ? <MicIcon sx={{ fontSize: 15 }} /> : <MicOffIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={participant.videoEnabled ? 'Camera on' : 'Camera off'}>
          <span>
            <IconButton size="small" sx={{ color: participant.videoEnabled ? 'rgba(255,255,255,0.6)' : '#F87171' }} aria-label="Camera status">
              {participant.videoEnabled ? <VideocamIcon sx={{ fontSize: 15 }} /> : <VideocamOffIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={participant.pinned ? 'Unpin' : 'Pin'}>
          <span>
            <IconButton
              size="small"
              onClick={() => onPin(participant.pinned ? null : participant.id)}
              sx={{ color: participant.pinned || pinnedId === participant.id ? '#8E80FF' : 'rgba(255,255,255,0.5)' }}
              aria-label={participant.pinned ? 'Unpin participant' : 'Pin participant'}
            >
              {participant.pinned || pinnedId === participant.id ? (
                <PushPinIcon sx={{ fontSize: 15 }} />
              ) : (
                <PushPinOutlinedIcon sx={{ fontSize: 15 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </motion.li>
  );

  const Section = ({ title, list }: { title: string; list: MeetingParticipant[] }) =>
    list.length > 0 ? (
      <div>
        <h4
          style={{
            margin: '14px 2px 8px',
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
          }}
        >
          {title} · {list.length}
        </h4>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {list.map((participant, index) => renderRow(participant, index))}
        </ul>
      </div>
    ) : null;

  return (
    <motion.aside
      data-testid="participant-panel"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      aria-label="Participants"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '88vw',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(13,19,34,0.92)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.4)',
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>
          Participants{' '}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{participants.length}</span>
        </h3>
        <button
          onClick={onClose}
          aria-label="Close participants panel"
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: 8,
            width: 30,
            height: 30,
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      </div>

      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search participants"
        size="small"
        aria-label="Search participants"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17 }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
            '& input': { color: 'rgba(255,255,255,0.92)', fontSize: '0.82rem' },
          },
        }}
      />

      <div style={{ flex: 1, overflowY: 'auto', marginTop: 4, paddingRight: 2 }}>
        <Section title="Mentors & hosts" list={hosts} />
        <Section title="Learners" list={others} />
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 32 }}>
            No participants match “{query}”
          </p>
        )}
      </div>
    </motion.aside>
  );
};
