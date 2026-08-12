import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Container, Grid, Skeleton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Card } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { useMentorSearch } from '@/features/marketplace';

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
    description: 'Book 1:1 sessions in 10, 20 or 30 minute blocks that fit your schedule.',
    color: '#3B82F6',
  },
  {
    icon: <CreditCardOutlinedIcon />,
    title: 'Credit Ecosystem',
    description: '1 credit = 10 minutes. Earn credits by mentoring, spend them to keep learning.',
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
    title: 'Reviewed Mentors',
    description: 'Every mentor is approved by the platform team and rated by real learners.',
    color: '#8B5CF6',
  },
  {
    icon: <AutoGraphOutlinedIcon />,
    title: 'Track Progress',
    description: 'Session history, wallet and learning progress in one simple dashboard.',
    color: '#14B8A6',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create your account',
    description:
      'Join free as a learner. Every new learner receives welcome credits to book their first session.',
  },
  {
    number: '02',
    title: 'Find your mentor & book',
    description:
      'Browse approved mentors, pick a real available slot, choose 10, 20 or 30 minutes — and book with credits.',
  },
  {
    number: '03',
    title: 'Learn, then teach & earn',
    description:
      'Grow with every session. Become a mentor, get approved, and earn credits for each session you teach.',
  },
];

const CREDIT_FACTS = [
  {
    icon: <AccessTimeOutlinedIcon />,
    title: '1 Credit = 10 Minutes',
    description: 'Book sessions of 10, 20 or 30 minutes — they cost 1, 2 or 3 credits.',
    color: '#6D5DF6',
  },
  {
    icon: <CardGiftcardOutlinedIcon />,
    title: 'Welcome Credits',
    description: 'Every new learner starts with welcome credits so you can try your first session free.',
    color: '#14B8A6',
  },
  {
    icon: <AddShoppingCartOutlinedIcon />,
    title: 'Top Up in ₹ (INR)',
    description: 'Need more? 10 credits cost ₹109. Credits are added to your wallet after a successful payment.',
    color: '#F59E0B',
  },
  {
    icon: <PaidOutlinedIcon />,
    title: 'Earn by Teaching',
    description: 'Approved mentors earn credits for every session taught — split into withdrawable and learning credits.',
    color: '#EC4899',
  },
];

const MENTOR_BENEFITS = [
  {
    title: 'Reviewed by the platform team',
    description: 'Submit your mentor profile and our team approves it before you start teaching.',
  },
  {
    title: 'Earn credits you can withdraw',
    description: '1 withdrawable credit = ₹10. Withdraw from 10 credits; a 10% platform fee applies.',
  },
  {
    title: 'Keep learning while you teach',
    description: 'Learning credits let you book sessions with other mentors — the Learn → Teach → Earn loop.',
  },
  {
    title: 'Premium visibility',
    description: 'Premium mentors receive priority placement and a premium badge across the platform.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How does the credit system work?',
    answer:
      '1 credit equals 10 minutes of learning. Sessions run for 10, 20 or 30 minutes and cost 1, 2 or 3 credits respectively. Your balance and full transaction history are available in your wallet.',
  },
  {
    question: 'How do I get credits?',
    answer:
      'New learners receive welcome credits to get started. When you need more, you can top up with INR — 10 credits cost ₹109 — and credits appear in your wallet right after payment.',
  },
  {
    question: 'How do I become a mentor?',
    answer:
      'From your dashboard, choose "Become a Mentor", complete your mentor profile and submit your application. The platform team reviews every application and approves it before you can start teaching.',
  },
  {
    question: 'What do mentors earn?',
    answer:
      'Each paid session you teach earns credits, split into withdrawable credits (cash-eligible) and learning credits (used to book sessions with other mentors). Withdrawals start at 10 credits — 1 credit = ₹10, with a 10% platform fee.',
  },
  {
    question: 'Can mentors learn too?',
    answer:
      'Yes. Learning credits can be spent on sessions with other mentors, so you keep growing your skills while you teach.',
  },
];

