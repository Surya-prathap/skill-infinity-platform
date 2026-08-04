# Communication Center

A premium, enterprise-grade messaging experience for Skill Infinity — inspired by
Slack, Discord, Microsoft Teams and WhatsApp Web.

## Routes

| Route | Description |
| ----- | ----------- |
| `/messages` | Three-panel Communication Center (conversations, chat, details) |
| `/messages/:conversationId` | Deep-link into a conversation |
| `/announcements` | Announcement center (system, maintenance, platform, promotion, event) |
| `/notifications` | Premium notification center (grouped by day, filterable) |

## Architecture

```
pages/CommunicationPage.tsx         → three-panel layout + orchestration
├── ConversationSidebar             → pinned / sessions & groups / chats + filters
├── ChatHeader                      → presence, typing, call + search actions
├── VirtualizedMessageList          → windowed rendering + date separators
├── MessageComposer                 → attachments, emoji, GIF, voice, drag & drop
└── ConversationDetailsPanel        → profile, session, files, participants, pinned

features/communication/             → React Query hooks + seed data (offline fallback)
store/slices/chatSlice.ts           → real-time state (messages, typing, presence, unread)
socket/chatSocket.ts                → socket.io event wiring + offline companion
services/communication.service.ts   → REST contract with communication-service
```

## Real-time state

- **Messages** — hydrated from REST, appended live via `chat:message` socket events.
- **Typing** — `chat:typing` events; throttled emission while the user types.
- **Presence** — `presence:online/offline` events with statuses
  (`online`, `away`, `busy`, `in-session`, `offline`, `invisible`).
- **Read receipts** — `chat:read` events mark own messages as read (double-check ✓✓).
- **Connection status** — `connect` / `disconnect` / `reconnect_attempt` drive the
  status pill and the reconnect banner.

When the socket is unavailable the center falls back to REST + seed data and a
live “demo companion” simulates peer replies, so the experience never feels broken.

## Message features

Text with lightweight markdown (`**bold**`, inline `` `code` ``, links, `@mentions`),
code blocks, GIF tiles, voice-message UI, image/file attachments with simulated
upload progress, replies, forward, edit, delete (tombstone), emoji reactions,
pin, bookmark, copy, read receipts and unread badges.

## Search

`MessageSearchPanel` (⌘/Ctrl accessible from the chat header) provides instant
results with highlighted matches, filters (files, images, links, mentions,
bookmarks), recent searches (localStorage) and full keyboard navigation
(↑/↓/Enter/Esc).

## Performance

- Dynamic-height windowing (`hooks/useVirtualList.ts`) for long threads
  (`VirtualizationThreshold` = 50 messages).
- Infinite scroll: older messages load when the user scrolls to the top.
- React Query caching with `placeholderData` (seed fallback), optimistic sends
  with temp-id acknowledgement, memoized selectors.

## Testing

```bash
npm test -- src/test/chatSlice.test.ts src/test/chatMessage.test.tsx
npm test -- src/test/conversationList.test.tsx src/test/messageComposer.test.tsx
npm test -- src/test/messageSearch.test.tsx src/test/notificationCenter.test.tsx
npm test -- src/test/announcements.test.tsx src/test/presence.test.tsx src/test/chatSocket.test.ts
```

## Voice & Video

The header exposes call / video / screen-share actions and the composer includes a
voice recorder — the UI layer is ready; wire the meeting provider
(session-service `MeetingInfo`) to go live.
