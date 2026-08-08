import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AnnouncementsPage } from '@/pages/AnnouncementsPage';
import { AnnouncementCard } from '@/components/communication/AnnouncementCard';
import { testAnnouncements } from './fixtures';
import { renderWithProviders } from './testUtils';

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  const { testAnnouncements } = await import('./fixtures');
  return {
    ...actual,
    communicationService: {
      ...actual.communicationService,
      getAnnouncements: vi.fn().mockResolvedValue({
        data: { data: { content: testAnnouncements } },
      }),
    },
  };
});

describe('AnnouncementsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the featured announcement and the grid', async () => {
    renderWithProviders(<AnnouncementsPage />);

    expect(
      await screen.findByText(/real-time messaging is live/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Scheduled maintenance/)).toBeInTheDocument();
    });
  });

  it('filters announcements by category', async () => {
    renderWithProviders(<AnnouncementsPage />);
    await screen.findByText(/real-time messaging is live/i);

    fireEvent.click(screen.getByText('Events'));
    expect(screen.getByText(/New mentor events/)).toBeInTheDocument();
    expect(screen.queryByText(/Scheduled maintenance/)).not.toBeInTheDocument();
  });

  it('searches announcements', async () => {
    renderWithProviders(<AnnouncementsPage />);
    await screen.findByText(/real-time messaging is live/i);

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
    const [announcement] = testAnnouncements;
    render(<AnnouncementCard announcement={announcement!} />);
    expect(screen.getByText('✨ Platform')).toBeInTheDocument();
    expect(screen.getByText('Skill Infinity Team')).toBeInTheDocument();
  });

  it('marks pinned announcements', () => {
    render(<AnnouncementCard announcement={testAnnouncements[0]!} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });
});
