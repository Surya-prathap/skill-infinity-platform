import { useEffect, useState } from 'react';
import { formatMeetingDuration } from './meetingHelpers';

interface CallTimerProps {
  startedAt: string | null;
}

/** Live elapsed-time chip for the meeting header. */
export const CallTimer = ({ startedAt }: CallTimerProps) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const tick = (): void => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  return (
    <span
      className="call-timer"
      role="timer"
      aria-label="Meeting duration"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 700,
        fontSize: '0.8rem',
        letterSpacing: '0.04em',
        color: 'rgba(255,255,255,0.92)',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 999,
        padding: '4px 12px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '0.72rem' }}>
        ●
      </span>
      {formatMeetingDuration(elapsed)}
    </span>
  );
};
