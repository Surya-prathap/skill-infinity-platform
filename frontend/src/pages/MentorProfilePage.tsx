import { useMemo } from 'react';
import { Box, Button, Chip, Grid, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState, ErrorState } from '@/components/feedback';
import { MentorHero } from '@/components/marketplace';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { useMentorProfile, useMentorSearch } from '@/features/marketplace';
import { useMentorReviewsQuery } from '@/features/reviews';
import { formatDate, formatCompactNumber } from '@/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export const MentorProfilePage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();

  const { mentor, isOffline } = useMentorProfile(mentorId);
  useDocumentTitle(mentor?.profile?.headline ?? 'Mentor profile');

  const { reviews } = useMentorReviewsQuery(mentorId, undefined, 'RECENT');
  const relatedQuery = useMentorSearch({
    page: 0,
    size: 4,
    sortBy: 'rating',
    sortDirection: 'DESC',
  });
  const related = useMemo(
    () => relatedQuery.data.content.filter((m) => m.id !== mentorId).slice(0, 3),
    [relatedQuery.data.content, mentorId],
  );

  if (isOffline && !mentor) {
    return (
      <ErrorState
        title="Mentor not found"
        message="We couldn't load this mentor profile. It may have been removed."
        actionLabel="Back to mentors"
        onAction={() => navigate(ROUTES.MENTORS)}
      />
    );
  }

  if (!mentor) {
    return (
      <Box sx={{ py: 6 }}>
        <EmptyState title="Loading mentor…" />
      </Box>
    );
  }

  const profile = mentor.profile;
  const stats = mentor.statistics;
  const pricing = mentor.pricingList ?? [];
  const certifications = mentor.certifications ?? [];
  const achievements = mentor.achievements ?? [];
  const languages = mentor.languages ?? [];
  const skills = mentor.expertiseList ?? [];
  const availabilities = mentor.availabilities ?? [];

  const book = () => navigate(ROUTES.BOOK_SESSION.replace(':mentorId', mentor.id));

  return (
    <Box>
      {/* Back */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(ROUTES.MENTORS)}
        sx={{ mb: 2.5 }}
      >
        Back to mentors
      </Button>

      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <MentorHero mentor={mentor} />
      </motion.div>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* ================= Main column ================= */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* About */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
              <SectionHeader
                icon={<WorkspacePremiumOutlinedIcon />}
                iconColor="#6D5DF6"
                title="About"
                subtitle="Who you'll be learning with"
              />
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {profile?.aboutMe ?? profile?.bio ?? 'This mentor is building their story — reach out to learn more.'}
              </Typography>

              {(profile?.website || profile?.phone) && (
                <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mt: 2.5 }}>
                  {profile?.website && (
                    <Typography variant="caption" fontWeight={600} color="primary.main">
                      <a href={profile.website} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {profile.website}
                      </a>
                    </Typography>
                  )}
                </Stack>
              )}
            </Card>
          </motion.div>

          {/* Skills */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
              <SectionHeader
                icon={<SchoolOutlinedIcon />}
                iconColor="#14B8A6"
                title="Expertise & Skills"
                subtitle="Core areas this mentor teaches"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                {skills.map((skill) => (
                  <Box
                    key={skill.id ?? skill.skillName}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      transition: 'border-color 0.2s ease, transform 0.2s ease',
                      '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={800}>
                      {skill.skillName ?? skill.customSkillName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[skill.categoryName, skill.subCategoryName].filter(Boolean).join(' · ')}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 90 }}>
                        {skill.yearsOfExperience ?? 0}+ yrs
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(((skill.yearsOfExperience ?? 0) / 12) * 100, 100)}
                          sx={{ height: 6, borderRadius: 999 }}
                        />
                      </Box>
                      <Typography variant="caption" fontWeight={700} color="primary.main">
                        {skill.proficiencyLevel ?? 'EXPERT'}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Card>
          </motion.div>

          {/* Experience */}
          {mentor.experiences && mentor.experiences.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                <SectionHeader
                  icon={<WorkOutlineOutlinedIcon />}
                  iconColor="#3B82F6"
                  title="Experience"
                  subtitle="Career highlights"
                />
                <Stack spacing={2}>
                  {mentor.experiences.map((exp, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          mt: 0.75,
                          bgcolor: 'primary.main',
                          boxShadow: '0 0 0 4px rgba(109,93,246,0.15)',
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {exp.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exp.company} · {formatDate(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                <SectionHeader
                  icon={<BadgeOutlinedIcon />}
                  iconColor="#F59E0B"
                  title="Certifications"
                  subtitle="Verified credentials"
                />
                <Stack spacing={1.5}>
                  {certifications.map((cert) => (
                    <Box
                      key={cert.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'border-color 0.2s ease',
                        '&:hover': { borderColor: 'success.main' },
                      }}
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
                          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                          flexShrink: 0,
                        }}
                      >
                        <VerifiedIcon />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {cert.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cert.issuingOrganization} · {formatDate(cert.issueDate)}
                        </Typography>
                      </Box>
                      {cert.verificationStatus && (
                        <Chip
                          size="small"
                          label={cert.verificationStatus}
                          color={cert.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
                <SectionHeader
                  icon={<EmojiEventsOutlinedIcon />}
                  iconColor="#EC4899"
                  title="Achievements"
                  subtitle="Milestones & awards"
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  {achievements.map((achievement) => (
                    <Box
                      key={achievement.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(245,158,11,0.08))',
                        border: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={800}>
                        {achievement.title}
                      </Typography>
                      {achievement.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {achievement.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {achievement.type ?? 'MILESTONE'} · {achievement.issuer ?? 'Skill Infinity'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
              <SectionHeader
                icon={<StarIcon />}
                iconColor="#F59E0B"
                title="Ratings & Reviews"
                subtitle={`${formatCompactNumber(stats?.totalReviews ?? 0)} verified reviews`}
                action={
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#F59E0B' }}>
                      <StarIcon />
                      <Typography variant="h6" fontWeight={800}>
                        {(stats?.averageRating ?? 0).toFixed(1)}
                      </Typography>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(ROUTES.MENTOR_REVIEWS.replace(':mentorId', mentor.id))}
                      sx={{ fontWeight: 800 }}
                    >
                      See all reviews
                    </Button>
                  </Stack>
                }
              />
              <Stack spacing={2}>
                {reviews.map((review) => (
                  <Box
                    key={review.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      transition: 'border-color 0.2s ease',
                      '&:hover': { borderColor: '#F59E0B' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {review.learnerName ?? 'Learner'}
                          {review.verified && (
                            <Chip
                              size="small"
                              label="Verified"
                              color="success"
                              variant="outlined"
                              sx={{ ml: 1, height: 18, fontWeight: 700 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.title} · {formatDate(review.createdAt)}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" gap={0.25} sx={{ color: '#F59E0B' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} sx={{ fontSize: 16, opacity: i < review.rating ? 1 : 0.25 }} />
                        ))}
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      “{review.content}”
                    </Typography>
                    {review.helpfulCount !== undefined && review.helpfulCount > 0 && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: 'block' }}>
                        {review.helpfulCount} found this helpful
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Card>
          </motion.div>
        </Grid>

        {/* ================= Sticky sidebar ================= */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <GlassCard hoverable sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Book a session
              </Typography>
              {pricing.length > 0 ? (
                <Stack spacing={1.5}>
                  {pricing.slice(0, 3).map((plan) => (
                    <Box
                      key={plan.id}
                      sx={{
                        p: 1.75,
                        borderRadius: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        transition: 'border-color 0.2s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {plan.sessionType.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.durationMinutes} min
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'primary.main' }}>
                        {plan.isFree ? 'Free' : `${plan.price} credits`}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Pricing details coming soon.
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={book}
                startIcon={<EventAvailableOutlinedIcon />}
                sx={{ mt: 2.5, py: 1.4, fontWeight: 800 }}
              >
                Book now
              </Button>
            </GlassCard>

            <GlassCard sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Statistics
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[
                  { label: 'Sessions', value: formatCompactNumber(stats?.totalSessions ?? 0) },
                  { label: 'Students', value: formatCompactNumber(stats?.totalStudents ?? 0) },
                  { label: 'Response rate', value: `${stats?.responseRate ?? 0}%` },
                  { label: 'Avg. rating', value: (stats?.averageRating ?? 0).toFixed(1) },
                ].map((stat) => (
                  <Box key={stat.label} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </GlassCard>

            {languages.length > 0 && (
              <GlassCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  <LanguageOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Languages
                </Typography>
                <Stack spacing={1}>
                  {languages.map((language) => (
                    <Stack key={language.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {language.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={language.isNative ? 'Native' : language.proficiencyLevel}
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 22 }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </GlassCard>
            )}

            {availabilities.length > 0 && (
              <GlassCard sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  <CalendarMonthOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Weekly availability
                </Typography>
                <Stack spacing={1}>
                  {availabilities.slice(0, 4).map((availability) => (
                    <Stack key={availability.id} direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                        {availability.dayOfWeek.toLowerCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {availability.startTime} – {availability.endTime}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </GlassCard>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* ================= Related mentors ================= */}
      <Box sx={{ mt: 5 }}>
        <SectionHeader
          title="You may also like"
          subtitle="More mentors worth exploring"
          icon={<StarIcon />}
          iconColor="#6D5DF6"
        />
        <Grid container spacing={3}>
          {related.map((relatedMentor) => (
            <Grid key={relatedMentor.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
                <Card
                  hoverable
                  sx={{ p: 2.5, height: '100%', cursor: 'pointer' }}
                  onClick={() => navigate(ROUTES.MENTOR_DETAILS.replace(':mentorId', relatedMentor.id))}
                >
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 20,
                        background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
                        flexShrink: 0,
                      }}
                    >
                      {(relatedMentor.headline ?? 'M').charAt(0)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} noWrap>
                        {relatedMentor.headline?.split('·')[0]?.trim()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {relatedMentor.headline}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#F59E0B', mt: 0.5 }}>
                        <StarIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" fontWeight={800}>
                          {(relatedMentor.averageRating ?? 0).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          · {formatCompactNumber(relatedMentor.totalSessions ?? 0)} sessions
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MentorProfilePage;
