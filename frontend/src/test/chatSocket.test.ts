import { describe, expect, it } from 'vitest';
import chatReducer, {
  messageReceived,
  setOwnIdentity,
  setSocketStatus,
  typingChanged,
  hydrateConversations,
} from '@/store/slices/chatSlice';
import { testConversations } from './fixtures';

describe('chatSocket real-time integration', () => {
  it('maps socket connect to the connected status', () => {
    const state = chatReducer(undefined, setSocketStatus('connected'));
    expect(state.socketStatus).toBe('connected');
  });

  it('appends incoming messages from the socket into Redux', () => {
    const incoming = {
      id: 'socket-1',
      conversationId: 'c-sarah',
      senderId: 'user-sarah',
      senderName: 'Sarah Chen',
      content: 'Live from the socket!',
      kind: 'text' as const,
      attachments: [],
      reactions: [],
      status: 'delivered' as const,
      createdAt: new Date().toISOString(),
      replyTo: null,
      readBy: ['user-sarah'],
    };
    let state = chatReducer(undefined, setOwnIdentity({ userId: 'user-me', userName: 'Alex Morgan' }));
    state = chatReducer(state, hydrateConversations(testConversations));
    state = chatReducer(state, { type: 'chat/setActiveConversation', payload: 'c-maya' });
    state = chatReducer(state, messageReceived(incoming));

    expect(state.messages['c-sarah']).toContainEqual(expect.objectContaining({ id: 'socket-1' }));
    expect(state.unreadCounts['c-sarah']).toBeGreaterThan(2);
  });

  it('tracks typing events through the slice', () => {
    let state = chatReducer(undefined, { type: 'chat/clearChat' });
    state = chatReducer(
      state,
      typingChanged({
        conversationId: 'c-sarah',
        userId: 'user-sarah',
        userName: 'Sarah Chen',
        isTyping: true,
      }),
    );
    expect(state.typing['c-sarah']?.[0]?.isTyping).toBe(true);
  });
});
