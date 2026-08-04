import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMessage,
  closeChat,
  endMeeting,
  leaveMeeting,
  openChat,
  setControl,
  setLayout,
  setPinned,
  setSpotlight,
} from '@/store/slices/meetingSlice';
import {
  selectMeeting,
  selectMeetingConnection,
  selectMeetingControls,
  selectMeetingLayout,
  selectMeetingParticipants,
  selectMeetingPinnedId,
  selectMeetingStartedAt,
  selectMeetingStats,
  selectMeetingUnreadChat,
} from '@/store/selectors';
import { useMeetingMedia } from './useMeetingMedia';
import { MeetingHeader } from './MeetingHeader';
import { MeetingControls } from './MeetingControls';
import { ParticipantGrid } from './ParticipantGrid';
import { ScreenShareStage } from './ScreenShareStage';
import { ParticipantPanel } from './ParticipantPanel';
import { MeetingChat } from './MeetingChat';
import { CallQualityPanel } from './CallQualityPanel';
import { DeviceSettingsPanel } from './DeviceSettingsPanel';
import { ReactionOverlay } from './ReactionOverlay';
import { LeaveMeetingDialog } from './LeaveMeetingDialog';
import { showInfo, showSuccess } from '@/utils';
import { MEETING_CURRENT_USER_ID, MEETING_CURRENT_USER_NAME } from '@/features/meeting';

interface MeetingRoomProps {
  onEnded: () => void;
}

const CAPTION_LINES = [
  'Welcome everyone, thanks for joining.',
  'Let me share the session agenda for today.',
  'We will focus on scalability and latency.',
  'Any questions before we dive into the design?',
];

