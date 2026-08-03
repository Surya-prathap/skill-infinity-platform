import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Container, Grid, Paper } from '@mui/material';
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatedNumber, Avatar, Card } from '@/components';
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

const TOP_MENTORS = [
  {
    name: 'Sarah Chen',
    role: 'Staff Engineer · Ex-Google',
    topics: ['System Design', 'Coding Interviews'],
    rating: 5.0,
    sessions: 420,
    color: '#6D5DF6',
  },
  {
    name: 'Emily Watson',
    role: 'Principal Engineer · React Core',
    topics: ['React', 'Performance'],
    rating: 4.9,
    sessions: 356,
    color: '#14B8A6',
  },
  {
    name: 'David Kim',
    role: 'Engineering Manager · Meta',
    topics: ['Leadership', 'Interviews'],
    rating: 4.9,
    sessions: 298,
    color: '#F59E0B',
  },
  {
    name: 'Amara Okafor',
    role: 'ML Engineer · OpenAI',
    topics: ['Machine Learning', 'Python'],
    rating: 5.0,
    sessions: 231,
    color: '#EC4899',
  },
];

const SUCCESS_STORIES = [
  {
    name: 'Jordan Alvarez',
    result: 'From self-taught to Senior Engineer',
    story: '12 months of weekly mentoring turned a struggling self-taught developer into a senior frontend engineer at a fintech unicorn.',
    metric: '2.4x salary increase',
    color: '#6D5DF6',
  },
  {
    name: 'Mei Lin',
    result: 'Aced the FAANG interview loop',
    story: 'With mock interviews and system design coaching, Mei landed offers from three top-tier companies in one hiring cycle.',
    metric: '3 offers in 8 weeks',
    color: '#14B8A6',
  },
  {
    name: 'Tomás Rivera',
    result: 'Career pivot into data science',
    story: 'A structured 6-month roadmap with a hands-on mentor took Tomás from operations manager to a data analyst role he loves.',
    metric: 'New career in 6 months',
    color: '#F59E0B',
  },
];

