import { Box, Button, Chip, Grid, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { GradientCard } from '@/components/mentor/GradientCard';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';

const PERKS = [
  {
    icon: <VerifiedOutlinedIcon />,
    title: 'Verified mentor badge',
    description: 'Stand out with a verified profile that learners trust from the first click.',
    color: '#6D5DF6',
  },
  {
    icon: <PaymentsOutlinedIcon />,
    title: 'Set your own pricing',
    description: 'Hourly rates, skill-based pricing and discounts — you are in full control.',
    color: '#14B8A6',
  },
  {
    icon: <CalendarMonthOutlinedIcon />,
    title: 'Own your schedule',
    description: 'Block weekly recurring slots, pause availability and take time off when you need.',
    color: '#F59E0B',
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: 'Grow your audience',
    description: 'Reach ambitious learners across every major discipline.',
    color: '#EC4899',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your mentor profile', description: 'Headline, experience, skills and expertise in a beautiful 10-step wizard.' },
  { step: '02', title: 'Set pricing & availability', description: 'Define your rates, session types and weekly schedule in minutes.' },
  { step: '03', title: 'Get verified & go live', description: 'Our team reviews your application and activates your public profile.' },
];

const MENTOR_NETWORK_FACTS = [
  { value: 'Reviewed & approved', label: 'Every application is reviewed by the platform team' },
  { value: 'Earn per session', label: 'Credits for every paid session you teach' },
  { value: 'Withdraw in ₹', label: '1 credit = ₹10 · 10-credit minimum · 10% platform fee' },
  { value: 'Keep learning', label: 'Spend learning credits on sessions with other mentors' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export const BecomeMentorPage: React.FC = () => {
  useDocumentTitle('Become a Mentor');
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ctaPath = isAuthenticated ? ROUTES.MENTOR_REGISTRATION : ROUTES.REGISTER;

  return (
    <Box>
      {/* ================= Hero ================= */}
      <GradientCard gradient="hero" sx={{ mt: 2 }}>
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Chip
                size="small"
                icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Mentor Program"
                sx={{
                  mb: 2,
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontWeight: 700,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '2rem', sm: '2.6rem', md: '3rem' },
                  lineHeight: 1.12,
                }}
              >
                Turn your expertise into
                <Box component="span" sx={{ display: 'block', color: '#5EEAD4' }}>
                  a thriving mentoring business.
                </Box>
              </Typography>
              <Typography variant="body1" sx={{ mt: 2.5, maxWidth: 560, opacity: 0.92, lineHeight: 1.7 }}>
                Join a growing network of verified professionals earning on their own terms.
                Build a premium profile, set your pricing, own your calendar and help
                ambitious learners level up.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mt: 3.5 }}>
                <Button
                  component={RouterLink}
                  to={ctaPath}
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: '#fff',
                    color: '#5443D4',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Apply to become a mentor
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  How it works
                </Button>
              </Stack>
            </motion.div>
          </Grid>

          {/* Stats panel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  p: 3,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                  The Skill Infinity mentor network
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {MENTOR_NETWORK_FACTS.map((fact) => (
                    <Box key={fact.value} sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)' }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#5EEAD4' }}>
                        {fact.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', mt: 0.5 }}>
                        {fact.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </GradientCard>

      {/* ================= Perks ================= */}
      <Box sx={{ mt: 6 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            Why become a mentor?
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1, mb: 4 }}>
            Everything you need to run a premium mentoring practice.
          </Typography>
        </motion.div>
        <Grid container spacing={3}>
          {PERKS.map((perk, index) => (
            <Grid key={perk.title} size={{ xs: 12, sm: 6, lg: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: 'easeOut' }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    p: 3,
                    borderRadius: 4,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 8,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      background: `linear-gradient(135deg, ${perk.color}, ${perk.color}99)`,
                      boxShadow: `0 8px 20px ${perk.color}45`,
                      mb: 2,
                    }}
                  >
                    {perk.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {perk.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {perk.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ================= How it works ================= */}
      <Box sx={{ mt: 7 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ letterSpacing: '-0.02em' }}>
            How it works
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1, mb: 4 }}>
            From application to your first booking in three simple steps.
          </Typography>
        </motion.div>
        <Grid container spacing={3}>
          {HOW_IT_WORKS.map((item, index) => (
            <Grid key={item.step} size={{ xs: 12, md: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.45, ease: 'easeOut' }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    p: 3.5,
                    borderRadius: 4,
                    bgcolor: 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 20,
                      fontWeight: 800,
                      fontSize: '3.5rem',
                      color: 'action.selected',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', fontSize: 28, mb: 1.5 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ================= CTA ================= */}
      <GradientCard gradient="brandWarm" sx={{ mt: 7, textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Ready to share what you know?
          </Typography>
          <Typography variant="body1" sx={{ mt: 1.5, mb: 3, opacity: 0.9 }}>
            Join the mentor community today — it takes less than 15 minutes.
          </Typography>
          <Button
            component={RouterLink}
            to={ctaPath}
            size="large"
            variant="contained"
            sx={{
              bgcolor: '#fff',
              color: '#7C3AED',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
              px: 5,
            }}
            endIcon={<ArrowForwardIcon />}
          >
            {isMobile ? 'Apply now' : 'Start your mentor application'}
          </Button>
        </motion.div>
      </GradientCard>

      {/* Trust strip */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        gap={3}
        sx={{ mt: 5, py: 3, borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}
      >
        {['Withdraw in INR', 'Free to apply', 'Approved by our team', 'Dedicated support'].map((item) => (
          <Stack key={item} direction="row" alignItems="center" gap={0.75}>
            <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2" fontWeight={600}>
              {item}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default BecomeMentorPage;
