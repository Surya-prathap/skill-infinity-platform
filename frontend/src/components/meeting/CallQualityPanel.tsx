import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { selectMeetingStats, selectMeetingConnection } from '@/store/selectors';
import { qualityColor } from './meetingHelpers';

interface CallQualityPanelProps {
  onClose: () => void;
}

const STAT_ROWS: { key: keyof import('@/types').CallStats; label: string; format: (value: number | string) => string }[] = [
  { key: 'latencyMs', label: 'Latency', format: (value) => `${value} ms` },
  { key: 'packetLoss', label: 'Packet loss', format: (value) => `${value}%` },
  { key: 'bitrateKbps', label: 'Bitrate', format: (value) => `${Math.round(Number(value) / 1000)} Mbps` },
  { key: 'fps', label: 'Frames / sec', format: (value) => String(value) },
  { key: 'resolution', label: 'Resolution', format: (value) => String(value) },
  { key: 'connectionType', label: 'Network', format: (value) => String(value) },
];

/** Live call-quality panel with realistic WebRTC stats. */
export const CallQualityPanel = ({ onClose }: CallQualityPanelProps) => {
  const stats = useAppSelector(selectMeetingStats);
  const connection = useAppSelector(selectMeetingConnection);
  const color = qualityColor[stats.quality];

  return (
    <motion.aside
      data-testid="call-quality-panel"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      aria-label="Call quality"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        maxWidth: '88vw',
        zIndex: 30,
        background: 'rgba(13,19,34,0.94)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.4)',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>Call quality</h3>
        <button
          onClick={onClose}
          aria-label="Close call quality panel"
          style={{ border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, width: 30, height: 30, fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 14,
          padding: '14px 16px',
          background: `linear-gradient(135deg, ${color}22, transparent)`,
          border: `1px solid ${color}55`,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            Connection
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color, textTransform: 'capitalize' }}>{stats.quality}</div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}33`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 14px ${color}` }} />
        </motion.div>
      </div>

      {connection.status === 'reconnecting' && (
        <div
          style={{
            borderRadius: 12,
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            color: '#FBBF24',
            fontSize: '0.74rem',
            fontWeight: 700,
            padding: '10px 12px',
            marginBottom: 14,
          }}
          data-testid="reconnecting-banner"
        >
          Reconnecting… adapting to the current network conditions.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STAT_ROWS.map((row) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 10,
              padding: '9px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{row.label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', fontVariantNumeric: 'tabular-nums' }}>
              {row.format(stats[row.key])}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginTop: 14 }}>
        Video adapts automatically to your bandwidth. In a slow network the app lowers resolution and frame rate to keep the call stable.
      </p>
    </motion.aside>
  );
};