const PRICING_PLANS = [
  {
    name: 'Explorer',
    price: 'Free',
    period: 'forever',
    description: 'Start your learning journey.',
    features: ['Community access', '2 credits / month', 'Browse verified mentors', 'Public profile'],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/ month',
    description: 'For serious learners.',
    features: ['120 credits / month', 'Unlimited community', 'Priority booking', 'Session recordings', 'Progress analytics'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Team',
    price: '$99',
    period: '/ month',
    description: 'For teams & academies.',
    features: ['1,000 credits / month', 'Admin dashboard', 'Custom onboarding', 'Dedicated support', 'SSO & billing'],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the credit system work?',
    answer: 'Every session and premium resource has a credit value. Learners top up or earn credits through referrals and achievements, then spend them on 1:1 sessions, group workshops and courses. Credits never expire while your account is active.',
  },
  {
    question: 'How are mentors verified?',
    answer: 'Every mentor passes a multi-stage vetting process: identity verification, skills assessment, a live demo session and continuous review by learners. Only mentors above a 4.5 average rating stay featured.',
  },
  {
    question: 'Can I get a refund for unused credits?',
    answer: 'Yes. Unused credits are fully refundable within 60 days of purchase, no questions asked. Session refunds are handled per the mentor’s cancellation policy shown before booking.',
  },
  {
    question: 'What if I need to reschedule a session?',
    answer: 'You can reschedule up to 12 hours before a session from the Sessions page at no cost. Late cancellations are credited back minus a small fee to protect mentors’ time.',
  },
  {
    question: 'Do you offer plans for teams or academies?',
    answer: 'Absolutely. The Team plan adds admin dashboards, learner analytics, custom onboarding and volume credit pricing. Reach out through the pricing section and we will set you up within a day.',
  },
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

      {/* ============ TOP MENTORS ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Learn From the <span className="text-gradient">Top Mentors</span>
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}>
            Hand-picked experts with real industry experience and proven teaching track records.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {TOP_MENTORS.map((mentor, index) => (
            <Grid key={mentor.name} size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={index}
                style={{ height: '100%' }}
              >
                <Card hoverable sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', width: 88, height: 88, mx: 'auto', mb: 2 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: -6,
                        borderRadius: '50%',
                        background: `conic-gradient(from 180deg, ${mentor.color}, transparent 60%)`,
                        opacity: 0.6,
                      }}
                    />
                    <Avatar
                      firstName={mentor.name.split(' ')[0]}
                      lastName={mentor.name.split(' ').slice(1).join(' ')}
                      size={88}
                      sx={{ position: 'relative', border: '3px solid', borderColor: 'background.paper' }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    {mentor.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {mentor.role}
                  </Typography>
                  <Stack direction="row" spacing={0.75} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
                    {mentor.topics.map((topic) => (
                      <Chip key={topic} size="small" label={topic} variant="outlined" />
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                    <Stack alignItems="center" spacing={0.25}>
                      <Stack direction="row" alignItems="center" gap={0.25} sx={{ color: '#F59E0B' }}>
                        <StarIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" fontWeight={800}>
                          {mentor.rating.toFixed(1)}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Rating
                      </Typography>
                    </Stack>
                    <Box sx={{ width: 1, bgcolor: 'divider' }} />
                    <Stack alignItems="center" spacing={0.25}>
                      <Typography variant="caption" fontWeight={800}>
                        {mentor.sessions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sessions
                      </Typography>
                    </Stack>
                  </Stack>
                  <Button
                    component={RouterLink}
                    to={ROUTES.MENTORS}
                    size="small"
                    variant="outlined"
                    fullWidth
                  >
                    View Profile
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ SUCCESS STORIES ============ */}
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
              Success Stories
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6 }}>
              Real outcomes from learners who committed to growth.
            </Typography>
          </motion.div>
          <Grid container spacing={3}>
            {SUCCESS_STORIES.map((story, index) => (
              <Grid key={story.name} size={{ xs: 12, md: 4 }}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  custom={index}
                  style={{ height: '100%' }}
                >
                  <Card hoverable sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        alignSelf: 'flex-start',
                        px: 1.5,
                        py: 0.75,
                        mb: 2,
                        borderRadius: 999,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: `linear-gradient(135deg, ${story.color}, ${story.color}BB)`,
                      }}
                    >
                      {story.metric}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {story.result}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, flexGrow: 1 }}>
                      “{story.story}”
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1.25} sx={{ mt: 2.5 }}>
                      <Avatar name={story.name} size={40} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {story.name}
                      </Typography>
                    </Stack>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ STATISTICS ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Grid container spacing={2}>
          {[
            { value: 2500, suffix: '+', label: 'Verified mentors' },
            { value: 48000, suffix: '+', label: 'Active learners' },
            { value: 120000, suffix: '+', label: 'Sessions booked' },
            { value: 96, suffix: '%', label: 'Success rate' },
          ].map((stat, index) => (
            <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={index}
              >
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    variant="h3"
                    color="primary.main"
                  />
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

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

      {/* ============ PRICING ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}>
            Start free, upgrade when you are ready. Cancel anytime.
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {PRICING_PLANS.map((plan, index) => (
            <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                custom={index}
                style={{ height: '100%' }}
              >
                <Card
                  hoverable
                  sx={{
                    height: '100%',
                    p: 3.5,
                    position: 'relative',
                    overflow: 'hidden',
                    ...(plan.highlighted
                      ? {
                          background: 'linear-gradient(160deg, #6D5DF6 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          boxShadow: '0 20px 52px rgba(109,93,246,0.4)',
                        }
                      : {}),
                  }}
                >
                  {plan.highlighted && (
                    <Chip
                      label="Most Popular"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 800,
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  )}
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color={plan.highlighted ? undefined : 'primary.main'}
                  >
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={plan.highlighted ? 'rgba(255,255,255,0.85)' : 'text.secondary'}
                    sx={{ mt: 0.5, mb: 2 }}
                  >
                    {plan.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2.5 }}>
                    <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {plan.period}
                    </Typography>
                  </Box>
                  <Stack spacing={1.25} sx={{ mb: 3, minHeight: 168 }}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" alignItems="center" gap={1}>
                        <CheckCircleIcon sx={{ fontSize: 17, color: plan.highlighted ? '#5EEAD4' : 'success.main' }} />
                        <Typography
                          variant="body2"
                          color={plan.highlighted ? 'rgba(255,255,255,0.92)' : 'text.primary'}
                        >
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button
                    component={RouterLink}
                    to={ROUTES.REGISTER}
                    variant={plan.highlighted ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    sx={
                      plan.highlighted
                        ? { bgcolor: '#fff', color: '#5443D4', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }
                        : undefined
                    }
                  >
                    {plan.cta}
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ FAQ ============ */}
      <Box sx={{ bgcolor: 'action.hover', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            custom={0}
          >
            <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em', mb: 6 }}>
              Frequently Asked Questions
            </Typography>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            custom={1}
          >
            <Stack spacing={1.5}>
              {FAQ_ITEMS.map((item) => (
                <Accordion key={item.question}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-label={item.question}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </motion.div>
        </Container>
      </Box>

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
