import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress, Popover, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentSatisfiedOutlinedIcon from '@mui/icons-material/SentimentSatisfiedOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { Typography } from '@/components/ui/Typography';
import { formatFileSize } from '@/utils';
import { gradients } from '@/theme';
import { useTypingEmitter } from '@/features/communication/hooks';
import { EmojiPicker } from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { VoiceRecorder } from './VoiceRecorder';
import type { AttachmentKind, ChatMessage, MessageAttachment, MessageKind, ReplyPreview } from '@/types';

export interface ComposerPayload {
  content: string;
  kind: MessageKind;
  attachments: MessageAttachment[];
  replyTo: ReplyPreview | null;
}

interface MessageComposerProps {
  conversationId: string;
  replyTo: ReplyPreview | null;
  onCancelReply: () => void;
  onSend: (payload: ComposerPayload) => void;
  /** When set, the composer becomes an inline editor for this message. */
  editingMessage?: ChatMessage | null;
  onEditSubmit?: (message: ChatMessage, content: string) => void;
  onCancelEdit?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

interface PendingAttachment extends MessageAttachment {
  progress: number;
}

const detectKind = (file: File): AttachmentKind => {
  const name = file.name.toLowerCase();
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.tar') || name.endsWith('.gz')) return 'archive';
  if (name.includes('certificate') || name.endsWith('.crt')) return 'certificate';
  return 'document';
};

const KIND_EMOJI: Record<AttachmentKind, string> = {
  image: '🖼️',
  pdf: '📄',
  document: '📝',
  certificate: '🎓',
  archive: '📦',
  video: '🎬',
  audio: '🎙️',
  other: '📎',
};

/** Premium floating composer — attachments, emoji, GIF, voice, drag & drop. */
export const MessageComposer: React.FC<MessageComposerProps> = ({
  conversationId,
  replyTo,
  onCancelReply,
  onSend,
  editingMessage = null,
  onEditSubmit,
  onCancelEdit,
  placeholder = 'Type a message…',
  disabled = false,
}) => {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState<PendingAttachment[]>([]);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [gifAnchor, setGifAnchor] = useState<HTMLElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const progressTimers = useRef<number[]>([]);

  const { emitTyping } = useTypingEmitter(conversationId);

  useEffect(() => {
    if (!editingMessage) setValue('');
  }, [editingMessage]);

  /* Clear any in-flight upload simulations on unmount. */
  useEffect(
    () => () => {
      progressTimers.current.forEach((timer) => window.clearInterval(timer));
      progressTimers.current = [];
    },
    [],
  );

  const clearTimers = () => {
    progressTimers.current.forEach((timer) => window.clearInterval(timer));
    progressTimers.current = [];
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: PendingAttachment[] = Array.from(files).map((file) => {
      const kind = detectKind(file);
      return {
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        kind,
        size: file.size,
        mimeType: file.type,
        emoji: KIND_EMOJI[kind] ?? '📎',
        progress: 0,
      };
    });

    setPending((current) => [...current, ...next]);

    next.forEach((attachment) => {
      const timer = window.setInterval(() => {
        setPending((current) =>
          current.map((item) =>
            item.id === attachment.id
              ? { ...item, progress: Math.min(100, item.progress + 8 + Math.random() * 14) }
              : item,
          ),
        );
      }, 140);
      progressTimers.current.push(timer);
      window.setTimeout(() => {
        window.clearInterval(timer);
        progressTimers.current = progressTimers.current.filter((t) => t !== timer);
      }, 2600);
    });
  }, []);

  const removePending = (id: string) => {
    setPending((current) => current.filter((item) => item.id !== id));
  };

  const readyAttachments = pending.filter((item) => item.progress >= 100).map((item) => {
    const { progress: _progress, ...rest } = item;
    void _progress;
    return rest;
  });

