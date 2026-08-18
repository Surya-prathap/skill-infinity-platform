import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { renderWithProviders } from './testUtils';

describe('AdminDashboardPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the admin dashboard header and KPI cards', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Learners')).toBeInTheDocument();
    expect(screen.getByText('Mentors')).toBeInTheDocument();
  });

  it('renders platform health, quick actions and recent activity widgets', async () => {
    renderWithProviders(<AdminDashboardPage />);

    expect(await screen.findByText('Platform Health')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Review mentors')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });
});
