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

  it('renders the revenue growth chart and traffic sources donut', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Revenue & User Growth')).toBeInTheDocument();
    expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Referral')).toBeInTheDocument();
  });

  it('renders session statistics and performance radar', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Session Statistics')).toBeInTheDocument();
    expect(screen.getByText('Performance Radar')).toBeInTheDocument();
  });

  it('renders the heatmap, community engagement and registrations charts', async () => {
    renderWithProviders(<AnalyticsPage />);

    expect(await screen.findByText('Learning Activity Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Community Engagement')).toBeInTheDocument();
    expect(screen.getByText('Daily Registrations')).toBeInTheDocument();
  });
});
