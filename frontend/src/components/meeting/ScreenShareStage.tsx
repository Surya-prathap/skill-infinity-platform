import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import { ParticipantTile } from './ParticipantTile';
import type { MeetingParticipant } from '@/types';

interface ScreenShareStageProps {
  presenter: MeetingParticipant;
  presentersStream?: MediaStream | null;
  otherParticipants: MeetingParticipant[];
}

/** Presentation layout — shared screen front and center. */
export const ScreenShareStage = ({ presenter, presentersStream, otherParticipants }: ScreenShareStageProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && presentersStream) {
      video.srcObject = presentersStream;
      video.play().catch(() => undefined);
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [presentersStream]);

  return (
    <motion.div
      layout
      data-testid="screen-share-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, height: '100%', minHeight: 0 }}
    >
      {/* Shared screen */}
      <motion.div
        layout
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(150deg, #161F36, #0C1220)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          minHeight: 0,
        }}
      >
        {presentersStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#0C1220' }}
            data-testid="screen-share-video"
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2.4 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(109,93,246,0.2))',
                border: '1px solid rgba(45,212,191,0.35)',
              }}
            >
              <PresentToAllIcon sx={{ fontSize: 34, color: '#2DD4BF' }} />
            </motion.div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
              {presenter.name} is presenting
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>
              A preview appears here when the presenter starts sharing
            </span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(10,14,26,0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#2DD4BF',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2DD4BF', boxShadow: '0 0 8px #2DD4BF' }} />
          Presenter: {presenter.name}
        </div>
      </motion.div>

      {/* Side column: presenter + audience */}
      <motion.div
        layout
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        <div style={{ height: 200, flexShrink: 0 }}>
          <ParticipantTile participant={presenter} stream={null} onPin={undefined} />
        </div>
        {otherParticipants.slice(0, 6).map((participant) => (
          <div key={participant.id} style={{ height: 130, flexShrink: 0 }}>
            <ParticipantTile participant={participant} stream={participant.isLocal ? null : null} size="sm" />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
