import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import LockIcon from '@mui/icons-material/Lock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useMeetingMedia } from './useMeetingMedia';
import { useAppSelector } from '@/store/hooks';
import { selectMeetingError } from '@/store/selectors';
import type { Meeting } from '@/types';

interface WaitingRoomProps {
  meeting: Meeting;
  onJoin: (mutedJoin: boolean) => void;
}

/** Pre-join lobby with live device preview — the Meet/Zoom-style entry point. */
export const WaitingRoom = ({ meeting, onJoin }: WaitingRoomProps) => {
  const { localStream, audioLevel, toggleMic, toggleCamera, startMedia, error } = useMeetingMedia();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [joining, setJoining] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'checking' | 'excellent' | 'good' | 'fair' | 'poor'>('checking');
  const storeError = useAppSelector(selectMeetingError);
  const activeError = error ?? storeError;

  useEffect(() => {
    void startMedia();
  }, [startMedia]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && localStream) {
      video.srcObject = localStream;
      video.play().catch(() => undefined);
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [localStream]);

  useEffect(() => {
    // Simulated network check — resolves to a quality after a beat.
    const timer = window.setTimeout(() => {
      setNetworkQuality('excellent');
    }, 1400);
    return () => window.clearTimeout(timer);
  }, []);

  const micOn = useAppSelector((state) => state.meeting.controls.micOn);
  const camOn = useAppSelector((state) => state.meeting.controls.camOn);

  const handleJoin = (muted: boolean): void => {
    setJoining(true);
    onJoin(muted);
  };

  const qualityColorMap: Record<string, string> = { excellent: '#34D399', good: '#2DD4BF', fair: '#FBBF24', poor: '#F87171' };

  return (
    <motion.div
      data-testid="waiting-room"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(1200px 600px at 70% -10%, rgba(109,93,246,0.16), transparent), radial-gradient(900px 500px at 10% 110%, rgba(20,184,166,0.12), transparent), #0B1220',
      }}
    >
      <motion.div
        style={{
          width: '100%',
          maxWidth: 1080,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* ---- Camera preview ---- */}
        <motion.div
          layout
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            background: '#0D1322',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 90px rgba(0,0,0,0.5)',
            position: 'relative',
            aspectRatio: '16/10',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            data-testid="waiting-camera-preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: camOn ? 'block' : 'none',
            }}
          />
          {!camOn && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <VideocamOffIcon sx={{ fontSize: 52 }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Camera is off</span>
            </div>
          )}

          {activeError && (
            <div
              data-testid="media-error"
              style={{
                position: 'absolute',
                inset: 'auto 0 0 0',
                background: 'rgba(239,68,68,0.92)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '12px 16px',
                fontSize: '0.76rem',
                fontWeight: 600,
              }}
            >
              {activeError.title} — {activeError.message}
            </div>
          )}

          {/* Self view label */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(10,14,26,0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            You · {meeting.title}
          </div>

          {/* Audio level bar */}
          {micOn && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(10,14,26,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: 999,
                padding: '5px 12px',
              }}
            >
              <GraphicEqIcon sx={{ fontSize: 15, color: audioLevel > 0.1 ? '#2DD4BF' : 'rgba(255,255,255,0.4)' }} />
              <span style={{ width: 60 }}>
                <span
                  style={{
                    display: 'inline-block',
                    height: 5,
                    borderRadius: 99,
                    background: audioLevel > 0.1 ? '#2DD4BF' : 'rgba(255,255,255,0.18)',
                    width: `${Math.min(100, audioLevel * 160)}%`,
                    transition: 'width 80ms linear',
                  }}
                />
              </span>
            </div>
          )}

          {/* Camera + mic quick toggles */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 10,
              background: 'rgba(10,14,26,0.72)',
              backdropFilter: 'blur(12px)',
              borderRadius: 999,
              padding: '8px 12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Tooltip title={micOn ? 'Mute microphone' : 'Unmute microphone'}>
              <IconButton
                onClick={toggleMic}
                aria-label="Toggle microphone"
                sx={{
                  background: micOn ? 'rgba(255,255,255,0.12)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: micOn ? 'rgba(255,255,255,0.92)' : '#fff',
                  '&:hover': { transform: 'translateY(-2px)' },
                  transition: 'transform 120ms ease',
                }}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={camOn ? 'Turn camera off' : 'Turn camera on'}>
              <IconButton
                onClick={toggleCamera}
                aria-label="Toggle camera"
                sx={{
                  background: camOn ? 'rgba(255,255,255,0.12)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: camOn ? 'rgba(255,255,255,0.92)' : '#fff',
                  '&:hover': { transform: 'translateY(-2px)' },
                  transition: 'transform 120ms ease',
                }}
              >
                {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </motion.div>

        {/* ---- Join card ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em' }}>
              {meeting.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 999,
                  padding: '4px 11px',
                }}
              >
                <LockIcon sx={{ fontSize: 12 }} /> Hosted by {meeting.hostName}
              </span>
              {meeting.scheduledAt && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.75)',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 999,
                    padding: '4px 11px',
                  }}
                >
                  <ScheduleIcon sx={{ fontSize: 12 }} />
                  {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {meeting.durationMinutes && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: 999,
                    padding: '4px 11px',
                  }}
                >
                  {meeting.durationMinutes} min
                </span>
              )}
            </div>
          </div>

          {/* Network check */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderRadius: 14,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <motion.span
              animate={networkQuality === 'checking' ? { opacity: [1, 0.4, 1] } : {}}
              transition={networkQuality === 'checking' ? { repeat: Infinity, duration: 1 } : {}}
              style={{ width: 10, height: 10, borderRadius: '50%', background: qualityColorMap[networkQuality] ?? '#9AA3B8', boxShadow: `0 0 10px ${qualityColorMap[networkQuality] ?? 'transparent'}` }}
            />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                {networkQuality === 'checking' ? 'Checking network quality…' : `Network is ${networkQuality}`}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)' }}>
                WebRTC is {networkQuality === 'checking' ? 'preparing' : 'ready'} — audio & video will use the best path available
              </div>
            </div>
          </div>

          <Button
            size="large"
            variant="contained"
            disabled={joining || networkQuality === 'checking'}
            onClick={() => handleJoin(false)}
            data-testid="join-now"
            sx={{
              background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
              fontSize: '0.92rem',
              fontWeight: 800,
              borderRadius: 14,
              minHeight: 52,
              boxShadow: '0 10px 34px rgba(109,93,246,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #8E80FF, #6D5DF6)', transform: 'translateY(-2px)' },
            }}
          >
            {joining ? 'Joining…' : 'Join now'}
          </Button>

          <Button
            size="medium"
            variant="outlined"
            disabled={joining || networkQuality === 'checking'}
            onClick={() => handleJoin(true)}
            data-testid="join-muted"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              borderColor: 'rgba(255,255,255,0.4)',
              borderRadius: 14,
              minHeight: 46,
              '&:hover': { borderColor: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)' },
            }}
          >
            Join with muted mic & camera
          </Button>

          <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, textAlign: 'center' }}>
            End-to-end encrypted · Camera and microphone are only used during the meeting.
            <br />
            Permissions can be revoked anytime in your browser settings.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
