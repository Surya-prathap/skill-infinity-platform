import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { MentorAnalyticsPage } from '@/pages/mentor/MentorAnalyticsPage';
import { renderWithProviders } from './testUtils';

describe('MentorAnalyticsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header and animated metric cards', async () => {
    renderWithProviders(<MentorAnalyticsPage />);

    expect(await screen.findByText('Analytics')).toBeInTheDocument();
    expect(await screen.findByText('Total Sessions')).toBeInTheDocument();
    expect(await screen.findByText('Completion Rate')).toBeInTheDocument();
    expect(await screen.findByText('Average Rating')).toBeInTheDocument();
    expect(await screen.findByText('Total Students')).toBeInTheDocument();
  });

  it('renders the revenue and category charts', async () => {
    renderWithProviders(<MentorAnalyticsPage />);

    expect(await screen.findByText('Revenue Trend')).toBeInTheDocument();
    expect(await screen.findByText('Popular Categories')).toBeInTheDocument();
    expect(await screen.findByText('Software Engineering')).toBeInTheDocument();
  });

  it('renders session, growth, booking and rating charts', async () => {
    renderWithProviders(<MentorAnalyticsPage />);

    expect(await screen.findByText('Session Trends')).toBeInTheDocument();
    expect(await screen.findByText('Student Growth')).toBeInTheDocument();
    expect(await screen.findByText('Booking Trends')).toBeInTheDocument();
    expect(await screen.findByText('Rating Trends')).toBeInTheDocument();
  });

  it('renders top skills and performance metrics', async () => {
    renderWithProviders(<MentorAnalyticsPage />);

    expect(await screen.findByText('Top Skills')).toBeInTheDocument();
    expect(await screen.findByText('System Design')).toBeInTheDocument();
    expect(await screen.findByText('Performance Metrics')).toBeInTheDocument();
    expect(await screen.findByText('Response rate')).toBeInTheDocument();
  });
});
