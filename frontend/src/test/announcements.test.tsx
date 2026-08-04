import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AnnouncementsPage } from '@/pages/AnnouncementsPage';
import { AnnouncementCard } from '@/components/communication/AnnouncementCard';
import { seedAnnouncements } from '@/features/communication/data';
import { renderWithProviders } from './testUtils';

describe('AnnouncementsPage', () => {
  it('renders the featured announcement and the grid', async () => {
    renderWithProviders(<AnnouncementsPage />);

    expect(
      await screen.findByText(/real-time messaging is live/),
    ).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Scheduled maintenance/)).toBeInTheDocument();
    });
  });

  it('filters announcements by category', async () => {
    renderWithProviders(<AnnouncementsPage />);
    await screen.findByText(/real-time messaging is live/);

    fireEvent.click(screen.getByText('Events'));
    expect(screen.getByText(/New mentor events/)).toBeInTheDocument();
    expect(screen.queryByText(/Scheduled maintenance/)).not.toBeInTheDocument();
  });

  it('searches announcements', async () => {
    renderWithProviders(<AnnouncementsPage />);
    await screen.findByText(/real-time messaging is live/);

    fireEvent.change(screen.getByPlaceholderText('Search announcements…'), {
      target: { value: 'promotion' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Summer learning promotion/)).toBeInTheDocument();
    });
  });

  it('opens the detail dialog', async () => {
    renderWithProviders(<AnnouncementsPage />);
    const card = await screen.findByText(/Scheduled maintenance/);
    fireEvent.click(card.closest('[role="button"], [class*="MuiBox"]') ?? card);

    await waitFor(() => {
      expect(screen.getByText('Announcement')).toBeInTheDocument();
    });
  });
});

describe('AnnouncementCard', () => {
  it('renders category, author and relative time', () => {
    const [announcement] = seedAnnouncements;
    render(<AnnouncementCard announcement={announcement!} />);
    expect(screen.getByText('✨ Platform')).toBeInTheDocument();
    expect(screen.getByText('Skill Infinity Team')).toBeInTheDocument();
  });

  it('marks pinned announcements', () => {
    render(<AnnouncementCard announcement={seedAnnouncements[0]!} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });
});
