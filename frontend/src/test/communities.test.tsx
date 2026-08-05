import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from './testUtils';
import { CommunitiesPage } from '@/pages/community/CommunitiesPage';
import { seedCommunities } from '@/features/community/data';

describe('CommunitiesPage', () => {
  it('renders community cards with names, descriptions and membership', async () => {
    renderWithProviders(<CommunitiesPage />);

    expect(screen.getByText('Communities')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();
    expect(screen.getByText('Java & Spring')).toBeInTheDocument();

    // Joined communities show the joined state.
    const systemDesign = screen.getByText('System Design').closest('div')?.parentElement;
    expect(systemDesign).not.toBeNull();
  });

  it('filters communities when searching by name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunitiesPage />);

    const search = screen.getByLabelText('Search communities');
    await user.type(search, 'machine learning');

    await waitFor(() => {
      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
      expect(screen.queryByText('System Design')).not.toBeInTheDocument();
    });
  });

  it('filters communities by category chip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunitiesPage />);

    await user.click(screen.getByRole('button', { name: /Data & AI/i }));

    await waitFor(() => {
      expect(screen.getByText('Machine Learning')).toBeInTheDocument();
      expect(screen.queryByText('Java & Spring')).not.toBeInTheDocument();
    });
  });

  it('joins a community optimistically when clicking the join button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunitiesPage />);

    const community = seedCommunities.find((c) => c.id === 'comm-java');
    expect(community).toBeDefined();

    const card = screen.getByText('Java & Spring').closest('.MuiCard-root') as HTMLElement;
    expect(card).not.toBeNull();
    const joinButton = within(card).getByRole('button', { name: /^Join$/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(within(card).getByText(/Joined ✓/i)).toBeInTheDocument();
    });
  });

  it('shows a premium empty state when no community matches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommunitiesPage />);

    const search = screen.getByLabelText('Search communities');
    await user.type(search, 'quantum-computing-xyz');

    await waitFor(() => {
      expect(screen.getByText(/No communities for/i)).toBeInTheDocument();
    });
  });
});