  const handleSend = () => {
    if (editingMessage && onEditSubmit) {
      const content = value.trim() || editingMessage.content.trim();
      if (!content) return;
      onEditSubmit(editingMessage, content);
      onCancelEdit?.();
      setValue('');
      return;
    }
    const content = value.trim();
    if (!content && readyAttachments.length === 0) return;
    onSend({ content, kind: 'text', attachments: readyAttachments, replyTo });
    setValue('');
    setPending([]);
    clearTimers();
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleVoiceComplete = (durationSeconds: number) => {
    const attachment: MessageAttachment = {
      id: `voice-${Date.now()}`,
      name: `voice-message-${Date.now()}.m4a`,
      kind: 'audio',
      size: 24_000 * durationSeconds,
      durationSeconds,
      emoji: '🎙️',
    };
    onSend({ content: 'Voice message', kind: 'voice', attachments: [attachment], replyTo });
  };

  const canSend = value.trim().length > 0 || readyAttachments.length > 0;

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 1.25, position: 'relative' }}>
      {/* Drag & drop overlay */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 8,
              borderRadius: 16,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(109,93,246,0.12)',
              backdropFilter: 'blur(6px)',
              border: '2px dashed rgba(109,93,246,0.6)',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'primary.main' }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 44, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Drop files to attach
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit preview */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{ marginBottom: 8 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 2.5,
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)',
                borderLeft: '3px solid',
                borderColor: 'warning.main',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="caption" fontWeight={800} color="warning.main">
                  Editing message
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {editingMessage.content}
                </Typography>
              </Box>
              <IconButton size="small" aria-label="Cancel edit" onClick={onCancelEdit}>
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && !editingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{ marginBottom: 8 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 2.5,
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.12)' : 'rgba(109,93,246,0.08)',
                borderLeft: '3px solid',
                borderColor: 'primary.main',
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  Replying to {replyTo.senderName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {replyTo.kind === 'voice' ? '🎙️ Voice message' : replyTo.content}
                </Typography>
              </Box>
              <IconButton size="small" aria-label="Cancel reply" onClick={onCancelReply}>
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending attachment chips */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}
          >
            {pending.map((attachment) => (
              <Box
                key={attachment.id}
                sx={{
                  width: 120,
                  p: 1,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  background: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ fontSize: 20 }}>{attachment.emoji}</Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>
                      {attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {formatFileSize(attachment.size)}
                    </Typography>
                  </Box>
                  <IconButton size="small" aria-label="Remove attachment" onClick={() => removePending(attachment.id)} sx={{ width: 20, height: 20 }}>
                    <CloseRoundedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={attachment.progress}
                  color={attachment.progress >= 100 ? 'success' : 'primary'}
                  sx={{ mt: 0.75, height: 4 }}
                />
              </Box>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer surface */}
      <Box
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
        }}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0.75,
          px: 1,
          py: 0.75,
          borderRadius: 3.5,
          border: 1,
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.03)',
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 4px rgba(109,93,246,0.14)',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          aria-hidden="true"
          data-testid="file-input"
          onChange={(event) => {
            if (event.target.files?.length) addFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <Tooltip title="Add emoji">
          <IconButton
            size="small"
            aria-label="Add emoji"
            onClick={(event) => {
              setEmojiAnchor(event.currentTarget);
              setGifAnchor(null);
            }}
          >
            <SentimentSatisfiedOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Attach files">
          <IconButton
            size="small"
            aria-label="Attach files"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Send a GIF">
          <IconButton
            size="small"
            aria-label="Send a GIF"
            onClick={(event) => {
              setGifAnchor(event.currentTarget);
              setEmojiAnchor(null);
            }}
          >
            <GifBoxOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <textarea
          ref={inputRef}
          value={editingMessage ? (value || editingMessage.content) : value}
          disabled={disabled}
          placeholder={editingMessage ? 'Edit your message…' : placeholder}
          aria-label="Message"
          rows={1}
          onChange={(event) => {
            setValue(event.target.value);
            emitTyping(true);
            const element = event.currentTarget;
            element.style.height = 'auto';
            element.style.height = `${Math.min(120, element.scrollHeight)}px`;
          }}
          onBlur={() => emitTyping(false)}
          onKeyDown={handleKeyDown}
          style={{
            flexGrow: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            color: 'inherit',
            maxHeight: 120,
            padding: '6px 2px',
          }}
        />

        <VoiceRecorder onComplete={handleVoiceComplete} />

        <motion.div whileTap={{ scale: 0.88 }}>
          <Tooltip title={canSend ? 'Send message' : 'Type a message'}>
            <Box
              role="button"
              aria-label="Send message"
              tabIndex={0}
              onClick={canSend && !disabled ? handleSend : undefined}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && canSend && !disabled) handleSend();
              }}
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: canSend ? '#fff' : 'text.disabled',
                background: canSend
                  ? gradients.brand
                  : (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
                cursor: canSend ? 'pointer' : 'default',
                boxShadow: canSend ? '0 4px 14px rgba(109,93,246,0.4)' : 'none',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': canSend
                  ? { transform: 'translateY(-1px)', boxShadow: '0 8px 20px rgba(109,93,246,0.5)' }
                  : {},
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
          </Tooltip>
        </motion.div>
      </Box>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75, px: 0.5, fontSize: '0.66rem' }}>
        <strong>Enter</strong> to send · <strong>Shift + Enter</strong> for a new line
      </Typography>

      {/* Emoji picker popover */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1.5, mt: -0.5 } } }}
      >
        <EmojiPicker
          onSelect={(emoji) => {
            setValue((current) => current + emoji);
            inputRef.current?.focus();
          }}
        />
      </Popover>

      {/* GIF picker popover */}
      <Popover
        open={Boolean(gifAnchor)}
        anchorEl={gifAnchor}
        onClose={() => setGifAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1.5, mt: -0.5 } } }}
      >
        <GifPicker
          onSelect={(label) => {
            setGifAnchor(null);
            onSend({ content: label, kind: 'gif', attachments: [], replyTo });
          }}
        />
      </Popover>
    </Box>
  );
};

export default MessageComposer;
