import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Button, Chip, IconButton, InputBase, MenuItem, TextField, Tooltip, alpha } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { RichTextEditor } from './RichTextEditor';
import { TagChip } from './TagChip';
import { extractHashtags, extractMentions } from './markdown';
import { useCommunityDraft, useCreatePostMutation } from '@/features/community';
import { CURRENT_USER_NAME, seedCommunities } from '@/features/community/data';
import { getStoredValue, setStoredValue, showInfo, showSuccess } from '@/utils';
import { STORAGE_KEYS } from '@/constants';
import type { Community, PostAttachment, PostContentType } from '@/types';

interface PostComposerProps {
  communityId?: string;
  communities?: Community[];
  onPosted?: () => void;
}

interface ComposerDraftShape {
  content: string;
  tags: string[];
  communityId?: string;
}

const DRAFT_KEY = 'composer';

/** Premium post editor: rich text, attachments, polls, tags and draft saving. */
export const PostComposer: React.FC<PostComposerProps> = ({
  communityId,
  communities = [],
  onPosted,
}) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string | undefined>(communityId);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeValue, setCodeValue] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { draft, save: saveDraft, clear: clearDraft } = useCommunityDraft(DRAFT_KEY);
  const createPost = useCreatePostMutation(communityId ?? selectedCommunity);

  /* Rehydrate from Redux draft (session) or localStorage (persistent). */
  useEffect(() => {
    if (draft) {
      const payload = draft.payload as ComposerDraftShape;
      setContent(payload.content ?? '');
      setTags(payload.tags ?? []);
      if (payload.communityId) setSelectedCommunity(payload.communityId);
    } else {
      const stored = getStoredValue<ComposerDraftShape | null>(STORAGE_KEYS.COMMUNITY_DRAFT, null);
      if (stored) {
        setContent(stored.content ?? '');
        setTags(stored.tags ?? []);
        if (stored.communityId) setSelectedCommunity(stored.communityId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDraft = () => {
    const shape: ComposerDraftShape = {
      content,
      tags,
      communityId: selectedCommunity,
    };
    saveDraft(shape);
    setStoredValue(STORAGE_KEYS.COMMUNITY_DRAFT, shape);
    showSuccess('Draft saved ✍️');
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const docFiles = files.filter((file) => !file.type.startsWith('image/'));

    const imageAttachments: PostAttachment[] = imageFiles.map((file, index) => ({
      id: `att-img-${Date.now()}-${index}`,
      type: 'IMAGE',
      url: URL.createObjectURL(file),
      title: file.name,
    }));
    const docAttachments: PostAttachment[] = docFiles.map((file, index) => ({
      id: `att-doc-${Date.now()}-${index}`,
      type: 'DOCUMENT',
      fileName: file.name,
      fileSize: file.size,
      title: file.name,
    }));

    setAttachments((current) => [...current, ...imageAttachments, ...docAttachments]);
    event.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags((current) => [...current, trimmed]);
    }
    setTagInput('');
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) setPollOptions((current) => [...current, '']);
  };

  const submit = () => {
    const trimmedContent = content.trim();
    const validPoll = showPoll && pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2;

    if (!trimmedContent && attachments.length === 0 && !validPoll && !(showCode && codeValue.trim())) {
      showInfo('Add some content to your post first.');
      return;
    }

    const mergedTags = [...new Set([...tags, ...extractHashtags(trimmedContent)])].slice(0, 5);
    const mentions = extractMentions(trimmedContent);
    const builtAttachments = [...attachments];
    if (showCode && codeValue.trim()) {
      builtAttachments.push({
        id: `att-code-${Date.now()}`,
        type: 'CODE',
        language: codeLanguage,
        code: codeValue.trim(),
      });
    }

    createPost.mutate(
      {
        communityId: selectedCommunity,
        content: trimmedContent || (builtAttachments[0]?.title ?? 'Shared an attachment'),
        contentType: (builtAttachments[0]?.type ?? (validPoll ? 'POLL' : 'TEXT')) as PostContentType,
        attachments: builtAttachments,
        poll: validPoll
          ? {
              question: pollQuestion.trim(),
              options: pollOptions.filter((o) => o.trim()).map((o) => o.trim()),
            }
          : undefined,
        tags: mergedTags,
        mentions,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setContent('');
          setTags([]);
          setAttachments([]);
          setCodeValue('');
          setShowCode(false);
          setPollQuestion('');
          setPollOptions(['', '']);
          setShowPoll(false);
          clearDraft();
          setStoredValue(STORAGE_KEYS.COMMUNITY_DRAFT, null);
          onPosted?.();
        },
      },
    );
  };

  const contentTypeLabel = showCode
    ? 'Code'
    : showPoll
      ? 'Poll'
      : attachments[0]?.type === 'IMAGE'
        ? 'Image'
        : attachments[0]?.type === 'DOCUMENT'
          ? 'Document'
          : 'Text';

  return (
    <Card
      sx={{
        p: 2,
        borderColor: open ? 'primary.main' : 'divider',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        ...(open && { boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.14)}` }),
      }}
    >
      {!open ? (
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar name={CURRENT_USER_NAME} size={42} />
          <Box
            onClick={() => setOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') setOpen(true);
            }}
            sx={{
              flexGrow: 1,
              px: 2,
              py: 1.4,
              borderRadius: 999,
              border: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '0.9rem',
              cursor: 'text',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            Share something with the community…
          </Box>
          <Button variant="contained" onClick={() => setOpen(true)} disabled={createPost.isPending}>
            Post
          </Button>
        </Stack>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar name={CURRENT_USER_NAME} size={42} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {CURRENT_USER_NAME}
                  </Typography>
                  {communities.length > 0 && !communityId ? (
                    <TextField
                      select
                      size="small"
                      value={selectedCommunity ?? ''}
                      onChange={(event) => setSelectedCommunity(event.target.value || undefined)}
                      sx={{ mt: 0.5, minWidth: 200 }}
                    >
                      <MenuItem value="">🌐 General feed</MenuItem>
                      {communities.map((community) => (
                        <MenuItem key={community.id} value={community.id}>
                          {community.emoji} {community.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    communityId && (
                      <Chip
                        size="small"
                        label={`${seedCommunitiesFor(communityId)}`}
                        variant="outlined"
                        sx={{ mt: 0.5, fontWeight: 700 }}
                      />
                    )
                  )}
                </Box>
                <Tooltip title="Close editor">
                  <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close composer">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Share an insight, question, win or resource…"
                minRows={3}
                autoFocus
                onSubmit={submit}
              />

              {/* Attachments preview */}
              {attachments.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {attachments.map((attachment) => (
                    <Box
                      key={attachment.id}
                      sx={{
                        position: 'relative',
                        width: attachment.type === 'IMAGE' ? 120 : 200,
                        height: attachment.type === 'IMAGE' ? 120 : 54,
                        borderRadius: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: attachment.type === 'IMAGE' ? 0 : 1,
                      }}
                    >
                      {attachment.type === 'IMAGE' ? (
                        <img src={attachment.url} alt={attachment.title ?? 'attachment'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main' }} />
                          <Typography fontSize="0.78rem" fontWeight={700} noWrap>
                            {attachment.fileName}
                          </Typography>
                        </>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => removeAttachment(attachment.id)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        aria-label="Remove attachment"
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Code block */}
              {showCode && (
                <Box>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
                    <TextField
                      select
                      size="small"
                      value={codeLanguage}
                      onChange={(event) => setCodeLanguage(event.target.value)}
                      sx={{ minWidth: 160 }}
                    >
                      {['javascript', 'typescript', 'java', 'python', 'sql', 'bash', 'json'].map((language) => (
                        <MenuItem key={language} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton size="small" onClick={() => setShowCode(false)} aria-label="Remove code block">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Box
                    component="textarea"
                    value={codeValue}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setCodeValue(event.target.value)}
                    placeholder="Paste your code snippet here…"
                    rows={5}
                    aria-label="Code snippet"
                    sx={{
                      width: '100%',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.82rem',
                      lineHeight: 1.6,
                      p: 1.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      background: 'rgba(15,23,42,0.92)',
                      color: '#E6E9F2',
                      outline: 'none',
                      resize: 'vertical',
                      '&:focus': { borderColor: 'primary.main' },
                    }}
                  />
                </Box>
              )}

              {/* Poll builder */}
              {showPoll && (
                <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography fontSize="0.82rem" fontWeight={800}>
                      Create a poll
                    </Typography>
                    <IconButton size="small" onClick={() => setShowPoll(false)} aria-label="Remove poll">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Poll question"
                    value={pollQuestion}
                    onChange={(event) => setPollQuestion(event.target.value)}
                    sx={{ mb: 1 }}
                  />
                  {pollOptions.map((option, index) => (
                    <Stack key={index} direction="row" gap={1} sx={{ mb: 0.75 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(event) =>
                          setPollOptions((current) => current.map((o, i) => (i === index ? event.target.value : o)))
                        }
                      />
                      {pollOptions.length > 2 && (
                        <IconButton
                          size="small"
                          onClick={() => setPollOptions((current) => current.filter((_, i) => i !== index))}
                          aria-label={`Remove option ${index + 1}`}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                  {pollOptions.length < 4 && (
                    <Button size="small" onClick={addPollOption} sx={{ mt: 0.5 }}>
                      + Add option
                    </Button>
                  )}
                </Box>
              )}

              {/* Tags */}
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                {tags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    onClick={() => setTags((current) => current.filter((t) => t !== tag))}
                  />
                ))}
                <InputBase
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="+ Add tags"
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    border: 1,
                    borderColor: 'divider',
                    fontSize: '0.8rem',
                    '&:focus-within': { borderColor: 'primary.main' },
                  }}
                />
              </Stack>

              {/* Footer actions */}
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ pt: 0.5, borderTop: 1, borderColor: 'divider' }}>
                <Tooltip title="Add image">
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()} aria-label="Add image">
                    <AddPhotoAlternateOutlinedIcon fontSize="small" color="success" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add document">
                  <IconButton size="small" onClick={() => fileInputRef.current?.click()} aria-label="Add document">
                    <DescriptionOutlinedIcon fontSize="small" color="info" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add code snippet">
                  <IconButton size="small" onClick={() => setShowCode((current) => !current)} aria-label="Add code snippet">
                    <CodeOutlinedIcon fontSize="small" color="warning" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Create poll">
                  <IconButton size="small" onClick={() => setShowPoll((current) => !current)} aria-label="Create poll">
                    <HowToVoteOutlinedIcon fontSize="small" color="secondary" />
                  </IconButton>
                </Tooltip>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  multiple
                  hidden
                  onChange={handleFiles}
                  aria-label="Upload files"
                />

                <Stack direction="row" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
                  <Chip
                    icon={<ImageOutlinedIcon sx={{ fontSize: 14 }} />}
                    label={contentTypeLabel}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                  />
                  <Button size="small" startIcon={<SaveOutlinedIcon />} onClick={persistDraft} disabled={!content.trim() && tags.length === 0}>
                    Save draft
                  </Button>
                  <Button variant="contained" size="small" onClick={submit} disabled={createPost.isPending}>
                    {createPost.isPending ? 'Posting…' : 'Publish'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </motion.div>
        </AnimatePresence>
      )}
    </Card>
  );
};

const seedCommunitiesFor = (communityId: string): string => {
  const community = seedCommunities.find((c) => c.id === communityId);
  return community ? `${community.emoji} ${community.name}` : communityId;
};

export default PostComposer;