/** Full meeting room experience — premium adaptive stage. */
export const MeetingRoom = ({ onEnded }: MeetingRoomProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const meeting = useAppSelector(selectMeeting);
  const participants = useAppSelector(selectMeetingParticipants);
  const layout = useAppSelector(selectMeetingLayout);
  const controls = useAppSelector(selectMeetingControls);
  const pinnedId = useAppSelector(selectMeetingPinnedId);
  const startedAt = useAppSelector(selectMeetingStartedAt);
  const stats = useAppSelector(selectMeetingStats);
  const connection = useAppSelector(selectMeetingConnection);
  const unreadChat = useAppSelector(selectMeetingUnreadChat);

  const { localStream, screenStream, isScreenSharing, startMedia, toggleMic, toggleCamera, toggleScreenShare, stopMedia } =
    useMeetingMedia();

  const [leaveOpen, setLeaveOpen] = useState(false);

  /* Start local camera/mic once the room mounts (the waiting room stops its
     own stream instance on unmount, so the room must re-acquire media). */
  useEffect(() => {
    void startMedia();
  }, [startMedia]);
  const [captionsVisible, setCaptionsVisible] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);

  const isHost = meeting?.hostId === MEETING_CURRENT_USER_ID;

  /* ---------------- Screen share presenter ---------------- */
  const screenPresenter = useMemo(
    () => participants.find((participant) => participant.screenSharing) ?? null,
    [participants],
  );
  const screenStageActive = isScreenSharing || Boolean(screenPresenter);

  /* ---------------- Captions demo ---------------- */
  useEffect(() => {
    if (!controls.captionsOn) {
      setCaptionsVisible(false);
      return;
    }
    setCaptionsVisible(true);
    const id = window.setInterval(() => {
      setCaptionIndex((index) => (index + 1) % CAPTION_LINES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [controls.captionsOn]);

  /* ---------------- Handlers ---------------- */
  const handleToggleMic = useCallback(() => {
    toggleMic();
  }, [toggleMic]);

  const handleToggleCamera = useCallback(() => {
    toggleCamera();
  }, [toggleCamera]);

  const handleScreenShare = useCallback(() => {
    void toggleScreenShare();
  }, [toggleScreenShare]);

  const handleToggleHand = useCallback(() => {
    const next = !controls.handRaised;
    dispatch(setControl({ key: 'handRaised', value: next }));
    if (next) showInfo('Hand raised — the host has been notified');
  }, [controls.handRaised, dispatch]);

  const handleToggleRecording = useCallback(() => {
    const next = !controls.recording;
    dispatch(setControl({ key: 'recording', value: next }));
    dispatch(
      addMessage({
        id: `meet-sys-rec-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        content: next ? '🔴 Recording started' : 'Recording stopped',
        kind: 'system',
        createdAt: new Date().toISOString(),
      }),
    );
    if (next) showInfo('Recording started — stored locally for this demo');
  }, [controls.recording, dispatch]);

  const handleToggleCaptions = useCallback(() => {
    const next = !controls.captionsOn;
    dispatch(setControl({ key: 'captionsOn', value: next }));
    if (next) showInfo('Live captions enabled');
  }, [controls.captionsOn, dispatch]);

  const handleTogglePip = useCallback(() => {
    dispatch(setControl({ key: 'pip', value: !controls.pip }));
    showInfo(controls.pip ? 'Picture-in-picture disabled' : 'Picture-in-picture enabled');
  }, [controls.pip, dispatch]);

  const handleLeave = useCallback(() => {
    dispatch(leaveMeeting());
    stopMedia();
    onEnded();
  }, [dispatch, stopMedia, onEnded]);

  const handleEnd = useCallback(() => {
    dispatch(
      addMessage({
        id: `meet-sys-end-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        content: `${MEETING_CURRENT_USER_NAME} ended the meeting`,
        kind: 'system',
        createdAt: new Date().toISOString(),
      }),
    );
    dispatch(endMeeting());
    stopMedia();
    onEnded();
    showSuccess('Meeting ended — everyone has been disconnected');
    void navigate('/meetings', { replace: true });
  }, [dispatch, stopMedia, onEnded, navigate]);

  const handlePin = useCallback(
    (id: string | null) => {
      dispatch(setPinned(id));
      if (id) dispatch(setSpotlight(null));
    },
    [dispatch],
  );

  const handleLayoutChange = useCallback(
    (next: import('@/types').MeetingLayout) => {
      dispatch(setLayout(next));
    },
    [dispatch],
  );

  const togglePanel = useCallback(
    (key: 'chatOpen' | 'participantsOpen' | 'settingsOpen' | 'reactionsOpen' | 'statsOpen' | 'pip') => {
      if (key === 'chatOpen') {
        // Toggle, clearing unread only when opening.
        if (controls.chatOpen) {
          dispatch(closeChat());
        } else {
          dispatch(openChat());
        }
        return;
      }
      dispatch(setControl({ key, value: !controls[key] }));
    },
    [dispatch, controls],
  );

  const isStatsOpen = controls.statsOpen;

  /* ---- Render ---- */
  return (
    <motion.div
      data-testid="meeting-room"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(1000px 500px at 80% -10%, rgba(109,93,246,0.12), transparent), radial-gradient(800px 400px at 0% 110%, rgba(20,184,166,0.1), transparent), #0B1220',
      }}
    >
      <MeetingHeader
        meeting={meeting}
        startedAt={startedAt}
        participantCount={participants.length}
        quality={stats.quality}
        latencyMs={stats.latencyMs}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        controls={{
          chatOpen: controls.chatOpen,
          participantsOpen: controls.participantsOpen,
          settingsOpen: controls.settingsOpen,
          statsOpen: isStatsOpen,
          unreadChat,
        }}
        onToggleChat={() => togglePanel('chatOpen')}
        onToggleParticipants={() => togglePanel('participantsOpen')}
        onToggleSettings={() => togglePanel('settingsOpen')}
        onToggleStats={() => togglePanel('statsOpen')}
        isPresenter={isScreenSharing}
      />

      {/* Stage */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {screenStageActive && screenPresenter ? (
          <ScreenShareStage
            presenter={screenPresenter}
            presentersStream={screenPresenter.isLocal ? screenStream : null}
            otherParticipants={participants.filter((participant) => participant.id !== screenPresenter.id)}
          />
        ) : (
          <ParticipantGrid
            participants={participants}
            localStream={localStream}
            layout={layout}
            pinnedId={pinnedId}
            onPin={handlePin}
          />
        )}

        {/* Live captions strip */}
        <AnimatePresence>
          {captionsVisible && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              data-testid="captions-strip"
              style={{
                position: 'absolute',
                bottom: 96,
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: 'min(640px, 90%)',
                background: 'rgba(10,14,26,0.82)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: 14,
                padding: '8px 16px',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.9)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                textAlign: 'center',
                zIndex: 25,
              }}
            >
              {CAPTION_LINES[captionIndex]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panels */}
        <AnimatePresence>
          {controls.participantsOpen && (
            <ParticipantPanel participants={participants} onClose={() => togglePanel('participantsOpen')} onPin={handlePin} pinnedId={pinnedId} />
          )}
          {controls.chatOpen && <MeetingChat onClose={() => togglePanel('chatOpen')} />}
          {controls.settingsOpen && <DeviceSettingsPanel onClose={() => togglePanel('settingsOpen')} />}
          {isStatsOpen && <CallQualityPanel onClose={() => togglePanel('statsOpen')} />}
        </AnimatePresence>

        <ReactionOverlay />

        {/* Controls */}
        <MeetingControls
          controls={controls}
          isHost={isHost}
          isScreenSharing={isScreenSharing}
          unreadChat={unreadChat}
          onToggleMic={handleToggleMic}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleScreenShare}
          onToggleParticipants={() => togglePanel('participantsOpen')}
          onToggleChat={() => togglePanel('chatOpen')}
          onToggleReactions={() => togglePanel('reactionsOpen')}
          onToggleHand={handleToggleHand}
          onToggleRecording={handleToggleRecording}
          onToggleCaptions={handleToggleCaptions}
          onTogglePip={handleTogglePip}
          onLeave={() => setLeaveOpen(true)}
        />
      </main>

      <LeaveMeetingDialog
        open={leaveOpen}
        isHost={isHost}
        onClose={() => setLeaveOpen(false)}
        onLeave={handleLeave}
        onEnd={handleEnd}
      />

      {/* Connection overlay */}
      <AnimatePresence>
        {connection.status === 'reconnecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 70,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(251,191,36,0.15)',
              border: '1px solid rgba(251,191,36,0.4)',
              backdropFilter: 'blur(12px)',
              borderRadius: 999,
              padding: '8px 18px',
              color: '#FBBF24',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#FBBF24' }}
            />
            Reconnecting to the meeting…
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
