import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
} from '@mui/material';
import { APP_NAME, APP_TAGLINE, ROUTES } from '../../utils';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {APP_NAME}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {APP_TAGLINE}
            </Typography>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Platform
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href={ROUTES.MENTORS} color="text.secondary" underline="hover" variant="body2">
                Find Mentors
              </Link>
              <Link href={ROUTES.SESSIONS} color="text.secondary" underline="hover" variant="body2">
                Book Sessions
              </Link>
              <Link href={ROUTES.COMMUNITY} color="text.secondary" underline="hover" variant="body2">
                Community
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Help Center
              </Link>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Terms of Service
              </Link>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                About
              </Link>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Contact
              </Link>
              <Link href="#" color="text.secondary" underline="hover" variant="body2">
                Careers
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" textAlign="center">
          &copy; {currentYear} {APP_NAME}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
