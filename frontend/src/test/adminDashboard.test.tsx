import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { renderWithProviders } from './testUtils';

describe('AdminDashboardPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the executive dashboard header and KPI cards', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Executive Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Mentors')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('Wallet Credits')).toBeInTheDocument();
  });

  it('renders growth snapshot tiles', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Engagement Score')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Live Visitors')).toBeInTheDocument();
    expect(screen.getByText('Avg. Rating')).toBeInTheDocument();
  });

  it('renders the revenue chart and user mix donut', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('User Mix')).toBeInTheDocument();
  });

  it('renders platform health, quick actions and recent activity widgets', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Platform Health')).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('New announcement')).toBeInTheDocument();
    expect(screen.getByText('Review mentors')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders the date range toggle', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByRole('group', { name: 'Date range' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12M' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7D' })).toBeInTheDocument();
  });
});
