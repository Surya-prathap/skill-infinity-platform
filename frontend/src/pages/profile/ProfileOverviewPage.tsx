import type { ReactNode } from 'react';
import { Box, Button, Chip, Grid, LinearProgress, Link } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import {
  Avatar,
  AvatarStack,
  Card,
  GlassCard,
  InfoCard,
  ProfileCompletionRing,
  Timeline,
} from '@/components';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { ROLE_LABELS } from '@/constants';
import { computeProfileCompletion, proficiencyToPercent, useProfileQuery } from '@/features/profile';
import { formatDate } from '@/utils';
import type { Education, Experience } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const SectionTitle: React.FC<{ icon: ReactNode; children: ReactNode }> = ({ icon, children }) => (
  <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.selected',
        color: 'primary.main',
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" fontWeight={700}>
      {children}
    </Typography>
  </Stack>
);

export const ProfileOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, educations, experiences, skills, languages, isOffline, notFound } =
    useProfileQuery();
  const completion = computeProfileCompletion(profile);

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName ?? ''}`.trim()
    : user?.username || user?.email || 'Skill Member';

  const initialsName = profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ''}`.trim() : user?.username;

  const location = [profile?.city, profile?.country].filter(Boolean).join(', ');
  const socialLinks = [
    { icon: <FaLinkedin fontSize="15" />, label: 'LinkedIn', url: profile?.linkedinUrl },
    { icon: <FaGithub fontSize="15" />, label: 'GitHub', url: profile?.githubUrl },
    { icon: <FaXTwitter fontSize="15" />, label: 'X / Twitter', url: profile?.twitterUrl },
    { icon: <LanguageOutlinedIcon fontSize="small" />, label: 'Website', url: profile?.website },
  ].filter((link) => Boolean(link.url));

  const educationTimeline = educations.map((education: Education) => ({
    title: education.institution,
    description: [education.degree, education.fieldOfStudy].filter(Boolean).join(' · ') || 'Student',
    time: `${formatDate(education.startDate)} — ${education.currentlyStudying ? 'Present' : formatDate(education.endDate)}`,
    icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} />,
    color: '#6D5DF6',
  }));

  const experienceTimeline = experiences.map((experience: Experience) => ({
    title: `${experience.title} · ${experience.company}`,
    description:
      [experience.location, experience.employmentType].filter(Boolean).join(' · ') || undefined,
    time: `${formatDate(experience.startDate)} — ${experience.currentlyWorking ? 'Present' : formatDate(experience.endDate)}`,
    icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
    color: '#14B8A6',
  }));

  return (
    <Box>
      {/* ================= Cover ================= */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 150, md: 200 },
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 55%, #0EA5E9 120%)',
        }}
      >
        <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.22 }} />
        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            top: -120,
            right: '12%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            bottom: -140,
            left: '6%',
            background: 'radial-gradient(circle, rgba(94,234,212,0.4), transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        {isOffline && (
          <Chip
            label="Offline preview"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: 'rgba(255,255,255,0.18)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
            }}
          />
        )}
      </Box>

      {/* ================= Identity row ================= */}
      <Box sx={{ px: { xs: 2, md: 3 }, position: 'relative', mt: { xs: -6, md: -8 }, zIndex: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          gap={2.5}
          flexWrap="wrap"
          sx={{ alignItems: { xs: 'center', md: 'flex-end' } }}
        >
          <Avatar
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            name={initialsName}
            email={profile?.email ?? user?.email}
            src={profile?.profilePictureUrl}
            size={128}
            sx={{
              fontSize: 44,
              border: '5px solid',
              borderColor: 'background.paper',
              boxShadow: '0 12px 32px rgba(15,23,42,0.25)',
              flexShrink: 0,
            }}
          />
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {displayName}
            </Typography>
            {profile?.headline && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.25 }}>
                {profile.headline}
              </Typography>
            )}
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              sx={{ mt: 1.25, justifyContent: { xs: 'center', md: 'flex-start' } }}
            >
              {user?.roles?.map((role) => (
                <Chip key={role} size="small" label={ROLE_LABELS[role] ?? role} color="primary" variant="outlined" />
              ))}
              {location && <Chip size="small" icon={<LocationOnOutlinedIcon />} label={location} variant="outlined" />}
              {profile?.timezone && (
                <Chip size="small" icon={<ScheduleOutlinedIcon />} label={profile.timezone.replace('_', ' ')} variant="outlined" />
              )}
            </Stack>
          </Box>
          <Stack direction="row" gap={1.5} sx={{ pb: 0.5 }}>
            <Button
              component={RouterLink}
              to={ROUTES.PROFILE_EDIT}
              variant="contained"
              startIcon={<EditOutlinedIcon />}
            >
              Edit Profile
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ================= Create-profile prompt ================= */}
      {notFound && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card sx={{ p: { xs: 3, md: 4 }, mb: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                mx: 'auto',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.selected',
                color: 'primary.main',
              }}
            >
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              Welcome! Let&apos;s set up your profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mt: 1 }}>
              Your profile hasn&apos;t been created yet. Add your details so mentors and the
              community can get to know you.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.PROFILE_EDIT}
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              sx={{ mt: 2.5 }}
            >
              Create your profile
            </Button>
          </Card>
        </motion.div>
      )}

      {/* ================= Content ================= */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        {/* ---------- Left column ---------- */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* About */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <SectionTitle icon={<ShareOutlinedIcon />}>About</SectionTitle>
                {profile?.bio ? (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.85 }}>
                    {profile.bio}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No bio yet.{' '}
                    <Link component={RouterLink} to={ROUTES.PROFILE_EDIT} underline="hover" sx={{ fontWeight: 700 }}>
                      Add a short introduction
                    </Link>{' '}
                    about your goals and what you hope to achieve.
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Experience */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <SectionTitle icon={<WorkOutlineOutlinedIcon />}>Experience</SectionTitle>
                  <Button
                    component={RouterLink}
                    to={ROUTES.PROFILE_EXPERIENCE}
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Manage
                  </Button>
                </Stack>
                {experiences.length > 0 ? (
                  <Timeline items={experienceTimeline} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No experience added yet.{' '}
                    <Link component={RouterLink} to={ROUTES.PROFILE_EXPERIENCE} underline="hover" sx={{ fontWeight: 700 }}>
                      Add your work history
                    </Link>
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Education */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <SectionTitle icon={<SchoolOutlinedIcon />}>Education</SectionTitle>
                  <Button
                    component={RouterLink}
                    to={ROUTES.PROFILE_EDUCATION}
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Manage
                  </Button>
                </Stack>
                {educations.length > 0 ? (
                  <Timeline items={educationTimeline} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No education added yet.{' '}
                    <Link component={RouterLink} to={ROUTES.PROFILE_EDUCATION} underline="hover" sx={{ fontWeight: 700 }}>
                      Add your education
                    </Link>
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Certifications */}
            {profile?.certifications && profile.certifications.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Card sx={{ p: 3 }}>
                  <SectionTitle icon={<WorkspacePremiumOutlinedIcon />}>Certifications</SectionTitle>
                  <Stack spacing={1.25}>
                    {profile.certifications.map((certification) => (
                      <Stack key={certification} direction="row" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'warning.main',
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {certification}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </motion.div>
            )}
          </Stack>
        </Grid>

        {/* ---------- Right column ---------- */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Completion */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <GlassCard hoverable sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Profile Completion
                </Typography>
                <ProfileCompletionRing
                  value={completion.percentage}
                  size={150}
                  sublabel={completion.missing.length === 0 ? 'All done!' : 'Keep going'}
                />
                {completion.missing.length > 0 ? (
                  <>
                    <Box sx={{ textAlign: 'left', mt: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                        Missing to reach 100%
                      </Typography>
                      <Stack spacing={1}>
                        {completion.missing.slice(0, 4).map((section) => (
                          <Stack key={section.key} direction="row" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'warning.main',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="caption" fontWeight={500}>
                              {section.label}
                            </Typography>
                          </Stack>
                        ))}
                        {completion.missing.length > 4 && (
                          <Typography variant="caption" color="text.secondary">
                            +{completion.missing.length - 4} more…
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                    <Button
                      component={RouterLink}
                      to={ROUTES.PROFILE_EDIT}
                      fullWidth
                      sx={{ mt: 2.5 }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Complete your profile
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="success.main" fontWeight={600} sx={{ mt: 2 }}>
                    Your profile is fully complete 🎉
                  </Typography>
                )}
              </GlassCard>
            </motion.div>

            {/* Contact */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <SectionTitle icon={<ShareOutlinedIcon />}>Contact</SectionTitle>
                <Stack spacing={1.5}>
                  <InfoCard icon={<EmailOutlinedIcon />} label="Email" value={profile?.email ?? user?.email ?? '—'} />
                  <InfoCard icon={<PhoneOutlinedIcon />} label="Phone" value={profile?.phone || '—'} />
                  <InfoCard icon={<LocationOnOutlinedIcon />} label="Location" value={location || '—'} />
                  <InfoCard icon={<ScheduleOutlinedIcon />} label="Timezone" value={profile?.timezone?.replace('_', ' ') || '—'} />
                </Stack>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <SectionTitle icon={<BoltOutlinedIcon />}>Skills</SectionTitle>
                  <Button
                    component={RouterLink}
                    to={ROUTES.PROFILE_SKILLS}
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    Manage
                  </Button>
                </Stack>
                {skills.length > 0 ? (
                  <Stack direction="row" gap={1} flexWrap="wrap">
                    {skills.map((skill) => (
                      <Chip
                        key={skill.id ?? skill.name}
                        label={skill.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet.
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Languages */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <SectionTitle icon={<TranslateIcon />}>Languages</SectionTitle>
                {languages.length > 0 ? (
                  <Stack spacing={1.25}>
                    {languages.map((language) => (
                      <Stack key={language.id ?? language.name} direction="row" alignItems="center" gap={1.5}>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 90 }}>
                          {language.name}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={proficiencyToPercent(language.proficiencyLevel)}
                            sx={{ height: 6 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 64, textAlign: 'right' }}>
                          {language.proficiencyLevel}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No languages added yet.
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Social */}
            {socialLinks.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <Card sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <SectionTitle icon={<ShareOutlinedIcon />}>Social</SectionTitle>
                    <Button
                      component={RouterLink}
                      to={ROUTES.PROFILE_SOCIAL}
                      size="small"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                    >
                      Manage
                    </Button>
                  </Stack>
                  <Stack spacing={1.5}>
                    {socialLinks.map((link) => (
                      <InfoCard
                        key={link.label}
                        icon={link.icon}
                        label={link.label}
                        value={link.url!}
                        href={link.url}
                        color="#0A66C2"
                      />
                    ))}
                  </Stack>
                </Card>
              </motion.div>
            )}

            {/* Resume */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <SectionTitle icon={<DescriptionOutlinedIcon />}>Resume</SectionTitle>
                {profile?.resumeUrl ? (
                  <Button
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<DescriptionOutlinedIcon />}
                    fullWidth
                  >
                    View Resume
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No resume uploaded yet.{' '}
                    <Link component={RouterLink} to={ROUTES.PROFILE_RESUME} underline="hover" sx={{ fontWeight: 700 }}>
                      Upload one
                    </Link>
                  </Typography>
                )}
              </Card>
            </motion.div>

            {/* Mentor community preview */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Card sx={{ p: 3 }}>
                <SectionTitle icon={<ShareOutlinedIcon />}>Mentors you follow</SectionTitle>
                <AvatarStack
                  items={[
                    { firstName: 'Sarah', lastName: 'Chen' },
                    { firstName: 'Marcus', lastName: 'Reid' },
                    { firstName: 'Priya', lastName: 'Sharma' },
                    { firstName: 'David', lastName: 'Kim' },
                    { firstName: 'Emily', lastName: 'Watson' },
                  ]}
                  label="5 mentors"
                />
              </Card>
            </motion.div>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileOverviewPage;
