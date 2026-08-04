import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import PushPinIcon from '@mui/icons-material/PushPin';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessage, reactToMessage, toggleMessagePin } from '@/store/slices/meetingSlice';
import { selectMeetingMessages } from '@/store/selectors';
import { MEETING_CURRENT_USER_ID, MEETING_CURRENT_USER_NAME } from '@/features/meeting';
import { avatarFor } from './meetingHelpers';

interface MeetingChatProps {
  onClose: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '🔥'];

/** In-meeting chat — integrates with the Communication Center patterns. */
export const MeetingChat = ({ onClose }: MeetingChatProps) => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectMeetingMessages);
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  const send = (): void => {
    const content = draft.trim();
    if (!content) return;
    dispatch(
      addMessage({
        id: `meet-chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: MEETING_CURRENT_USER_ID,
        senderName: MEETING_CURRENT_USER_NAME,
        content,
        kind: 'text',
        createdAt: new Date().toISOString(),
      }),
    );
    setDraft('');
  };

  const formatTime = (iso: string): string =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.aside
      data-testid="meeting-chat"
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      aria-label="In-meeting chat"
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
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>Meeting chat</h3>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{ border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', borderRadius: 8, width: 30, height: 30, fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: 40 }}>
            No messages yet — say hello 👋
          </p>
        )}
        {sorted.map((message) =>
          message.kind === 'system' ? (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: 'center',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.55)',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 999,
                padding: '3px 12px',
                maxWidth: '90%',
                textAlign: 'center',
              }}
            >
              {message.content}
            </motion.div>
          ) : (
            <motion.div
              key={message.id}
              data-testid="meeting-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                gap: 8,
                flexDirection: 'column',
                alignItems: message.senderId === MEETING_CURRENT_USER_ID ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, maxWidth: '100%' }}>
                {message.senderId !== MEETING_CURRENT_USER_ID && (
                  <img src={avatarFor(message.senderId)} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div
                  style={{
                    background:
                      message.senderId === MEETING_CURRENT_USER_ID
                        ? 'linear-gradient(135deg, #6D5DF6, #5443D4)'
                        : 'rgba(255,255,255,0.08)',
                    borderRadius: message.senderId === MEETING_CURRENT_USER_ID ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    padding: '8px 12px',
                    maxWidth: '82%',
                    position: 'relative',
                    border: message.pinned ? '1px solid rgba(142,128,255,0.5)' : '1px solid transparent',
                  }}
                >
                  {message.senderId !== MEETING_CURRENT_USER_ID && (
                    <span style={{ display: 'block', fontSize: '0.64rem', fontWeight: 700, color: '#8E80FF', marginBottom: 2 }}>
                      {message.senderName}
                    </span>
                  )}
                  <span style={{ fontSize: '0.8rem', lineHeight: 1.45, color: 'rgba(255,255,255,0.94)', wordBreak: 'break-word' }}>
                    {message.content}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{formatTime(message.createdAt)}</span>
                    {message.pinned && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: '0.6rem', color: '#A99CFF' }}>
                        <PushPinIcon sx={{ fontSize: 10 }} /> pinned
                      </span>
                    )}
                  </div>
                  {(message.reactions?.length ?? 0) > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {message.reactions?.map((emoji) => (
                        <span key={emoji} style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.1)', borderRadius: 999, padding: '1px 7px' }}>
                          {emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, paddingRight: 6 }}>
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => dispatch(reactToMessage({ messageId: message.id, emoji }))}
                    aria-label={`React ${emoji}`}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      transition: 'transform 120ms ease',
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {emoji}
                  </button>
                ))}
                <Tooltip title={message.pinned ? 'Unpin' : 'Pin message'}>
                  <IconButton
                    size="small"
                    onClick={() => dispatch(toggleMessagePin(message.id))}
                    sx={{ color: message.pinned ? '#8E80FF' : 'rgba(255,255,255,0.45)', padding: '2px' }}
                    aria-label={message.pinned ? 'Unpin message' : 'Pin message'}
                  >
                    <PushPinIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              </div>
            </motion.div>
          ),
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
          placeholder="Send a message…"
          aria-label="Meeting chat message"
          style={{
            flex: 1,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.94)',
            borderRadius: 999,
            padding: '9px 14px',
            fontSize: '0.8rem',
            outline: 'none',
          }}
        />
        <IconButton
          onClick={send}
          aria-label="Send message"
          disabled={!draft.trim()}
          sx={{
            background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
            color: '#fff',
            width: 38,
            height: 38,
            '&:hover': { background: 'linear-gradient(135deg, #8E80FF, #6D5DF6)', transform: 'translateY(-1px)' },
            '&:disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
          }}
        >
          <SendIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </div>
    </motion.aside>
  );
};
