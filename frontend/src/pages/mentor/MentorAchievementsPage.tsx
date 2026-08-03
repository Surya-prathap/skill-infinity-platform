import { useMemo, useState } from 'react';
import { Alert, Box, Button as MuiButton, Chip, Grid, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/feedback';
import { ConfirmDialog } from '@/components/feedback';
import { AchievementCard, AnalyticsCard, GradientCard } from '@/components/mentor';
import { useDocumentTitle } from '@/hooks';
import { formatDate, getStoredValue, setStoredValue, showSuccess } from '@/utils';
import { AchievementEditor } from '@/features/mentor/components';
import { ACHIEVEMENT_TYPES } from '@/features/mentor/constants';
import {
  useAchievementsQuery,
  useAddAchievementMutation,
  useDeleteAchievementMutation,
  useMentorProfileQuery,
  useUpdateAchievementMutation,
} from '@/features/mentor/hooks';
import type { MentorAchievement } from '@/types';

const FEATURED_KEY = 'skill_mentor_featured_achievements';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  BADGE: { icon: <MilitaryTechOutlinedIcon />, color: '#8B5CF6', label: 'Badges' },
  AWARD: { icon: <EmojiEventsOutlinedIcon />, color: '#F59E0B', label: 'Awards' },
  MILESTONE: { icon: <TrackChangesOutlinedIcon />, color: '#10B981', label: 'Milestones' },
  HIGHLIGHT: { icon: <LocalFireDepartmentOutlinedIcon />, color: '#EC4899', label: 'Highlights' },
};

const TYPE_META = ACHIEVEMENT_TYPES.reduce<Record<string, { label: string; color: string }>>(
  (acc, option) => {
    const value = String(option.value);
    acc[value] = { label: option.label, color: TYPE_ICONS[value]?.color ?? '#6D5DF6' };
    return acc;
  },
  {},
);

