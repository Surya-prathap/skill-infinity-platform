import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MeetingControls } from '@/components/meeting/MeetingControls';
import { ParticipantTile } from '@/components/meeting/ParticipantTile';
import { ParticipantGrid } from '@/components/meeting/ParticipantGrid';
import { ConnectionBadge } from '@/components/meeting/ConnectionBadge';
import { CallTimer } from '@/components/meeting/CallTimer';
import { LeaveMeetingDialog } from '@/components/meeting/LeaveMeetingDialog';
import { WaitingRoom } from '@/components/meeting/WaitingRoom';
import { ParticipantPanel } from '@/components/meeting/ParticipantPanel';
import { ScreenShareStage } from '@/components/meeting/ScreenShareStage';
import { CallQualityPanel } from '@/components/meeting/CallQualityPanel';
import { DeviceSettingsPanel } from '@/components/meeting/DeviceSettingsPanel';
import type { Meeting, MeetingParticipant } from '@/types';
import type { MeetingControls as Controls } from '@/store/slices/meetingSlice';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

const makeStore = (preloaded?: Record<string, unknown>) =>
  configureStore({
    reducer: {
      meeting: (state = {
        meetingId: 'm-test',
        meeting: null,
        status: 'in-progress' as const,
        participants: [],
        layout: 'gallery' as const,
        fullscreen: false,
        controls: {
          micOn: true, camOn: true, screenSharing: false, handRaised: false,
          recording: false, captionsOn: false, pip: false, statsOpen: false,
          chatOpen: false, participantsOpen: false, reactionsOpen: false,
          settingsOpen: false,
        },
        devices: { audioInput: 'default', audioOutput: 'default', videoInput: 'default' },
        devicesList: [],
        connection: { status: 'connected' as const, quality: 'good' as const },
        stats: { latencyMs: 24, packetLoss: 0.2, bitrateKbps: 1400, fps: 28, resolution: '1280×720', connectionType: 'wifi', quality: 'excellent' as const },
        messages: [],
        reactions: [],
        pinnedId: null,
        spotlightId: null,
        startedAt: null,
        unreadChat: 0,
        error: null,
        ...preloaded,
      }, _action: unknown) => state,
    },
  });

const renderWithProviders = (ui: React.ReactElement, store = makeStore()) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={darkTheme}>
        {ui}
      </ThemeProvider>
    </Provider>,
  );

const dummyParticipant: MeetingParticipant = {
  id: 'user-1', name: 'Alex Morgan', firstName: 'Alex', lastName: 'Morgan',
  role: 'LEARNER', isLocal: true, audioEnabled: true, videoEnabled: false,
  screenSharing: false, isSpeaking: false, handRaised: false,
  connectionQuality: 'excellent', joinedAt: new Date().toISOString(),
};

const dummyRemote: MeetingParticipant = {
  id: 'remote-1', name: 'Sarah Chen', firstName: 'Sarah', lastName: 'Chen',
  role: 'MENTOR', isLocal: false, audioEnabled: true, videoEnabled: true,
  screenSharing: false, isSpeaking: true, handRaised: false,
  connectionQuality: 'good', joinedAt: new Date().toISOString(),
};

