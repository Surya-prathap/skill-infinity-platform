import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { MentorDashboardPage } from '@/pages/mentor/MentorDashboardPage';
import { renderWithProviders } from './testUtils';

describe('MentorDashboardPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the hero greeting and profile status', async () => {
    renderWithProviders(<MentorDashboardPage />);

    expect(await screen.findByText(/Welcome back/)).toBeInTheDocument();
    expect(await screen.findByText('Accepting students')).toBeInTheDocument();
  });

  it('renders the analytics metric cards', async () => {
    renderWithProviders(<MentorDashboardPage />);

    expect(await screen.findByText('Monthly Earnings')).toBeInTheDocument();
    expect(await screen.findByText('Sessions Completed')).toBeInTheDocument();
    expect(await screen.findByText('Average Rating')).toBeInTheDocument();
    expect(await screen.findByText('Active Students')).toBeInTheDocument();
  });

  it('renders charts, sessions, wallet and communication widgets', async () => {
    renderWithProviders(<MentorDashboardPage />);

    expect(await screen.findByText('Monthly Revenue')).toBeInTheDocument();
    expect(await screen.findByText('Session Mix')).toBeInTheDocument();
    expect(await screen.findByText("Today's Sessions")).toBeInTheDocument();
    expect(await screen.findByText('Upcoming Sessions')).toBeInTheDocument();
    expect(await screen.findByText('Wallet Summary')).toBeInTheDocument();
    expect(await screen.findByText('Weekly Activity')).toBeInTheDocument();
    expect(await screen.findByText('Recent Reviews')).toBeInTheDocument();
    expect(await screen.findByText('Recent Activity')).toBeInTheDocument();
    expect(await screen.findByText('Messages')).toBeInTheDocument();
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders quick actions and the weekly availability strip', async () => {
    renderWithProviders(<MentorDashboardPage />);

    expect(await screen.findByText('Add availability')).toBeInTheDocument();
    expect(await screen.findByText('Manage pricing')).toBeInTheDocument();
    expect(await screen.findByText('Weekly Availability')).toBeInTheDocument();
    expect(await screen.findByText('Edit mentor profile')).toBeInTheDocument();
  });
});
