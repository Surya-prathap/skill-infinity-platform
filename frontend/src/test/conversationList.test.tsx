import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConversationSidebar } from '@/components/communication/ConversationSidebar';
import { ConversationCard } from '@/components/communication/ConversationCard';
import { seedConversations, seedPresence } from '@/features/communication/data';
import type { Conversation } from '@/types';

const baseProps = {
  conversations: seedConversations,
  activeConversationId: null,
  unreadCounts: { 'c-sarah': 2, 'c-devops': 5 },
  presence: seedPresence,
  typing: {},
  announcementsUnread: 2,
  onSelectConversation: () => undefined,
  onTogglePin: () => undefined,
  onToggleMute: () => undefined,
  onSearchClick: () => undefined,
  onNewChat: () => undefined,
  onAnnouncementsClick: () => undefined,
  socketStatusLabel: 'Offline · demo mode',
};

describe('ConversationSidebar', () => {
  it('renders conversations grouped by section', () => {
    render(<ConversationSidebar {...baseProps} />);
    expect(screen.getAllByText('Pinned').length).toBeGreaterThan(0);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('System Design Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('filters to unread conversations', () => {
    render(<ConversationSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('Unread'));
    expect(screen.queryByText('Maya Patel')).not.toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('filters groups', () => {
    render(<ConversationSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('Groups'));
    expect(screen.getAllByText('DevOps Study Group').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
  });

  it('selects a conversation on click', () => {
    let selected: string | null = null;
    render(
      <ConversationSidebar
        {...baseProps}
        onSelectConversation={(id) => {
          selected = id;
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open conversation with Sarah Chen' }));
    expect(selected).toBe('c-sarah');
  });
});

describe('ConversationCard', () => {
  const conversation = seedConversations.find((item) => item.id === 'c-sarah') as Conversation;

  it('renders unread badge and preview', () => {
    render(
      <ConversationCard
        conversation={conversation}
        active={false}
        unread={2}
        presence={seedPresence['user-sarah']}
        onSelect={() => undefined}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Let me review your architecture diagram/)).toBeInTheDocument();
  });

  it('supports keyboard activation', () => {
    let selected = false;
    render(
      <ConversationCard
        conversation={conversation}
        active={false}
        unread={0}
        onSelect={() => {
          selected = true;
        }}
      />,
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Open conversation with Sarah Chen' }), {
      key: 'Enter',
    });
    expect(selected).toBe(true);
  });
});
