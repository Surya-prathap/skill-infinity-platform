import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { renderWithProviders } from './testUtils';

describe('AnalyticsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the analytics header and KPI cards', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Platform Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Avg. Rating')).toBeInTheDocument();
  });

  it('renders the revenue trend chart and engagement overview donut', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Engagement Overview')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('renders session statistics and daily registrations charts', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Session Statistics')).toBeInTheDocument();
    expect(screen.getByText('Daily Registrations')).toBeInTheDocument();
  });
});
