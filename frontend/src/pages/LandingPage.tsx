import { Box, Button, Chip, Container, Grid, Paper } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import StarIcon from '@mui/icons-material/Star';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { Card, Avatar } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' as const },
  }),
};

const FEATURES = [
  {
    icon: <SchoolOutlinedIcon />,
    title: 'Expert Mentors',
    description: 'Learn from verified industry professionals with real-world experience.',
    color: '#6D5DF6',
  },
  {
    icon: <GroupOutlinedIcon />,
    title: 'Live Sessions',
    description: 'Book 1:1 or group sessions that fit your schedule and goals.',
    color: '#3B82F6',
  },
  {
    icon: <CreditCardOutlinedIcon />,
    title: 'Credit Ecosystem',
    description: 'Earn and spend credits across the platform, seamlessly.',
    color: '#10B981',
  },
  {
    icon: <ForumOutlinedIcon />,
    title: 'Vibrant Community',
    description: 'Ask questions, share wins and grow with peers and mentors.',
    color: '#F59E0B',
  },
  {
    icon: <VerifiedOutlinedIcon />,
    title: 'Verified Mentors',
    description: 'Every mentor is vetted through reviews and ratings.',
    color: '#8B5CF6',
  },
  {
    icon: <AutoGraphOutlinedIcon />,
    title: 'Track Progress',
    description: 'Dashboards, session history and growth insights at a glance.',
    color: '#14B8A6',
  },
];

const STEPS = [
  { number: '01', title: 'Create your account', description: 'Join free as a learner or apply to become a mentor.' },
  { number: '02', title: 'Find your mentor', description: 'Browse verified mentors, ratings and availability.' },
  { number: '03', title: 'Book & grow', description: 'Book sessions with credits, learn and track your progress.' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    quote: 'The 1:1 sessions with my mentor completely changed how I approach system design. Worth every credit.',
  },
  {
    name: 'Marcus Reid',
    role: 'Data Analyst',
    quote: 'Booking was effortless and the mentor matched my learning pace perfectly. Highly recommended.',
  },
  {
    name: 'Priya Sharma',
    role: 'Mentor · Cloud Architect',
    quote: 'Teaching on Skill Infinity lets me share knowledge and earn credits. The platform feels premium.',
  },
];

export const LandingPage: React.FC = () => {
  useDocumentTitle();

  return (
    <Box>
      {/* ============ HERO ============ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'radial-gradient(1200px 600px at 20% -10%, rgba(109,93,246,0.28), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(20,184,166,0.18), transparent 60%), #0B1220'
              : 'radial-gradient(1200px 600px at 20% -10%, rgba(109,93,246,0.14), transparent 60%), radial-gradient(1000px 500px at 90% 10%, rgba(20,184,166,0.12), transparent 60%), #F6F7FB',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
        }}
      >
        {/* Floating gradient blobs */}
        <Box
          component={motion.div}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            top: -120,
            right: '10%',
            background: 'radial-gradient(circle, rgba(109,93,246,0.35), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          component={motion.div}
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            bottom: -140,
            left: '8%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.28), transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack alignItems="center" textAlign="center" spacing={3}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Chip
                label="🚀 Enterprise knowledge platform"
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  py: 2,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '3.25rem', md: '4rem' },
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.08,
                  maxWidth: 820,
                }}
              >
                Where <span className="text-gradient">Knowledge</span> Creates Value
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 620, fontWeight: 400, lineHeight: 1.7 }}
              >
                Connect with verified expert mentors, book live learning sessions, and grow your
                skills in a credit-powered ecosystem designed for serious learners.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                <Button
                  component={RouterLink}
                  to={ROUTES.REGISTER}
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 4 }}
                >
                  Get Started Free
                </Button>
                <Button
                  component={RouterLink}
                  to={ROUTES.MENTORS}
                  size="large"
                  variant="outlined"
                  startIcon={<PlayArrowIcon />}
                  sx={{ px: 4 }}
                >
                  Explore Mentors
                </Button>
              </Stack>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 3, md: 6 }}
                sx={{ pt: 3, flexWrap: 'wrap', justifyContent: 'center' }}
              >
                {[
                  { value: '2,500+', label: 'Verified mentors' },
                  { value: '48k+', label: 'Learners' },
                  { value: '120k+', label: 'Sessions booked' },
                  { value: '4.9/5', label: 'Average rating' },
                ].map((stat) => (
                  <Stack key={stat.label} alignItems="center" spacing={0.25}>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      {/* ============ FEATURES ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Everything You Need to Grow
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}>
            A complete learning ecosystem that connects ambitious learners with world-class mentors.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {FEATURES.map((feature, index) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={index}
                style={{ height: '100%' }}
              >
                <Card hoverable sx={{ height: '100%', p: 3 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#fff',
                      background: `linear-gradient(135deg, ${feature.color}, ${feature.color}99)`,
                      boxShadow: `0 6px 18px ${feature.color}40`,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ HOW IT WORKS ============ */}
      <Box sx={{ bgcolor: 'action.hover', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
              How It Works
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6 }}>
              From sign-up to first session in three simple steps.
            </Typography>
          </motion.div>
          <Grid container spacing={3}>
            {STEPS.map((step, index) => (
              <Grid key={step.number} size={{ xs: 12, md: 4 }}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  custom={index}
                >
                  <Stack spacing={1.5} sx={{ textAlign: 'center', px: 2 }}>
                    <Box
                      sx={{
                        mx: 'auto',
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        boxShadow: '0 8px 24px rgba(109,93,246,0.35)',
                      }}
                    >
                      {step.number}
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {step.description}
                    </Typography>
                  </Stack>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ TESTIMONIALS ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Loved by Learners & Mentors
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6 }}>
            Real stories from the Skill Infinity community.
          </Typography>
        </motion.div>
        <Grid container spacing={3}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Grid key={testimonial.name} size={{ xs: 12, md: 4 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={index}
                style={{ height: '100%' }}
              >
                <Card hoverable sx={{ height: '100%', p: 3 }}>
                  <Stack direction="row" spacing={0.5} sx={{ color: '#F59E0B', mb: 2 }}>
                    {[0, 1, 2, 3, 4].map((star) => (
                      <StarIcon key={star} fontSize="small" />
                    ))}
                  </Stack>
                  <Typography variant="body2" sx={{ lineHeight: 1.75, mb: 3 }}>
                    “{testimonial.quote}”
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar name={testimonial.name} size={42} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ CTA ============ */}
      <Box
        className="animated-gradient"
        sx={{ py: { xs: 8, md: 10 }, color: '#fff', position: 'relative', overflow: 'hidden' }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 2 }}>
              Ready to Unlock Your Potential?
            </Typography>
            <Typography sx={{ opacity: 0.92, mb: 4, fontSize: '1.05rem' }}>
              Join thousands of learners and mentors already growing on Skill Infinity.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.REGISTER}
              size="large"
              variant="contained"
              sx={{
                backgroundColor: '#fff',
                color: '#5443D4',
                px: 5,
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.92)' },
              }}
            >
              Create Your Free Account
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Schedule strip */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          py: 1.5,
          bgcolor: 'transparent',
        }}
      >
        <ScheduleOutlinedIcon fontSize="small" color="primary" />
        <Typography variant="caption" color="text.secondary">
          Sessions available worldwide · Book anytime, learn anywhere
        </Typography>
      </Paper>
    </Box>
  );
};

export default LandingPage;
