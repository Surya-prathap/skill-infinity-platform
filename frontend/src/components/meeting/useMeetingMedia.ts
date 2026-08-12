import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setControl, setDevices, setDevicesList, setMeetingError, updateLocal } from '@/store/slices/meetingSlice';
import { selectMeetingControls, selectMeetingDevices, selectMeetingError } from '@/store/selectors';
import { AudioLevelMeter, enumerateMediaDevices, getDisplayMedia, startLocalMedia, stopStream } from '@/webrtc';
import { showInfo } from '@/utils';
import type { MeetingDevice, MeetingError } from '@/types';

interface UseMeetingMediaResult {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  audioLevel: number;
  error: MeetingError | null;
  startMedia: () => Promise<void>;
  stopMedia: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
  switchDevice: (kind: 'audioinput' | 'videoinput', deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
}

export const useMeetingMedia = (): UseMeetingMediaResult => {
  const dispatch = useAppDispatch();
  const controls = useAppSelector(selectMeetingControls);
  const devices = useAppSelector(selectMeetingDevices);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const meterRef = useRef<AudioLevelMeter | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);
  const error = useAppSelector(selectMeetingError);

  const applyLevels = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const videoTracks = streamRef.current.getVideoTracks();
      dispatch(
        updateLocal({
          audioEnabled: controls.micOn && audioTracks.some((track) => track.enabled),
          videoEnabled: controls.camOn && videoTracks.some((track) => track.enabled),
        }),
      );
    }
  }, [controls.micOn, controls.camOn, dispatch]);

  const startMedia = useCallback(async (): Promise<void> => {
    const result = await startLocalMedia(true, true, {
      audioDeviceId: devices.audioInput,
      videoDeviceId: devices.videoInput,
    });
    if (result.error) {
      dispatch(setMeetingError(result.error));
      return;
    }
    if (result.stream) {
      // Release any previously acquired tracks before adopting the new stream.
      if (streamRef.current && streamRef.current !== result.stream) {
        stopStream(streamRef.current);
      }
      streamRef.current = result.stream;
      setLocalStream(result.stream);
      dispatch(setMeetingError(null));
      // Apply the current toggle state to the freshly acquired tracks so a
      // muted join (or a camera/mic switched off before joining) actually
      // stops capturing — no hidden camera LED or live mic while muted.
      result.stream.getAudioTracks().forEach((track) => {
        track.enabled = controls.micOn;
      });
      result.stream.getVideoTracks().forEach((track) => {
        track.enabled = controls.camOn;
      });
      applyLevels();
      // Live audio level meter for the premium speaking indicator.
      meterRef.current?.stop();
      meterRef.current = new AudioLevelMeter(result.stream, setAudioLevel);
      meterRef.current.start();
    }
  }, [devices.audioInput, devices.videoInput, controls.micOn, controls.camOn, dispatch, applyLevels]);

  const stopMedia = useCallback(() => {
    meterRef.current?.stop();
    meterRef.current = null;
    stopStream(streamRef.current);
    stopStream(screenRef.current);
    streamRef.current = null;
    screenRef.current = null;
    setLocalStream(null);
    setScreenStream(null);
    setAudioLevel(0);
  }, []);

  useEffect(() => () => stopMedia(), [stopMedia]);

  /* ---------------- Toggles ---------------- */

  const toggleMic = useCallback(() => {
    const next = !controls.micOn;
    dispatch(setControl({ key: 'micOn', value: next }));
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
  }, [controls.micOn, dispatch]);

  const toggleCamera = useCallback(() => {
    const next = !controls.camOn;
    dispatch(setControl({ key: 'camOn', value: next }));
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
  }, [controls.camOn, dispatch]);

  const toggleScreenShare = useCallback(async (): Promise<void> => {
    if (screenRef.current) {
      stopStream(screenRef.current);
      screenRef.current = null;
      setScreenStream(null);
      dispatch(setControl({ key: 'screenSharing', value: false }));
      return;
    }
    const result = await getDisplayMedia();
    if (result.error) {
      if (result.error.code !== 'share-cancelled') dispatch(setMeetingError(result.error));
      return;
    }
    if (result.stream) {
      screenRef.current = result.stream;
      setScreenStream(result.stream);
      dispatch(setControl({ key: 'screenSharing', value: true }));
      dispatch(
        updateLocal({
          screenSharing: true,
        }),
      );
      result.stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenRef.current = null;
        setScreenStream(null);
        dispatch(setControl({ key: 'screenSharing', value: false }));
        dispatch(updateLocal({ screenSharing: false }));
      });
      showInfo('You are presenting your screen');
    }
  }, [dispatch]);

  /* ---------------- Device switching ---------------- */

  const switchDevice = useCallback(
    async (kind: 'audioinput' | 'videoinput', deviceId: string): Promise<void> => {
      dispatch(setDevices(kind === 'audioinput' ? { audioInput: deviceId } : { videoInput: deviceId }));
      if (streamRef.current) {
        await startMedia();
      }
    },
    [dispatch, startMedia],
  );

  const refreshDevices = useCallback(async (): Promise<void> => {
    const { devices: list, error } = await enumerateMediaDevices();
    if (!error && list.length > 0) {
      dispatch(setDevicesList(list));
    }
  }, [dispatch]);

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  return {
    localStream,
    screenStream,
    isScreenSharing: controls.screenSharing,
    audioLevel,
    error,
    startMedia,
    stopMedia,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    switchDevice,
    refreshDevices,
  };
};

/** Formats the device list for the settings pickers. */
export const groupDevices = (devices: MeetingDevice[]): {
  audioInputs: MeetingDevice[];
  videoInputs: MeetingDevice[];
  audioOutputs: MeetingDevice[];
} => ({
  audioInputs: devices.filter((device) => device.kind === 'audioinput'),
  videoInputs: devices.filter((device) => device.kind === 'videoinput'),
  audioOutputs: devices.filter((device) => device.kind === 'audiooutput'),
});

export const FALLBACK_STATS = {
  latencyMs: 0,
  packetLoss: 0,
  bitrateKbps: 0,
  fps: 0,
  resolution: '—',
  connectionType: 'wifi',
  quality: 'good' as const,
};
