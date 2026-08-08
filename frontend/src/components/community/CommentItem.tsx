import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Button, IconButton, Menu, MenuItem, Tooltip, alpha } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { Avatar } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { renderMarkdownLite } from './markdown';
import { RichTextEditor } from './RichTextEditor';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} from '@/features/community';
import { useCurrentUserIdentity } from '@/hooks';
import { formatRelativeTime, showInfo } from '@/utils';
import type { CommunityComment } from '@/types';

interface CommentItemProps {
  comment: CommunityComment;
  postId: string;
  depth?: number;
  onReplyCreated?: () => void;
}

const EMOJI = ['👍', '❤️', '🔥', '👏', '😂'];

/** A single comment with nested replies, emoji reactions, edit, delete and collapse. */
export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  depth = 0,
  onReplyCreated,
}) => {
  const [replying, setReplying] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reactions, setReactions] = useState(comment.reactions ?? []);

  const likeMutation = useToggleCommentLikeMutation(postId, comment.id);
  const createReply = useCreateCommentMutation(postId);
  const deleteMutation = useDeleteCommentMutation(postId);
  const { userName: currentUserName } = useCurrentUserIdentity();

  const toggleReaction = (emoji: string) => {
    setReactions((current) => {
      const existing = current.find((r) => r.emoji === emoji);
      if (existing) {
        if (existing.reacted) {
          return current
            .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r))
            .filter((r) => r.count > 0);
        }
        return current.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r));
      }
      return [...current, { emoji, count: 1, reacted: true }];
    });
  };

  const submitReply = () => {
    const content = replyValue.trim();
    if (!content) return;
    createReply.mutate(
      { postId, parentId: comment.id, content, mentions: [] },
      {
        onSuccess: () => {
          setReplying(false);
          setReplyValue('');
          onReplyCreated?.();
        },
      },
    );
  };

  const submitEdit = () => {
    if (editValue.trim()) {
      // Local edit — comment editing is applied client-side (upgrade to PUT when live).
      comment.content = editValue.trim();
      comment.edited = true;
      showInfo('Comment updated');
    }
    setEditing(false);
  };

  if (comment.deleted) {
    return (
      <Typography variant="caption" color="text.disabled" sx={{ py: 1, display: 'block', fontStyle: 'italic' }}>
        [Comment removed]
      </Typography>
    );
  }

  const replies = comment.replies ?? [];
  const hasReplies = replies.length > 0;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', gap: 1.25 }}>
        <Avatar name={comment.authorName} size={34} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'transparent',
              transition: 'border-color 0.2s ease',
              '&:hover': { borderColor: alpha('#6D5DF6', 0.25) },
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.75}>
              <Typography variant="subtitle2" fontWeight={800} fontSize="0.85rem">
                {comment.authorName}
              </Typography>
              {comment.authorIsMentor && (
                <Tooltip title="Mentor">
                  <VerifiedIcon sx={{ fontSize: 14, color: 'primary.main' }} aria-label="Mentor" />
                </Tooltip>
              )}
              <Typography variant="caption" color="text.secondary">
                · {formatRelativeTime(comment.createdAt)}
                {comment.edited && ' · edited'}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton
                size="small"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label="Comment actions"
                sx={{ borderRadius: 1.5, ml: 1 }}
              >
                <MoreHorizIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem
                  dense
                  onClick={() => {
                    setAnchorEl(null);
                    setEditing(true);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setAnchorEl(null);
                    deleteMutation.mutate(comment.id);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  Delete
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => {
                    setAnchorEl(null);
                    showInfo('Report submitted — moderators will review it.');
                  }}
                >
                  Report
                </MenuItem>
              </Menu>
            </Stack>

            {editing ? (
              <Box sx={{ mt: 1 }}>
                <RichTextEditor value={editValue} onChange={setEditValue} minRows={2} />
                <Stack direction="row" gap={1} sx={{ mt: 1 }}>
                  <IconButton size="small" onClick={() => setEditing(false)} aria-label="Cancel edit">
                    ✕
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={submitEdit} aria-label="Save edit">
                    ✓
                  </IconButton>
                </Stack>
              </Box>
            ) : (
              <Box sx={{ mt: 0.5, fontSize: '0.88rem', lineHeight: 1.65 }}>
                {renderMarkdownLite(comment.content)}
              </Box>
            )}
          </Box>

          {/* Action row */}
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 0.5, px: 0.5 }}>
            {reactions.length > 0 && (
              <Stack direction="row" gap={0.5}>
                {reactions.map((reaction) => (
                  <Tooltip key={reaction.emoji} title={`${reaction.count}`} arrow>
                    <Box
                      component="button"
                      type="button"
                      onClick={() => toggleReaction(reaction.emoji)}
                      aria-pressed={reaction.reacted}
                      sx={{
                        border: 1,
                        borderColor: reaction.reacted ? 'primary.main' : 'divider',
                        borderRadius: 999,
                        px: 0.75,
                        py: 0.1,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        bgcolor: reaction.reacted ? 'action.selected' : 'transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                        '&:hover': { transform: 'scale(1.08)' },
                      }}
                    >
                      {reaction.emoji} {reaction.count}
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            )}
            <ReactionButton onClick={() => likeMutation.mutate(!comment.liked)} active={comment.liked}>
              {comment.liked ? <ThumbUpAltIcon sx={{ fontSize: 15 }} /> : <ThumbUpOffAltIcon sx={{ fontSize: 15 }} />}
              {comment.likeCount > 0 ? comment.likeCount : 'Like'}
            </ReactionButton>
            <ReactionButton onClick={() => setReplying((current) => !current)}>
              <ReplyIcon sx={{ fontSize: 15 }} /> Reply
            </ReactionButton>
            {hasReplies && (
              <ReactionButton onClick={() => setCollapsed((current) => !current)}>
                {collapsed ? <ChevronRightIcon sx={{ fontSize: 15 }} /> : <ExpandMoreIcon sx={{ fontSize: 15 }} />}
                {collapsed ? `${replies.length} hidden replies` : `Hide replies`}
              </ReactionButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {EMOJI.slice(0, 3).map((emoji) => (
              <Tooltip key={emoji} title="Add reaction" arrow>
                <Box
                  component="button"
                  type="button"
                  onClick={() => toggleReaction(emoji)}
                  aria-label={`React with ${emoji}`}
                  sx={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    opacity: 0.65,
                    transition: 'transform 0.15s ease, opacity 0.15s ease',
                    '&:hover': { transform: 'scale(1.25)', opacity: 1 },
                  }}
                >
                  {emoji}
                </Box>
              </Tooltip>
            ))}
          </Stack>

          {/* Inline reply composer */}
          <AnimatePresence>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <Box sx={{ mt: 1 }}>
                  <Stack direction="row" gap={1} alignItems="flex-start">
                    <Avatar name={currentUserName} size={30} />
                    <Box sx={{ flexGrow: 1 }}>
                      <RichTextEditor
                        value={replyValue}
                        onChange={setReplyValue}
                        placeholder={`Reply to ${comment.authorName}…`}
                        minRows={2}
                        autoFocus
                        onSubmit={submitReply}
                      />
                      <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setReplying(false);
                            setReplyValue('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={!replyValue.trim() || createReply.isPending}
                          onClick={submitReply}
                          aria-label="Submit reply"
                        >
                          {createReply.isPending ? 'Posting…' : 'Reply'}
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested replies */}
          {!collapsed && hasReplies && (
            <Box sx={{ mt: 1, ml: { xs: 0, sm: 3 }, pl: { xs: 0, sm: 2 }, borderLeft: { xs: 'none', sm: 2 }, borderColor: 'divider' }}>
              {replies.map((reply) => (
                <Box key={reply.id} sx={{ mt: 1 }}>
                  <CommentItem comment={reply} postId={postId} depth={depth + 1} onReplyCreated={onReplyCreated} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const ReactionButton: React.FC<{ onClick?: () => void; active?: boolean; children: React.ReactNode }> = ({
  onClick,
  active = false,
  children,
}) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      border: 'none',
      background: 'transparent',
      cursor: onClick ? 'pointer' : 'default',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.5,
      fontSize: '0.78rem',
      fontWeight: 700,
      color: active ? 'primary.main' : 'text.secondary',
      px: 0.75,
      py: 0.35,
      borderRadius: 1.5,
      transition: 'background-color 0.15s ease, color 0.15s ease',
      '&:hover': { bgcolor: 'action.hover' },
    }}
  >
    {children}
  </Box>
);

export default CommentItem;