export const LandingPage: React.FC = () => {
  useDocumentTitle();

  // Real data from the mentor-service search endpoint (public). No hardcoded
  // mentors or fabricated statistics — empty states are shown when there is
  // no real data to display.
  const { data, isLoading, isOffline } = useMentorSearch({
    page: 0,
    size: 100,
    sortBy: 'rating',
    sortDirection: 'DESC',
  });

  const mentorCount = data.totalElements;
  const avgRating =
    data.content.length > 0
      ? data.content.reduce((sum, mentor) => sum + (mentor.averageRating ?? 0), 0) / data.content.length
      : 0;
  const sessionsTaught = data.content.reduce((sum, mentor) => sum + (mentor.totalSessions ?? 0), 0);
  const topMentors = data.content.slice(0, 4);
  const statsReady = !isLoading && !isOffline;

  const heroStats = [
    { value: mentorCount.toLocaleString('en-IN'), label: 'Mentors' },
    { value: mentorCount > 0 ? avgRating.toFixed(1) : '—', label: 'Avg. rating' },
    { value: sessionsTaught.toLocaleString('en-IN'), label: 'Sessions taught' },
  ];

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
            // No filter: blur() here — the gradient already fades to transparent,
            // and animating a blurred layer forces a full re-raster every frame.
            pointerEvents: 'none',
            willChange: 'transform',
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
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Stack alignItems="center" textAlign="center" spacing={3}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Chip
                label="Learn · Teach · Earn · Grow"
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
                sx={{ maxWidth: 640, fontWeight: 400, lineHeight: 1.7 }}
              >
                Learn from approved expert mentors, teach what you know, and earn credits you can
                spend or withdraw. A simple, credit-powered ecosystem built around growth.
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

            {/* Real platform statistics — only rendered when the backend responds. */}
            {statsReady && (
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
                  {heroStats.map((stat) => (
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
            )}
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
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}
          >
            A focused learning ecosystem that connects learners with approved mentors.
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
              How Skill Infinity Works
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1.5, mb: 6 }}>
              Learn → Teach → Earn → Learn again. It's a simple loop.
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

      {/* ============ HOW CREDITS WORK ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            How Credits Work
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}
          >
            A simple economy: learn, teach, earn — all in credits.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {CREDIT_FACTS.map((fact, index) => (
            <Grid key={fact.title} size={{ xs: 12, sm: 6, lg: 3 }}>
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
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#fff',
                      background: `linear-gradient(135deg, ${fact.color}, ${fact.color}99)`,
                      boxShadow: `0 6px 16px ${fact.color}40`,
                    }}
                  >
                    {fact.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {fact.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {fact.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ TOP MENTORS (real data) ============ */}
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
              Top <span className="text-gradient">Mentors</span>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}
            >
              Approved mentors with real ratings and reviews from learners.
            </Typography>
          </motion.div>

          {isLoading ? (
            <Grid container spacing={3}>
              {[0, 1, 2, 3].map((index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Skeleton variant="circular" width={88} height={88} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="85%" sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="rounded" height={36} sx={{ borderRadius: 2 }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : topMentors.length > 0 ? (
            <Grid container spacing={3}>
              {topMentors.map((mentor, index) => {
                const name = mentor.headline?.split('·')[0]?.trim() || 'Mentor';
                return (
                  <Grid key={mentor.id} size={{ xs: 12, sm: 6, lg: 3 }}>
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
                              background: 'conic-gradient(from 180deg, #6D5DF6, transparent 60%)',
                              opacity: 0.6,
                            }}
                          />
                          <Avatar
                            firstName={name.split(' ')[0]}
                            lastName={name.split(' ').slice(1).join(' ')}
                            src={mentor.profilePictureUrl}
                            size={88}
                            sx={{ position: 'relative', border: '3px solid', borderColor: 'background.paper' }}
                          />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>
                          {name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {mentor.headline}
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                          <Stack alignItems="center" spacing={0.25}>
                            <Stack direction="row" alignItems="center" gap={0.25} sx={{ color: '#F59E0B' }}>
                              <StarIcon sx={{ fontSize: 15 }} />
                              <Typography variant="caption" fontWeight={800}>
                                {(mentor.averageRating ?? 0) > 0 ? (mentor.averageRating ?? 0).toFixed(1) : '—'}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {mentor.totalReviews > 0 ? `${mentor.totalReviews} reviews` : 'No reviews yet'}
                            </Typography>
                          </Stack>
                          <Box sx={{ width: 1, bgcolor: 'divider' }} />
                          <Stack alignItems="center" spacing={0.25}>
                            <Typography variant="caption" fontWeight={800}>
                              {mentor.totalSessions}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Sessions
                            </Typography>
                          </Stack>
                        </Stack>
                        <Button
                          component={RouterLink}
                          to={ROUTES.MENTOR_DETAILS.replace(':mentorId', mentor.id)}
                          size="small"
                          variant="outlined"
                          fullWidth
                        >
                          View Profile
                        </Button>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          ) : isOffline ? (
            <Card sx={{ p: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                We couldn't load mentors right now.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                The mentor network will appear here as soon as the platform is reachable.
              </Typography>
              <Button component={RouterLink} to={ROUTES.BECOME_MENTOR} variant="contained" endIcon={<ArrowForwardIcon />}>
                Become a mentor
              </Button>
            </Card>
          ) : (
            <Card sx={{ p: 4, textAlign: 'center', maxWidth: 520, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                No mentors are available right now.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Every mentor is reviewed and approved by the platform team before they appear here.
              </Typography>
              <Button component={RouterLink} to={ROUTES.BECOME_MENTOR} variant="contained" endIcon={<ArrowForwardIcon />}>
                Become a mentor
              </Button>
            </Card>
          )}
        </Container>
      </Box>

      {/* ============ WHY BECOME A MENTOR ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          custom={0}
        >
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Why Become a Mentor
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 1.5, mb: 6, maxWidth: 560, mx: 'auto' }}
          >
            Share your knowledge and turn it into credits you can use or withdraw.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {MENTOR_BENEFITS.map((benefit, index) => (
            <Grid key={benefit.title} size={{ xs: 12, sm: 6, lg: 3 }}>
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
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
                      boxShadow: '0 6px 16px rgba(109,93,246,0.35)',
                    }}
                  >
                    {index === 0 ? (
                      <VerifiedOutlinedIcon />
                    ) : index === 1 ? (
                      <PaidOutlinedIcon />
                    ) : index === 2 ? (
                      <SchoolOutlinedIcon />
                    ) : (
                      <WorkspacePremiumOutlinedIcon />
                    )}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {benefit.description}
                  </Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button
            component={RouterLink}
            to={ROUTES.BECOME_MENTOR}
            size="large"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 5 }}
          >
            Become a Mentor
          </Button>
        </Box>
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
              Ready to Start Learning?
            </Typography>
            <Typography sx={{ opacity: 0.92, mb: 4, fontSize: '1.05rem', maxWidth: 520, mx: 'auto' }}>
              Create your free account and join a credit-powered ecosystem built around learning,
              teaching and earning.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.REGISTER}
              size="large"
              variant="contained"
              startIcon={<CheckCircleIcon />}
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
    </Box>
  );
};

export default LandingPage;
