import { useMemo, useState } from 'react';
import { Box, Chip, IconButton, Menu, MenuItem, Tooltip, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VerifiedIcon from '@mui/icons-material/Verified';
import PushPinIcon from '@mui/icons-material/PushPin';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import LinkIcon from '@mui/icons-material/Link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { ReactionBar } from './ReactionBar';
import { PollCard } from './PollCard';
import { TagChip } from './TagChip';
import { estimateReadTime, renderMarkdownLite } from './markdown';
import {
  useDeletePostMutation,
  useReportMutation,
  useSharePost,
  useToggleBookmarkMutation,
  useToggleLikeMutation,
  useVotePollMutation,
} from '@/features/community';
import { formatRelativeTime } from '@/utils';
import { ROUTES } from '@/constants';
import { seedCommunities } from '@/features/community/data';
import type { CommunityPost } from '@/types';

interface PostCardProps {
  post: CommunityPost;
  onOpen?: (post: CommunityPost) => void;
  onClickMention?: (name: string) => void;
  /** Render without the outer motion entrance (e.g. inside virtual lists). */
  plain?: boolean;
  onDeleted?: (postId: string) => void;
}

const IMAGE_GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #6D5DF6, #43C6C0)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
];

/** Premium post card — text, images, video, docs, code, links and polls. */
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpen,
  onClickMention,
  plain = false,
  onDeleted,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const likeMutation = useToggleLikeMutation(post.id);
  const bookmarkMutation = useToggleBookmarkMutation(post.id);
  const votePollMutation = useVotePollMutation(post.id);
  const deleteMutation = useDeletePostMutation();
  const reportMutation = useReportMutation();
  const { share } = useSharePost();

  const openPost = () => {
    if (onOpen) onOpen(post);
    else navigate(ROUTES.COMMUNITY_POST.replace(':postId', post.id));
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${ROUTES.COMMUNITY_POST.replace(':postId', post.id)}`;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
    setAnchorEl(null);
  };

  const handleDelete = () => {
    setAnchorEl(null);
    deleteMutation.mutate(post.id, {
      onSuccess: () => onDeleted?.(post.id),
    });
  };

  const handleReport = (reason: string) => {
    setAnchorEl(null);
    reportMutation.mutate({ targetType: 'POST', targetId: post.id, reason });
  };

  const imageGradient = useMemo(
    () => IMAGE_GRADIENT_FALLBACKS[(post.id.length + post.content.length) % IMAGE_GRADIENT_FALLBACKS.length],
    [post.id, post.content],
  );

  const readTime = estimateReadTime(post.content);

  const card = (
    <Card
      sx={{
        p: { xs: 2, md: 2.5 },
        overflow: 'visible',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 8,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
        },
      }}
    >
      {/* ---------- Header ---------- */}
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Avatar name={post.authorName} size={44} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {post.authorName}
            </Typography>
            {post.authorVerified && (
              <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} aria-label="Verified member" />
            )}
            {post.authorIsMentor && (
              <Tooltip title="Mentor">
                <WorkspacePremiumIcon sx={{ fontSize: 15, color: '#F59E0B' }} aria-label="Mentor" />
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ color: 'text.secondary' }}>
            {post.authorTitle && (
              <Typography variant="caption" noWrap sx={{ maxWidth: 160 }}>
                {post.authorTitle}
              </Typography>
            )}
            <Typography variant="caption">·</Typography>
            <Stack direction="row" alignItems="center" gap={0.25}>
              <ScheduleOutlinedIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption">{formatRelativeTime(post.createdAt)}</Typography>
            </Stack>
          </Stack>
        </Box>

        {post.pinned && (
          <Chip
            icon={<PushPinIcon sx={{ fontSize: 14 }} />}
            label="Pinned"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 800, display: { xs: 'none', sm: 'inline-flex' } }}
          />
        )}
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Post actions"
          sx={{ borderRadius: 2 }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleCopyLink} dense>
            <ContentCopyIcon fontSize="small" sx={{ mr: 1.25 }} />
            {copied ? 'Copied!' : 'Copy link'}
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); bookmarkMutation.mutate(!post.bookmarked); }} dense>
            <LinkIcon fontSize="small" sx={{ mr: 1.25 }} />
            {post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
          </MenuItem>
          <MenuItem onClick={() => handleReport('Inappropriate content')} dense>
            <LinkIcon fontSize="small" sx={{ mr: 1.25 }} />
            Report
          </MenuItem>
          {post.authorId === 'u-me' && (
            <MenuItem onClick={handleDelete} dense sx={{ color: 'error.main' }}>
              <LinkIcon fontSize="small" sx={{ mr: 1.25 }} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </Stack>

      {/* ---------- Community + tags ---------- */}
      {(post.communityName || (post.tags ?? []).length > 0) && (
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          {post.communityName && post.communitySlug && (
            <Chip
              size="small"
              label={post.communityName}
              variant="outlined"
              color="secondary"
              onClick={(event) => {
                event.stopPropagation();
                const community = communitySlugToId(post.communitySlug!);
                if (community) navigate(ROUTES.COMMUNITY_DETAILS.replace(':communityId', community));
              }}
              sx={{ fontWeight: 800, cursor: 'pointer' }}
            />
          )}
          {(post.tags ?? []).slice(0, 4).map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {readTime > 1 && post.contentType === 'TEXT' && (
            <Typography variant="caption" color="text.disabled">
              {readTime} min read
            </Typography>
          )}
        </Stack>
      )}

      {/* ---------- Body ---------- */}
      <Box sx={{ mt: 1.5, cursor: 'pointer' }} onClick={openPost} role="link" tabIndex={0} aria-label={`Open post: ${post.title ?? post.content.slice(0, 40)}`}>
        {post.title && (
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1, letterSpacing: '-0.01em' }}>
            {post.title}
          </Typography>
        )}
        <Box sx={{ fontSize: '0.92rem', lineHeight: 1.75, color: 'text.primary' }}>
          {renderMarkdownLite(post.content, { onClickMention })}
        </Box>

        {/* Attachments */}
        {post.attachments?.map((attachment) => {
          if (attachment.type === 'IMAGE') {
            return (
              <Box key={attachment.id} sx={{ mt: 1.5, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                {!imgFailed ? (
                  <img
                    src={attachment.url}
                    alt={attachment.title ?? 'Post image'}
                    loading="lazy"
                    onError={() => setImgFailed(true)}
                    style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: imageGradient,
                      color: '#fff',
                      fontSize: '3rem',
                    }}
                  >
                    🖼️
                  </Box>
                )}
              </Box>
            );
          }
          if (attachment.type === 'CODE') {
            return (
              <Box key={attachment.id} sx={{ mt: 1.5, borderRadius: 2.5, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 0.75, bgcolor: 'rgba(15,23,42,0.95)' }}>
                  <Typography fontSize="0.75rem" fontWeight={700} color="#8E80FF" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {attachment.language ?? 'code'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      navigator.clipboard?.writeText(attachment.code ?? '').catch(() => undefined);
                    }}
                    aria-label="Copy code"
                    sx={{ color: 'text.secondary', '&:hover': { color: '#fff' } }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Stack>
                <pre
                  style={{
                    margin: 0,
                    padding: '14px 16px',
                    overflowX: 'auto',
                    fontSize: '0.8rem',
                    lineHeight: 1.65,
                    fontFamily: '"JetBrains Mono", monospace',
                    background: 'rgba(15,23,42,0.92)',
                    color: '#E6E9F2',
                    whiteSpace: 'pre',
                  }}
                >
                  {attachment.code}
                </pre>
              </Box>
            );
          }
          if (attachment.type === 'LINK') {
            return (
              <Box
                key={attachment.id}
                component="a"
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                sx={{
                  mt: 1.5,
                  p: 2,
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)' },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: imageGradient,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  <LinkIcon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: 'text.primary' }}>
                    {attachment.title ?? 'Shared link'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {attachment.provider ?? attachment.url}
                  </Typography>
                </Box>
              </Box>
            );
          }
          if (attachment.type === 'VIDEO') {
            return (
              <Box key={attachment.id} sx={{ mt: 1.5, borderRadius: 3, overflow: 'hidden', position: 'relative', background: imageGradient, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={(event) => event.stopPropagation()}>
                <motion.div whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.94 }}>
                  <PlayArrowIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.92)', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.35))' }} />
                </motion.div>
                <Typography sx={{ position: 'absolute', bottom: 12, left: 16, color: '#fff', fontWeight: 700, fontSize: '0.85rem', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {attachment.title ?? 'Video'}
                </Typography>
              </Box>
            );
          }
          return (
            <Box key={attachment.id} sx={{ mt: 1.5, p: 1.75, borderRadius: 2.5, border: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main' }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {attachment.fileName ?? attachment.title}
                </Typography>
                {attachment.fileSize && (
                  <Typography variant="caption" color="text.secondary">
                    {(attachment.fileSize / 1_000_000).toFixed(1)} MB
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}

        {/* Poll */}
        {post.poll && <PollCard poll={post.poll} onVote={(optionIds) => votePollMutation.mutate(optionIds)} />}
      </Box>

      {/* ---------- Reactions ---------- */}
      <ReactionBar
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        bookmarkCount={post.bookmarkCount}
        liked={post.liked}
        bookmarked={post.bookmarked}
        onLike={(liked) => likeMutation.mutate(liked)}
        onComment={openPost}
        onBookmark={(bookmarked) => bookmarkMutation.mutate(bookmarked)}
        onShare={() => share(post)}
      />
    </Card>
  );

  if (plain) return card;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {card}
    </motion.div>
  );
};

const communitySlugToId = (slug: string): string | null =>
  seedCommunities.find((c) => c.slug === slug)?.id ?? null;

export default PostCard;
