import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '@/store/hooks';
import { setMeeting } from '@/store/slices/meetingSlice';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import { useUpcomingMeetingsQuery, useJoinMeeting } from '@/features/meeting';
import { avatarFor } from '@/components/meeting/meetingHelpers';
import { showInfo } from '@/utils';
import type { Meeting } from '@/types';

const KIND_META: Record<Meeting['kind'], { label: string; color: string }> = {
  'one-to-one': { label: '1:1 Call', color: '#2DD4BF' },
  'mentor-learner': { label: 'Mentorship', color: '#60A5FA' },
  session: { label: 'Session', color: '#8E80FF' },
  group: { label: 'Group', color: '#FBBF24' },
  instant: { label: 'Instant', color: '#34D399' },
  webinar: { label: 'Webinar', color: '#F87171' },
  class: { label: 'Live Class', color: '#A99CFF' },
};

/** Meetings hub — upcoming sessions, instant calls, join flow. */
export const MeetingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { meetings, isOffline } = useUpcomingMeetingsQuery();
  const { join } = useJoinMeeting();

  const [instantOpen, setInstantOpen] = useState(false);
  const [instantTitle, setInstantTitle] = useState('');

  const sorted = useMemo(
    () => [...meetings].sort((a, b) => {
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return ta - tb;
    }),
    [meetings],
  );

  const handleJoin = (meeting: Meeting): void => {
    dispatch(setMeeting(meeting));
    join(meeting, { role: meeting.hostId === 'user-me' ? 'HOST' : 'LEARNER' });
    void navigate(`/meet/${meeting.id}`);
  };

  const createInstant = (): void => {
    const meeting: Meeting = {
      id: `meet-instant-${Date.now()}`,
      title: instantTitle.trim() || 'Instant Meeting',
      kind: 'instant',
      hostId: 'user-me',
      hostName: 'Alex Morgan',
      hostRole: 'HOST',
      durationMinutes: 60,
      joinUrl: '/meet/instant',
      maxParticipants: 25,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    setInstantOpen(false);
    setInstantTitle('');
    handleJoin(meeting);
    showInfo('Instant meeting created — share the link to invite others');
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 24,
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(109,93,246,0.16), rgba(20,184,166,0.1)), #121A2B',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Meetings
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            Join scheduled sessions, start instant calls, or hop into a mentor conversation.
          </p>
          {isOffline && (
            <Chip
              size="small"
              label="Demo mode — sample meetings"
              sx={{ mt: 1.5, bgcolor: 'rgba(45,212,191,0.12)', color: '#2DD4BF', fontWeight: 700, fontSize: '0.68rem' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInstantOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
              fontWeight: 800,
              borderRadius: 12,
              boxShadow: '0 8px 26px rgba(109,93,246,0.35)',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            New instant meeting
          </Button>
        </div>
      </motion.div>

      {/* Upcoming grid */}
      <h2 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: '0 0 14px' }}>
        Upcoming · {sorted.length}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {sorted.map((meeting, index) => {
          const meta = KIND_META[meeting.kind as keyof typeof KIND_META] ?? KIND_META.session;
          return (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              style={{
                borderRadius: 18,
                padding: 20,
                background: 'linear-gradient(160deg, #161F36, #121A2B)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 10px 34px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = 'rgba(142,128,255,0.4)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
              onClick={() => handleJoin(meeting)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  size="small"
                  label={meta.label}
                  sx={{
                    bgcolor: `${meta.color}1a`,
                    color: meta.color,
                    fontWeight: 800,
                    fontSize: '0.64rem',
                    border: `1px solid ${meta.color}44`,
                  }}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)' }}>
                  <LockIcon sx={{ fontSize: 12 }} /> secure
                </span>
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>
                  {meeting.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <img src={avatarFor(meeting.hostId)} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{meeting.hostName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {meeting.scheduledAt && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
                    <ScheduleIcon sx={{ fontSize: 13 }} />
                    {new Date(meeting.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                {meeting.durationMinutes && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
                    <CallIcon sx={{ fontSize: 13 }} /> {meeting.durationMinutes} min
                  </span>
                )}
                {meeting.maxParticipants && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
                    <GroupIcon sx={{ fontSize: 13 }} /> {meeting.maxParticipants}
                  </span>
                )}
              </div>

              <Button
                variant="contained"
                startIcon={<VideocamIcon />}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
                  fontWeight: 800,
                  borderRadius: 10,
                  mt: 'auto',
                  '&:hover': { background: 'linear-gradient(135deg, #8E80FF, #6D5DF6)' },
                }}
              >
                Join meeting
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Instant meeting dialog */}
      <Dialog
        open={instantOpen}
        onClose={() => setInstantOpen(false)}
        aria-labelledby="instant-title"
        slotProps={{
          paper: {
            style: {
              background: 'linear-gradient(160deg, #1A2438, #121A2B)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              maxWidth: 440,
            },
          },
        }}
      >
        <DialogTitle id="instant-title" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800 }}>
          Start an instant meeting
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 12, pt: '8px !important' }}>
          <TextField
            autoFocus
            label="Meeting title"
            value={instantTitle}
            onChange={(event) => setInstantTitle(event.target.value)}
            placeholder="e.g. Quick sync with Sarah"
            fullWidth
            size="small"
            onKeyDown={(event) => {
              if (event.key === 'Enter') createInstant();
            }}
            sx={{
              '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.05)' },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
              '& input': { color: 'rgba(255,255,255,0.92)' },
            }}
          />
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>
            You can share the meeting link with anyone — they can join from their browser without an account.
          </p>
        </DialogContent>
        <DialogActions sx={{ padding: '12px 20px 18px' }}>
          <Button onClick={() => setInstantOpen(false)} variant="outlined" sx={{ color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}>
            Cancel
          </Button>
          <Button onClick={createInstant} variant="contained" sx={{ background: 'linear-gradient(135deg, #6D5DF6, #5443D4)', fontWeight: 800 }}>
            Start meeting
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MeetingsPage;
