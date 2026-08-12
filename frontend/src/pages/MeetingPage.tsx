import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMeetingError } from '@/store/slices/meetingSlice';
import { selectMeetingStatus, selectMeeting, selectUser } from '@/store/selectors';
import { useJoinMeeting, useResolveMeeting } from '@/features/meeting';
import { WaitingRoom, MeetingRoom } from '@/components/meeting';
import type { Meeting } from '@/types';

/** Full-screen meeting route — waiting room + live room. */
export const MeetingPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { meeting, isOffline } = useResolveMeeting(meetingId ?? null);
  const status = useAppSelector(selectMeetingStatus);
  const storeMeeting = useAppSelector(selectMeeting);
  const currentUser = useAppSelector(selectUser);
  const { join, leave } = useJoinMeeting();

  const effectiveMeeting: Meeting | null = storeMeeting ?? meeting ?? null;

  /* ---------------- Join flow ---------------- */
  const handleJoin = useCallback(
    (mutedJoin: boolean) => {
      // Use the effective meeting (store copy from the meetings hub, or the
      // resolved API meeting). The query result alone can still be loading
      // while the waiting room is already visible, which used to make the
      // "Join now" button silently do nothing.
      if (!effectiveMeeting) return;
      dispatch(setMeetingError(null));

      // The meeting platform runs on the simulated signaling driver
      // (webrtc/simulation.ts) — the communication-service socket layer was
      // removed from the platform.
      const isHost = effectiveMeeting.hostId === 'user-me' || currentUser?.userId === effectiveMeeting.hostId;
      join(effectiveMeeting, { mutedJoin, role: isHost ? 'HOST' : 'LEARNER' });
    },
    [effectiveMeeting, dispatch, join, currentUser],
  );

  const handleEnded = useCallback(() => {
    leave();
  }, [leave]);

  /* ---------------- Error state ---------------- */
  if (isOffline && !effectiveMeeting) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: '#0B1220',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        <div style={{ fontSize: '2.4rem' }}>🎥</div>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Meeting not found</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          This meeting link is invalid or the meeting has ended.
        </p>
        <button
          onClick={() => void navigate('/meetings')}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          Go to Meetings
        </button>
      </div>
    );
  }

  const inRoom = status === 'in-progress' || status === 'connecting' || status === 'reconnecting';

  return (
    <>
      <AnimatePresence mode="wait">
        {inRoom && effectiveMeeting ? (
          <MeetingRoom key="room" onEnded={handleEnded} />
        ) : (
          effectiveMeeting && <WaitingRoom key="waiting" meeting={effectiveMeeting} onJoin={handleJoin} />
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetingPage;
