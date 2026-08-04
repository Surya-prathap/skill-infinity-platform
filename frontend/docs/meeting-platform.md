# Enterprise Meeting Platform

## Overview

The Enterprise Meeting Platform is a premium, production-ready video/voice calling experience built into the Skill Infinity platform. It rivals Google Meet, Zoom, and Microsoft Teams with a polished UI, real-time WebRTC integration, and seamless integration with the existing Communication Center and Session Booking modules.

## Architecture

### Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/meetings` | `MeetingsPage` | Meeting hub — upcoming meetings grid, instant meeting creation |
| `/meet/:meetingId` | `MeetingPage` | Full-screen meeting (waiting room → live room) |

### State management

The meeting state lives in `store/slices/meetingSlice.ts` (Redux) which manages:

- **Meeting** — metadata (title, kind, host, schedule)
- **Status** — `scheduled → waiting → connecting → in-progress → ended`
- **Participants** — live roster with audio/video/speaking/presence state
- **Controls** — mic, camera, screen share, hand raise, recording, captions, PiP
- **Devices** — selected camera/mic/speaker + enumerated device list
- **Connection** — status (`connected | disconnected | reconnecting`) + quality
- **Stats** — latency, packet loss, bitrate, FPS, resolution
- **Messages** — in-meeting chat with reactions and pinning
- **Reactions** — floating emoji reactions

### Feature module

`features/meeting/` provides:

- **`queryKeys.ts`** — React Query key factory
- **`data.ts`** — seed meetings, demo participants, fallback device list
- **`hooks.ts`** — `useMeetingQuery`, `useUpcomingMeetingsQuery`, `useJoinMeeting`, `useMeetingError`, `useDeviceSettingsMutation`, `useResolveMeeting`

### WebRTC layer (`webrtc/`)

| Module | Description |
|--------|-------------|
| `media.ts` | `startLocalMedia`, `getDisplayMedia`, `enumerateMediaDevices`, `AudioLevelMeter` |
| `peer.ts` | `PeerConnectionManager` — RTCPeerConnection per remote participant, offer/answer/ICE, media control, cleanup |
| `simulation.ts` | `SimulatedMeetingDriver` — lifelike offline demo: participants join, speak, react, chat, stats tick |

### Socket signaling (`socket/meetingSocket.ts`)

Connects to the backend communication-service via Socket.IO for:

- `meeting:join` / `meeting:leave` — participant presence
- `meeting:state` — audio/video/screen/hand state changes
- `meeting:signal` — WebRTC offer/answer/ICE-candidate exchange

When the backend is unreachable, the platform falls back to the `SimulatedMeetingDriver`.

## Key Components

| Component | Description |
|-----------|-------------|
| `WaitingRoom` | Pre-join lobby with camera preview, mic test, network check, join buttons |
| `MeetingRoom` | Orchestrator — header, grid/stage, floating controls, panels, reactions, dialog |
| `MeetingHeader` | Title, call timer, participant count, connection badge, layout switcher, panel toggles |
| `MeetingControls` | Floating glass control bar — mic, camera, screen share, participants, chat, reactions, hand, recording, captions, PiP, leave |
| `ParticipantGrid` | Adaptive grid — gallery, speaker, compact, pinned-focus layouts |
| `ParticipantTile` | Video/avatar tile with speaking ring, muted/camera-off/hand-raised/pinned badges, connection quality dot, role label |
| `ScreenShareStage` | Presentation layout: large screen + side column of presenter + audience |
| `ParticipantPanel` | Slide-in participant list with search, role badges, status icons, pin action |
| `MeetingChat` | Slide-in in-meeting chat with emoji reactions, pinning, message list |
| `ReactionOverlay` | Floating animated emoji reactions + quick-reaction bar |
| `DeviceSettingsPanel` | Camera preview, mic/camera toggle, device selectors, speaker test |
| `CallQualityPanel` | Live stats: latency, packet loss, bitrate, FPS, resolution, network type, reconnection banner |
| `LeaveMeetingDialog` | Premium leave/end confirmation dialog |
| `ConnectionBadge` | Network quality pill with animated pulse |
| `CallTimer` | Live elapsed-time chip |

## Layouts

The meeting room supports these visual layouts:

- **Gallery** — grid of equal-sized participant tiles (auto-columns based on count)
- **Speaker** — active speaker large + audience thumbnails
- **Compact** — smaller tiles for dense calls
- **Pinned** — pinned participant large + audience thumbnails
- **Presentation** — shared screen large + side column (when screen sharing is active)

## Integration Points

### Communication Center

The `ChatHeader` in the Communication Center now has working voice/video call buttons that navigate to `/meet/:meetingId`, creating an instant meeting.

### Session Booking

The `SessionDetailsPage` meeting link button opens the platform's meeting room.

### Demo / Offline behavior

When the backend signaling socket is unavailable:

1. The `SimulatedMeetingDriver` joins demo participants (Sarah, James, Maya, David, Priya)
2. Participants take turns speaking (with animated indicators)
3. Periodic emoji reactions float across the screen
4. Chat messages appear from demo participants
5. Realistic call stats update every 2.2 seconds
6. Network quality occasionally degrades to test the reconnection UI

## Reusable Hooks

| Hook | Description |
|------|-------------|
| `useMeetingMedia` | Local camera/mic/screen-share streams, device switching, audio meter, toggle mic/camera/screen |
| `useMeetingQuery` | Fetch a single meeting by ID |
| `useUpcomingMeetingsQuery` | Fetch upcoming meetings list |
| `useSessionMeetingQuery` | Fetch meeting link for a session |
| `useJoinMeeting` | `join` (enters meeting), `leave` (pause), `end` (reset all) |
| `useMeetingError` | Current meeting error + clear function |
| `useDeviceSettingsMutation` | Save device preferences |
| `useResolveMeeting` | Silent meeting fetch (for URL-based join) |

## Testing

Test files:
- `src/test/meetingSlice.test.ts` — Redux reducer tests (setMeeting, joinMeeting, participantJoined, etc.)
- `src/test/meetingComponents.test.tsx` — Component tests (controls, tiles, grid, dialogs, waiting room, panels, etc.)
- `src/test/meetingSocket.test.ts` — Socket emitter tests

Run all meeting tests:
```bash
npx vitest run src/test/meetingSlice.test.ts src/test/meetingComponents.test.tsx src/test/meetingSocket.test.ts
```

## Development Notes

- The `PeerConnectionManager` is production-ready but requires a signaling server. In demo mode, the simulation driver provides the experience.
- `AudioLevelMeter` uses the Web Audio API (`AnalyserNode`) for real-time speaking detection.
- The `erasableSyntaxOnly` TypeScript setting means `private`/`public` keywords are not allowed in class fields; use underscore-prefixed convention instead.
- All panels use `AnimatePresence` for smooth slide-in/out transitions.
- Framer Motion `layout` prop enables smooth participant grid reordering.