import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import PanToolIcon from '@mui/icons-material/PanTool';
import PushPinIcon from '@mui/icons-material/PushPin';
import { alpha } from '@mui/material/styles';
import { avatarFor, initialsOf, qualityColor, roleColor, roleLabel } from './meetingHelpers';
import type { MeetingParticipant } from '@/types';

interface ParticipantTileProps {
  participant: MeetingParticipant;
  stream?: MediaStream | null;
  isScreenPreview?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onPin?: (id: string | null) => void;
}

/** Premium video / avatar tile with speaking ring, badges and hover actions. */
export const ParticipantTile = memo(
  ({ participant, stream, isScreenPreview = false, showName = true, size = 'md',    onPin }: ParticipantTileProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const hasVideo = participant.videoEnabled && Boolean(stream) && !participant.screenSharing && !isScreenPreview;
    const hasScreen = participant.screenSharing || isScreenPreview;
    const isSpeaking = participant.isSpeaking;
    const muted = !participant.audioEnabled;
    const quality = qualityColor[participant.connectionQuality];

    useEffect(() => {
      const video = videoRef.current;
      if (video && stream) {
        video.srcObject = stream;
        video.play().catch(() => undefined);
      }
      return () => {
        if (video) video.srcObject = null;
      };
    }, [stream]);

    const speakingPulse = isSpeaking && !muted;

    return (
      <motion.div
        layout
        data-testid="participant-tile"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onDoubleClick={() => onPin?.(participant.pinned ? null : participant.id)}
        style={{
          position: 'relative',
          borderRadius: 18,
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #141C2F 0%, #0D1322 100%)',
          border: speakingPulse
            ? `2px solid ${alpha('#2DD4BF', 0.9)}`
            : participant.pinned
              ? '2px solid rgba(142,128,255,0.85)'
              : '1px solid rgba(255,255,255,0.08)',
          boxShadow: speakingPulse
            ? `0 0 0 4px ${alpha('#2DD4BF', 0.18)}, 0 8px 28px rgba(0,0,0,0.45)`
            : '0 4px 18px rgba(0,0,0,0.35)',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
          cursor: 'pointer',
        }}
      >
        {/* ---- Media layers ---- */}
        {hasScreen && (
          <div
            data-testid="screen-share-tile"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(150deg, #1B2440 0%, #10182B 100%)',
            }}
          >
            <PresentToAllIcon sx={{ fontSize: size === 'lg' ? 84 : 48, color: 'rgba(255,255,255,0.25)' }} />
          </div>
        )}

        {hasVideo && (
          <video
            ref={videoRef}
            data-testid="participant-video"
            muted={participant.isLocal}
            autoPlay
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: participant.isLocal ? 'scaleX(-1)' : 'none',
              background: '#0D1322',
            }}
          />
        )}

        {/* ---- Avatar fallback ---- */}
        {!hasVideo && !hasScreen && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <motion.div
              animate={speakingPulse ? { scale: [1, 1.06, 1] } : {}}
              transition={speakingPulse ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' } : {}}
              style={{
                width: size === 'lg' ? 112 : size === 'md' ? 84 : 60,
                height: size === 'lg' ? 112 : size === 'md' ? 84 : 60,
                borderRadius: '50%',
                backgroundImage: `url(${avatarFor(participant.id)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `3px solid ${speakingPulse ? '#2DD4BF' : 'rgba(255,255,255,0.16)'}`,
                boxShadow: speakingPulse ? `0 0 24px ${alpha('#2DD4BF', 0.5)}` : '0 6px 20px rgba(0,0,0,0.4)',
              }}
            />
            <span
              style={{
                fontSize: size === 'lg' ? '1.05rem' : '0.85rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {participant.firstName ?? initialsOf(undefined, undefined, participant.name)}
            </span>
          </div>
        )}

        {/* ---- Speaking indicator ---- */}
        {speakingPulse && (
          <motion.div
            data-testid="speaking-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(13,19,34,0.72)',
              backdropFilter: 'blur(8px)',
              borderRadius: 999,
              padding: '3px 10px',
              border: '1px solid rgba(45,212,191,0.4)',
            }}
          >
            {[0, 1, 2, 3].map((bar) => (
              <motion.span
                key={bar}
                animate={{ height: [4, 12 - (bar % 3) * 3, 4] }}
                transition={{ repeat: Infinity, duration: 0.7 + bar * 0.12, ease: 'easeInOut' }}
                style={{ width: 3, borderRadius: 99, background: '#2DD4BF' }}
              />
            ))}
          </motion.div>
        )}

        {/* ---- Status badges ---- */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            display: 'flex',
            gap: 6,
          }}
        >
          {muted && (
            <span
              data-testid="muted-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.85)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
              aria-label="Microphone muted"
            >
              <MicOffIcon sx={{ fontSize: 14, color: '#fff' }} />
            </span>
          )}
          {!participant.videoEnabled && !hasScreen && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(15,23,42,0.75)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
              aria-label="Camera off"
            >
              <VideocamOffIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }} />
            </span>
          )}
          {participant.handRaised && (
            <span
              data-testid="hand-raised-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(251,191,36,0.9)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
              aria-label="Hand raised"
            >
              <PanToolIcon sx={{ fontSize: 14, color: '#451A03' }} />
            </span>
          )}
          {participant.pinned && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(142,128,255,0.9)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
              aria-label="Pinned"
            >
              <PushPinIcon sx={{ fontSize: 14, color: '#fff' }} />
            </span>
          )}
        </div>

        {/* ---- Connection quality ---- */}
        <span
          data-testid="quality-dot"
          title={`Connection: ${participant.connectionQuality}`}
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: quality,
            boxShadow: `0 0 8px ${quality}`,
            opacity: 0.85,
          }}
        />

        {/* ---- Name + role bar ---- */}
        {showName && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '8px 12px',
              background: 'linear-gradient(to top, rgba(6,10,20,0.85), transparent)',
            }}
          >
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.95)',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {participant.name}
              {participant.isLocal && ' (You)'}
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: roleColor[participant.role],
                background: 'rgba(13,19,34,0.6)',
                border: `1px solid ${alpha(roleColor[participant.role], 0.35)}`,
                borderRadius: 999,
                padding: '2px 8px',
                whiteSpace: 'nowrap',
              }}
            >
              {roleLabel[participant.role]}
            </span>
          </div>
        )}
      </motion.div>
    );
  },
);

ParticipantTile.displayName = 'ParticipantTile';
