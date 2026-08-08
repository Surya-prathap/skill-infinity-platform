import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { ConversationSidebar } from '@/components/communication/ConversationSidebar';
import { ConversationCard } from '@/components/communication/ConversationCard';
import { testConversations, testPresence } from './fixtures';
import { renderWithProviders } from './testUtils';
import type { Conversation } from '@/types';

const baseProps = {
  conversations: testConversations,
  activeConversationId: null,
  unreadCounts: { 'c-sarah': 2, 'c-devops': 5 },
  presence: testPresence,
  typing: {},
  announcementsUnread: 2,
  onSelectConversation: () => undefined,
  onTogglePin: () => undefined,
  onToggleMute: () => undefined,
  onSearchClick: () => undefined,
  onNewChat: () => undefined,
  onAnnouncementsClick: () => undefined,
  socketStatusLabel: 'Connected · real-time active',
};

describe('ConversationSidebar', () => {
  it('renders conversations grouped by section', () => {
    renderWithProviders(<ConversationSidebar {...baseProps} />);
    expect(screen.getAllByText('Pinned').length).toBeGreaterThan(0);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('System Design Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('filters to unread conversations', () => {
    renderWithProviders(<ConversationSidebar {...baseProps} />);
    fireEvent.click(screen.getByText('Unread'));
    expect(screen.queryByText('Maya Patel')).not.toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('filters groups', () => {
    renderWithProviders(<ConversationSidebar {...baseProps} />);
    fireEvent.click(screen.getAllByText('Groups')[0]!);
    expect(screen.getAllByText('DevOps Study Group').length).toBeGreaterThan(0);
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
  });

  it('selects a conversation on click', () => {
    let selected: string | null = null;
    renderWithProviders(
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
  const conversation = testConversations.find((item) => item.id === 'c-sarah') as Conversation;

  it('renders unread badge and preview', () => {
    renderWithProviders(
      <ConversationCard
        conversation={conversation}
        active={false}
        unread={2}
        presence={testPresence['user-sarah']}
        onSelect={() => undefined}
      />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Let me review your architecture diagram/)).toBeInTheDocument();
  });

  it('supports keyboard activation', () => {
    let selected = false;
    renderWithProviders(
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
