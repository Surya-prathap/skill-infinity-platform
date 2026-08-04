import type { MeetingDevice, MeetingError } from '@/types';

export interface MediaResult {
  stream: MediaStream | null;
  error: MeetingError | null;
}

const isDomException = (error: unknown): error is DOMException =>
  error instanceof DOMException || (error as { name?: string })?.name !== undefined;

/** Maps getUserMedia failures to premium, human-readable error states. */
export const mediaErrorMessage = (error: unknown): MeetingError => {
  const name = isDomException(error) ? error.name : '';
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        code: 'permission-denied',
        title: 'Camera & microphone blocked',
        message: 'Allow camera and microphone access in your browser settings, then try again.',
      };
    case 'NotFoundError':
    case 'OverconstrainedError':
      return {
        code: 'device-not-found',
        title: 'No device found',
        message: 'We couldn’t find a camera or microphone. Connect one and refresh the device list.',
      };
    case 'NotReadableError':
    case 'AbortError':
      return {
        code: 'device-in-use',
        title: 'Device is in use',
        message: 'Another app is using your camera or microphone. Close it and try again.',
      };
    default:
      return {
        code: 'unknown',
        title: 'Media unavailable',
        message: 'Your browser could not access media devices in this environment.',
      };
  }
};

const mediaConstraints = (
  audio: boolean,
  video: boolean,
  audioDeviceId?: string,
  videoDeviceId?: string,
): MediaStreamConstraints => ({
  audio: audio
    ? audioDeviceId && audioDeviceId !== 'default'
      ? { deviceId: { exact: audioDeviceId }, echoCancellation: true, noiseSuppression: true }
      : { echoCancellation: true, noiseSuppression: true }
    : false,
  video: video
    ? videoDeviceId && videoDeviceId !== 'default'
      ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
      : { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
    : false,
});

export const startLocalMedia = async (
  audio = true,
  video = true,
  devices: { audioDeviceId?: string; videoDeviceId?: string } = {},
): Promise<MediaResult> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      stream: null,
      error: {
        code: 'unsupported',
        title: 'Media not supported',
        message: 'This browser or environment does not expose media devices.',
      },
    };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      mediaConstraints(audio, video, devices.audioDeviceId, devices.videoDeviceId),
    );
    return { stream, error: null };
  } catch (error) {
    return { stream: null, error: mediaErrorMessage(error) };
  }
};

export const getDisplayMedia = async (): Promise<MediaResult> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    return {
      stream: null,
      error: { code: 'unsupported', title: 'Screen sharing unavailable', message: 'This browser does not support screen sharing.' },
    };
  }
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 15 } },
      audio: false,
    });
    return { stream, error: null };
  } catch (error) {
    if (isDomException(error) && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
      return {
        stream: null,
        error: { code: 'share-cancelled', title: 'Screen share cancelled', message: 'You closed the share picker without selecting a screen.' },
      };
    }
    return { stream: null, error: mediaErrorMessage(error) };
  }
};

export const stopStream = (stream: MediaStream | null): void => {
  stream?.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      /* already stopped */
    }
  });
};

export const enumerateMediaDevices = async (): Promise<{ devices: MeetingDevice[]; error: MeetingError | null }> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
    return { devices: [], error: { code: 'unsupported', title: 'Devices unavailable', message: 'Media devices are not exposed in this environment.' } };
  }
  try {
    const raw = await navigator.mediaDevices.enumerateDevices();
    const devices: MeetingDevice[] = raw
      .filter((device) => device.kind === 'audioinput' || device.kind === 'audiooutput' || device.kind === 'videoinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || (device.kind === 'audioinput' ? 'Microphone' : device.kind === 'videoinput' ? 'Camera' : 'Speaker'),
        kind: device.kind,
      }));
    return { devices, error: null };
  } catch (error) {
    return { devices: [], error: mediaErrorMessage(error) };
  }
};

export const getNetworkType = (): string => {
  const connection = (navigator as { connection?: { effectiveType?: string } }).connection;
  return connection?.effectiveType ?? (navigator.onLine ? 'wifi' : 'offline');
};

/* ============================================================
   Audio level meter — real speaking detection via Web Audio API
   ============================================================ */

export class AudioLevelMeter {
  context: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  data: Uint8Array | null = null;
  raf = 0;
  onLevel: (level: number) => void;

  constructor(stream: MediaStream, onLevel: (level: number) => void) {
    this.onLevel = onLevel;
    try {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.context = new AudioCtx();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 512;
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      const source = this.context.createMediaStreamSource(stream);
      source.connect(this.analyser);
    } catch {
      /* audio metering unavailable */
    }
  }

  start(): void {
    if (!this.analyser || !this.data) return;
    const tick = (): void => {
      if (this.analyser && this.data) {
        const buf = new Uint8Array(this.data);
        this.analyser.getByteFrequencyData(buf);
        const length = buf.length;
        let sum = 0;
        for (let index = 0; index < length; index += 1) {
          sum += buf[index] ?? 0;
        }
        const level = length > 0 ? sum / length / 255 : 0;
        this.onLevel(Math.min(1, level * 1.6));
      }
      this.raf = window.requestAnimationFrame(tick);
    };
    this.raf = window.requestAnimationFrame(tick);
  }

  stop(): void {
    window.cancelAnimationFrame(this.raf);
    this.context?.close().catch(() => undefined);
    this.context = null;
    this.analyser = null;
    this.data = null;
  }
}