describe('MeetingControls', () => {
  it('renders all control buttons', () => {
    const controls: Controls = {
      micOn: true, camOn: true, screenSharing: false, handRaised: false,
      recording: false, captionsOn: false, pip: false, statsOpen: false,
      chatOpen: false, participantsOpen: false, reactionsOpen: false,
      settingsOpen: false,
    };
    renderWithProviders(
      <MeetingControls
        controls={controls}
        isHost={false}
        isScreenSharing={false}
        unreadChat={0}
        onToggleMic={() => {}} onToggleCamera={() => {}} onToggleScreenShare={() => {}}
        onToggleParticipants={() => {}} onToggleChat={() => {}} onToggleReactions={() => {}}
        onToggleHand={() => {}} onToggleRecording={() => {}} onToggleCaptions={() => {}}
        onTogglePip={() => {}} onLeave={() => {}}
      />,
    );
    expect(screen.getByLabelText('Mute')).toBeTruthy();
    expect(screen.getByLabelText('Turn camera off')).toBeTruthy();
    expect(screen.getByLabelText('Present screen')).toBeTruthy();
    expect(screen.getByLabelText('Participants')).toBeTruthy();
    expect(screen.getByLabelText('Chat')).toBeTruthy();
    expect(screen.getByLabelText('Reactions')).toBeTruthy();
    expect(screen.getByLabelText('Raise hand')).toBeTruthy();
    expect(screen.getByLabelText('Leave meeting')).toBeTruthy();
  });

  it('shows muted state', () => {
    const controls: Controls = {
      micOn: false, camOn: true, screenSharing: false, handRaised: false,
      recording: false, captionsOn: false, pip: false, statsOpen: false,
      chatOpen: false, participantsOpen: false, reactionsOpen: false,
      settingsOpen: false,
    };
    renderWithProviders(
      <MeetingControls
        controls={controls}
        isHost={false}
        isScreenSharing={false}
        unreadChat={0}
        onToggleMic={() => {}} onToggleCamera={() => {}} onToggleScreenShare={() => {}}
        onToggleParticipants={() => {}} onToggleChat={() => {}} onToggleReactions={() => {}}
        onToggleHand={() => {}} onToggleRecording={() => {}} onToggleCaptions={() => {}}
        onTogglePip={() => {}} onLeave={() => {}}
      />,
    );
    expect(screen.getByLabelText('Unmute')).toBeTruthy();
  });

  it('shows host controls when isHost is true', () => {
    const controls: Controls = {
      micOn: true, camOn: true, screenSharing: false, handRaised: false,
      recording: false, captionsOn: false, pip: false, statsOpen: false,
      chatOpen: false, participantsOpen: false, reactionsOpen: false,
      settingsOpen: false,
    };
    renderWithProviders(
      <MeetingControls
        controls={controls}
        isHost={true}
        isScreenSharing={false}
        unreadChat={0}
        onToggleMic={() => {}} onToggleCamera={() => {}} onToggleScreenShare={() => {}}
        onToggleParticipants={() => {}} onToggleChat={() => {}} onToggleReactions={() => {}}
        onToggleHand={() => {}} onToggleRecording={() => {}} onToggleCaptions={() => {}}
        onTogglePip={() => {}} onLeave={() => {}}
      />,
    );
    expect(screen.getByLabelText('Record')).toBeTruthy();
  });
});

describe('ParticipantTile', () => {
  it('renders participant name', () => {
    renderWithProviders(<ParticipantTile participant={dummyParticipant} />);
    expect(screen.getByText(/Alex Morgan/)).toBeTruthy();
  });

  it('shows (You) for local participant', () => {
    renderWithProviders(<ParticipantTile participant={dummyParticipant} />);
    expect(screen.getByText(/You/)).toBeTruthy();
  });

  it('shows muted badge when audio is disabled', () => {
    const muted = { ...dummyParticipant, audioEnabled: false };
    renderWithProviders(<ParticipantTile participant={muted} />);
    expect(screen.getByTestId('muted-badge')).toBeTruthy();
  });

  it('shows hand raised badge', () => {
    const raised = { ...dummyParticipant, handRaised: true };
    renderWithProviders(<ParticipantTile participant={raised} />);
    expect(screen.getByTestId('hand-raised-badge')).toBeTruthy();
  });

  it('shows speaking indicator', () => {
    const speaking = { ...dummyRemote, isSpeaking: true };
    renderWithProviders(<ParticipantTile participant={speaking} />);
    expect(screen.getByTestId('speaking-indicator')).toBeTruthy();
  });
});

describe('ParticipantGrid', () => {
  it('renders participants in a grid', () => {
    renderWithProviders(
      <ParticipantGrid participants={[dummyParticipant, dummyRemote]} layout="gallery" pinnedId={null} />,
    );
    expect(screen.getByTestId('participant-grid')).toBeTruthy();
    expect(screen.getByText(/Alex Morgan/)).toBeTruthy();
    expect(screen.getByText(/Sarah Chen/)).toBeTruthy();
  });
});

