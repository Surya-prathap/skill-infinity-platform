import { Box, Container, Grid, IconButton, InputAdornment, Link, TextField } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import SendIcon from '@mui/icons-material/Send';
import { FaGithub, FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from './Logo';
import { APP_DESCRIPTION, ROUTES } from '@/constants';
import { showSuccess } from '@/utils';

const FOOTER_COLUMNS: Array<{ title: string; links: Array<{ label: string; to: string }> }> = [
  {
    title: 'Platform',
    links: [
      { label: 'Find Mentors', to: ROUTES.MENTORS },
      { label: 'Book Sessions', to: ROUTES.SESSIONS },
      { label: 'Community', to: ROUTES.COMMUNITY },
      { label: 'Wallet & Credits', to: ROUTES.WALLET },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: ROUTES.LOGIN },
      { label: 'Create Account', to: ROUTES.REGISTER },
      { label: 'Dashboard', to: ROUTES.DASHBOARD },
      { label: 'Profile', to: ROUTES.PROFILE },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
    ],
  },
];

const SOCIALS = [
  { icon: <FaGithub />, label: 'GitHub' },
  { icon: <FaXTwitter />, label: 'X / Twitter' },
  { icon: <FaLinkedin />, label: 'LinkedIn' },
  { icon: <FaYoutube />, label: 'YouTube' },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const handleNewsletter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showSuccess('Thanks for subscribing! Updates are on the way.');
    (event.currentTarget.elements.namedItem('email') as HTMLInputElement | null)?.form?.reset();
  };

  return (
    <Box component="footer" sx={{ mt: 'auto', position: 'relative' }}>
      {/* Gradient accent strip */}
      <Box sx={{ height: 4, background: 'linear-gradient(90deg, #6D5DF6, #43C6C0, #3B82F6)' }} />
      <Box
        sx={{
          backgroundColor: (t) => (t.palette.mode === 'dark' ? '#0E1626' : '#F8F9FD'),
          borderTop: 1,
          borderColor: 'divider',
          pt: 7,
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Logo />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 320, lineHeight: 1.7 }}>
                {APP_DESCRIPTION}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                {SOCIALS.map((social) => (
                  <IconButton
                    key={social.label}
                    aria-label={social.label}
                    size="small"
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: '#fff',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {FOOTER_COLUMNS.map((column) => (
              <Grid key={column.title} size={{ xs: 6, sm: 4, md: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {column.title}
                </Typography>
                <Stack spacing={1}>
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      component={RouterLink}
                      to={link.to}
                      color="text.secondary"
                      underline="hover"
                      variant="body2"
                      sx={{ '&:hover': { color: 'primary.main' } }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            ))}

            <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Stay Updated
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Join the newsletter for new mentors and features.
              </Typography>
              <form onSubmit={handleNewsletter}>
                <TextField
                  name="email"
                  type="email"
                  size="small"
                  required
                  placeholder="you@email.com"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton type="submit" aria-label="Subscribe" size="small" color="primary">
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
                />
              </form>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {year} Skill Infinity. Where Knowledge Creates Value.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Enterprise Microservices Platform · React 19 · Spring Cloud
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
