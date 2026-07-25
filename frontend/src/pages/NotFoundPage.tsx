import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { ROUTES } from '../utils';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h3" fontWeight={700} gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button variant="contained" href={ROUTES.HOME} size="large">
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
