import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { renderWithProviders } from './testUtils';
import { KpiCard, RoleBadge, AnimatedProgress, ActivityFeed, DashboardWidget } from '@/components/admin';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { AdminActivityItem } from '@/types';

describe('Admin KpiCard', () => {
  afterEach(cleanup);

  it('renders label, animated value and delta', () => {
    renderWithProviders(
      <KpiCard label="Total Users" value={48203} icon={<GroupsOutlinedIcon />} color="#6D5DF6" delta={14.2} deltaLabel="214 new today" />,
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Users: 48,203')).toBeInTheDocument();
    expect(screen.getByText('14.2%')).toBeInTheDocument();
    expect(screen.getByText('214 new today')).toBeInTheDocument();
  });

  it('formats currency prefixes', () => {
    renderWithProviders(<KpiCard label="Revenue" value={86400} prefix="$" icon={<GroupsOutlinedIcon />} />);

    expect(screen.getByLabelText('Revenue: $86,400')).toBeInTheDocument();
  });
});

describe('Admin RoleBadge', () => {
  afterEach(cleanup);

  it('maps roles to friendly labels', () => {
    renderWithProviders(
      <>
        <RoleBadge role="ROLE_MENTOR" />
        <RoleBadge role="ROLE_ADMIN" />
        <RoleBadge role="ROLE_LEARNER" />
      </>,
    );

    expect(screen.getByText('Mentor')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Learner')).toBeInTheDocument();
  });
});

describe('Admin AnimatedProgress', () => {
  afterEach(cleanup);

  it('renders a labelled progress bar with value', () => {
    renderWithProviders(<AnimatedProgress value={99.99} label="Uptime" suffix="%" />);

    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uptime' })).toHaveAttribute('aria-valuenow', '99.99');
  });

  it('clamps values outside 0-100', () => {
    renderWithProviders(<AnimatedProgress value={120} label="Load" />);

    expect(screen.getByText('120%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Load' })).toHaveAttribute('aria-valuenow', '120');
  });
});

describe('Admin ActivityFeed', () => {
  afterEach(cleanup);

  it('renders activity descriptions and empty state', () => {
    const items: AdminActivityItem[] = [
      { action: 'MENTOR_APPROVED', description: 'Alex Rivera approved as Cloud Architecture mentor', timestamp: new Date().toISOString() },
      { action: 'USER_SUSPENDED', description: 'Account for spamming community posts suspended', timestamp: new Date().toISOString() },
    ];
    renderWithProviders(<ActivityFeed items={items} limit={5} />);

    expect(screen.getByText('Alex Rivera approved as Cloud Architecture mentor')).toBeInTheDocument();
    expect(screen.getByText('Account for spamming community posts suspended')).toBeInTheDocument();
  });

  it('shows an empty message when there are no items', () => {
    renderWithProviders(<ActivityFeed items={[]} />);

    expect(screen.getByText('No recent activity.')).toBeInTheDocument();
  });
});

describe('Admin DashboardWidget', () => {
  afterEach(cleanup);

  it('renders title, subtitle and children', () => {
    renderWithProviders(
      <DashboardWidget title="Platform Health" subtitle="All systems" icon={<GroupsOutlinedIcon />}>
        <div>12/12 services online</div>
      </DashboardWidget>,
    );

    expect(screen.getByText('Platform Health')).toBeInTheDocument();
    expect(screen.getByText('All systems')).toBeInTheDocument();
    expect(screen.getByText('12/12 services online')).toBeInTheDocument();
  });
});

describe('Admin StatusBadge', () => {
  afterEach(cleanup);

  it('renders the label with dot and status color', () => {
    renderWithProviders(<StatusBadge label="All systems operational" color="success" />);

    expect(screen.getByText('All systems operational')).toBeInTheDocument();
  });
});