describe('ConnectionBadge', () => {
  it('renders quality label', () => {
    renderWithProviders(<ConnectionBadge quality="excellent" />);
    expect(screen.getByText('Excellent')).toBeTruthy();
  });

  it('shows latency when provided', () => {
    renderWithProviders(<ConnectionBadge quality="good" latencyMs={42} />);
    expect(screen.getByText('42ms')).toBeTruthy();
  });
});

describe('CallTimer', () => {
  it('renders timer with startedAt', () => {
    renderWithProviders(<CallTimer startedAt={new Date().toISOString()} />);
    const timer = screen.getByRole('timer');
    expect(timer).toBeTruthy();
  });
});

describe('LeaveMeetingDialog', () => {
  it('renders dialog when open', () => {
    renderWithProviders(
      <LeaveMeetingDialog open={true} isHost={false} onClose={() => {}} onLeave={() => {}} onEnd={() => {}} />,
    );
    expect(screen.getByText('Leave this meeting?')).toBeTruthy();
    expect(screen.getByTestId('confirm-leave')).toBeTruthy();
  });

  it('shows host warning when isHost', () => {
    renderWithProviders(
      <LeaveMeetingDialog open={true} isHost={true} onClose={() => {}} onLeave={() => {}} onEnd={() => {}} />,
    );
    expect(screen.getByText(/ending the meeting disconnects everyone/)).toBeTruthy();
  });

  it('calls onLeave when confirm is clicked', async () => {
    const onLeave = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <LeaveMeetingDialog open={true} isHost={false} onClose={() => {}} onLeave={onLeave} onEnd={() => {}} />,
    );
    await user.click(screen.getByTestId('confirm-leave'));
    expect(onLeave).toHaveBeenCalledOnce();
  });
});

describe('WaitingRoom', () => {
  const meeting: Meeting = {
    id: 'm-test', title: 'Test Meeting', kind: 'session',
    hostId: 'host-1', hostName: 'Host User', status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  it('renders meeting info and join buttons', () => {
    renderWithProviders(<WaitingRoom meeting={meeting} onJoin={() => {}} />);
    expect(screen.getByTestId('waiting-room')).toBeTruthy();
    expect(screen.getByText('Test Meeting')).toBeTruthy();
    expect(screen.getByTestId('join-now')).toBeTruthy();
    expect(screen.getByTestId('join-muted')).toBeTruthy();
  });

  it('shows camera preview', () => {
    renderWithProviders(<WaitingRoom meeting={meeting} onJoin={() => {}} />);
    expect(screen.getByTestId('waiting-camera-preview')).toBeTruthy();
  });
});

describe('ParticipantPanel', () => {
  it('renders participant list', () => {
    renderWithProviders(
      <ParticipantPanel participants={[dummyParticipant, dummyRemote]} onClose={() => {}} onPin={() => {}} pinnedId={null} />,
    );
    expect(screen.getByTestId('participant-panel')).toBeTruthy();
    expect(screen.getByText(/Alex Morgan/)).toBeTruthy();
    expect(screen.getByText(/Sarah Chen/)).toBeTruthy();
  });
});

describe('ScreenShareStage', () => {
  it('renders presenter info', () => {
    renderWithProviders(
      <ScreenShareStage presenter={dummyRemote} presentersStream={null} otherParticipants={[dummyParticipant]} />,
    );
    expect(screen.getByTestId('screen-share-stage')).toBeTruthy();
    expect(screen.getByText(/Sarah Chen is presenting/)).toBeTruthy();
  });
});

describe('CallQualityPanel', () => {
  it('renders call stats', () => {
    renderWithProviders(<CallQualityPanel onClose={() => {}} />);
    expect(screen.getByTestId('call-quality-panel')).toBeTruthy();
    expect(screen.getByText(/Connection/)).toBeTruthy();
  });
});

describe('DeviceSettingsPanel', () => {
  it('renders device settings', () => {
    const store = makeStore();
    renderWithProviders(<DeviceSettingsPanel onClose={() => {}} />, store);
    expect(screen.getByTestId('device-settings')).toBeTruthy();
    expect(screen.getByText(/Device settings/)).toBeTruthy();
  });
});