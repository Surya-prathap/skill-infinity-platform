import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { ROUTES } from '../utils';

const features = [
  {
    icon: <SchoolIcon sx={{ fontSize: 40 }} />,
    title: 'Expert Mentors',
    description: 'Connect with verified professionals who guide your learning journey.',
  },
  {
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    title: 'Live Sessions',
    description: 'Book one-on-one or group sessions tailored to your learning goals.',
  },
  {
    icon: <CreditCardIcon sx={{ fontSize: 40 }} />,
    title: 'Credit Ecosystem',
    description: 'Earn and spend credits across the platform seamlessly.',
  },
  {
    icon: <ForumIcon sx={{ fontSize: 40 }} />,
    title: 'Community',
    description: 'Engage with a vibrant community of learners and mentors.',
  },
];

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <AutoStoriesIcon sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h2"
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Where Knowledge Creates Value
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}
          >
            Connect with expert mentors, book learning sessions,
            and grow your skills with our credit-powered ecosystem.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              href={ROUTES.REGISTER}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.200',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              href={ROUTES.MENTORS}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'grey.300',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Browse Mentors
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          Everything You Need to Grow
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Our platform provides all the tools you need to accelerate your learning journey.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: 'grey.100', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="sm" textAlign="center">
          <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
            Ready to Start Learning?
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Join thousands of learners and mentors already on the platform.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              href={ROUTES.REGISTER}
              sx={{ px: 4, py: 1.5 }}
            >
              Create Account
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