export const MentorAchievementsPage: React.FC = () => {
  useDocumentTitle('Achievements');
  const { mentor } = useMentorProfileQuery();
  const mentorId = mentor?.id;
  const { achievements, isOffline } = useAchievementsQuery(mentorId);
  const addMutation = useAddAchievementMutation(mentorId);
  const updateMutation = useUpdateAchievementMutation(mentorId);
  const deleteMutation = useDeleteAchievementMutation(mentorId);

  const [filter, setFilter] = useState<string>('ALL');
  const [featuredIds, setFeaturedIds] = useState<string[]>(() =>
    getStoredValue<string[]>(FEATURED_KEY, []),
  );
  const [editor, setEditor] = useState<{
    open: boolean;
    editing: boolean;
    item: MentorAchievement | null;
  }>({
    open: false,
    editing: false,
    item: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<MentorAchievement | null>(null);

  const visible = useMemo(
    () => (filter === 'ALL' ? achievements : achievements.filter((item) => item.type === filter)),
    [achievements, filter],
  );

  const featured = achievements.filter((item) => item.id && featuredIds.includes(item.id));

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: achievements.length };
    ACHIEVEMENT_TYPES.forEach((option) => {
      const value = String(option.value);
      result[value] = achievements.filter((item) => item.type === value).length;
    });
    return result;
  }, [achievements]);

  const toggleFeatured = (achievement: MentorAchievement) => {
    if (!achievement.id) return;
    const next = featuredIds.includes(achievement.id)
      ? featuredIds.filter((id) => id !== achievement.id)
      : [...featuredIds, achievement.id];
    setFeaturedIds(next);
    setStoredValue(FEATURED_KEY, next);
    showSuccess(next.includes(achievement.id) ? 'Achievement featured' : 'Removed from featured');
  };

  const handleSubmit = (values: Omit<MentorAchievement, 'id'>) => {
    if (editor.editing && editor.item?.id) {
      updateMutation.mutate({ achievementId: editor.item.id, payload: values });
    } else {
      addMutation.mutate(values);
    }
    setEditor({ open: false, editing: false, item: null });
  };

  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id);
    const nextFeatured = featuredIds.filter((id) => id !== deleteTarget.id);
    setFeaturedIds(nextFeatured);
    setStoredValue(FEATURED_KEY, nextFeatured);
    setDeleteTarget(null);
  };

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="hero" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <EmojiEventsOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Achievements
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {achievements.length} achievements · {featured.length} featured
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
          <MuiButton
            variant="contained"
            size="large"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setEditor({ open: true, editing: false, item: null })}
            sx={{
              bgcolor: '#fff',
              color: '#5443D4',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
            }}
          >
            Add achievement
          </MuiButton>
        </Stack>
      </GradientCard>

      {/* ================= Type summary ================= */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {ACHIEVEMENT_TYPES.map((option, index) => {
          const value = String(option.value);
          const meta = TYPE_ICONS[value];
          return (
            <Grid key={value} size={{ xs: 6, sm: 3 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={index}
                style={{ height: '100%' }}
              >
                <Card
                  hoverable
                  sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      background: `linear-gradient(135deg, ${meta.color}, ${meta.color}AA)`,
                      boxShadow: `0 6px 16px ${meta.color}40`,
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                      {counts[value] ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {meta.label}
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* ================= Editor ================= */}
      {editor.open && (
        <Card sx={{ mb: 3, p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {editor.editing ? 'Edit achievement' : 'Add an achievement'}
            </Typography>
            <Tooltip title="Close">
              <IconButton
                size="small"
                aria-label="Close editor"
                onClick={() => setEditor({ open: false, editing: false, item: null })}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <AchievementEditor
            initial={editor.item}
            onCancel={() => setEditor({ open: false, editing: false, item: null })}
            onSubmit={handleSubmit}
          />
        </Card>
      )}

      {/* ================= Featured ================= */}
      {featured.length > 0 && (
        <AnalyticsCard
          title="Featured Achievements"
          subtitle="Highlighted at the top of your public profile"
          icon={<StarOutlinedIcon />}
          iconColor="#F59E0B"
          sx={{ mb: 3 }}
        >
          <Grid container spacing={2.5}>
            {featured.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <AchievementCard
                  achievement={item}
                  featured
                  onToggleFeatured={toggleFeatured}
                  onEdit={(achievement) =>
                    setEditor({ open: true, editing: true, item: achievement })
                  }
                  onDelete={setDeleteTarget}
                />
              </Grid>
            ))}
          </Grid>
        </AnalyticsCard>
      )}

      {/* ================= All achievements ================= */}
      <AnalyticsCard
        title="All Achievements"
        subtitle="Badges, awards, milestones and highlights"
        icon={<EmojiEventsOutlinedIcon />}
        iconColor="#6D5DF6"
        action={
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              size="small"
              label="All"
              clickable
              onClick={() => setFilter('ALL')}
              sx={{
                fontWeight: 700,
                ...(filter === 'ALL' && { bgcolor: 'primary.main', color: 'primary.contrastText' }),
              }}
            />
            {ACHIEVEMENT_TYPES.map((option) => {
              const value = String(option.value);
              return (
                <Chip
                  key={value}
                  size="small"
                  label={TYPE_META[value]?.label ?? option.label}
                  clickable
                  onClick={() => setFilter(value)}
                  sx={{
                    fontWeight: 700,
                    ...(filter === value && {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }),
                  }}
                />
              );
            })}
          </Stack>
        }
      >
        {visible.length === 0 ? (
          achievements.length === 0 ? (
            <EmptyState
              icon={<EmojiEventsOutlinedIcon sx={{ fontSize: 36 }} />}
              title="No achievements yet"
              description="Add badges, awards and milestones to celebrate your journey and build credibility."
              actionLabel="Add achievement"
              onAction={() => setEditor({ open: true, editing: false, item: null })}
            />
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              No achievements of this type yet.
            </Alert>
          )
        ) : (
          <Grid container spacing={2.5}>
            {visible.map((item, index) => (
              <Grid key={item.id ?? `${item.title}-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={index}
                  style={{ height: '100%' }}
                >
                  <AchievementCard
                    achievement={item}
                    featured={Boolean(item.id && featuredIds.includes(item.id))}
                    onToggleFeatured={toggleFeatured}
                    onEdit={(achievement) =>
                      setEditor({ open: true, editing: true, item: achievement })
                    }
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </AnalyticsCard>

      {/* ================= Timeline ================= */}
      {achievements.length > 0 && (
        <AnalyticsCard
          title="Achievement Timeline"
          subtitle="Your journey in chronological order"
          icon={<AutoGraphOutlinedIcon />}
          iconColor="#14B8A6"
          sx={{ mt: 3 }}
        >
          <Timeline
            items={[...achievements]
              .sort((a, b) => {
                const ta = a.dateAchieved ? new Date(a.dateAchieved).getTime() : 0;
                const tb = b.dateAchieved ? new Date(b.dateAchieved).getTime() : 0;
                return tb - ta;
              })
              .map((item) => {
                const meta = TYPE_ICONS[item.type ?? ''] ?? TYPE_ICONS.AWARD;
                return {
                  title: item.title,
                  description: item.description,
                  time: item.dateAchieved ? formatDate(item.dateAchieved) : undefined,
                  icon: meta.icon,
                  color: meta.color,
                };
              })}
          />
        </AnalyticsCard>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete achievement?"
        message={`“${deleteTarget?.title ?? ''}” will be permanently removed from your profile.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default MentorAchievementsPage;
